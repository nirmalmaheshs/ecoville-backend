import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {getJobMetaData} from "../../../../../libs/openai/jobProcesser";

const mysql = require("mysql2/promise");
const axios = require("axios");
const logger = Logger.getInstance();
const _ = require("lodash");
let dbConnection = null;
const {ratio} = require("fuzzball");
const technologies_languages_frameworks = ["Python", "JavaScript", "Java", "C++", "C#", "Ruby", "PHP", "Go (Golang)", "Swift", "Kotlin", "TypeScript", "Rust", "Dart", "Scala", "R", "MATLAB", "Lua", "Perl", "Objective-C", "Bash", "PowerShell", "React", "Angular", "Vue.js", "Django", "Ruby on Rails", "ASP.NET", "Laravel", "Express.js", "Spring Framework", "Flask", "Node.js", "React Native", "Flutter", "Xamarin", "Ionic", "NativeScript", "TensorFlow", "Keras", "PyTorch", "SciPy", "Pandas", "NumPy", "Scikit-learn", "Bootstrap", "Material-UI", "Semantic UI", "Tailwind CSS", "Foundation", "Bulma", "Node.js", "ASP.NET Core", "Ruby on Rails", "Django", "Express.js", "Flask", "Spring Boot",
    "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Oracle", "SQLAlchemy", "Django ORM", "Hibernate", "Docker", "Kubernetes", "AWS (Amazon Web Services)", "Microsoft Azure", "Google Cloud Platform (GCP)", "Heroku", "DigitalOcean", "Vagrant", "Ansible", "Terraform", "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack", "Jupyter", "GraphQL", "RESTful API", "OAuth", "JSON", "XML", "Webpack", "Babel", "ESLint", "Prettier", "Selenium", "JUnit", "Mocha", "Jest", "Cucumber", "Gulp", "Grunt", "Socket.IO", "ZeroMQ", "Apache Kafka", "RabbitMQ", "Swagger", "OpenAPI", "Postman", "New Relic", "Prometheus", "Grafana", "ELK Stack (Elasticsearch, Logstash, Kibana)"]
const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <get-jobs.lambdaHandler>');
    let data;
    let field;
    dbConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DBNAME,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });

    [data, field] = await dbConnection.query("select config_value from system_configs where config_name = 'JOB_POINTER';")
    const lastRecordInDb = Number(data[0].config_value);
    // const lastRecordInDb = 34982532;
    const lastRecordInHackerRank = Number(await getLatestRecordFromHackerNews());
    const idsToBeScanned = range(lastRecordInDb, lastRecordInHackerRank);
    console.log("The records to be processed: ", Number(lastRecordInHackerRank) - Number(lastRecordInDb));
    const chunks = _.chunk(idsToBeScanned, 1000);
    for (const chunk of chunks) {
        const hiringPosts = await findHiringStory(chunk[0], chunk[chunk.length - 1]);
        if (hiringPosts.length) {
            for (const hiringPost of hiringPosts) {
                await processHiringPost(hiringPost);
            }
        } else {
            console.log("No Hiring Post Found...");
        }
        console.log("Updating system pointer: ", chunk[chunk.length - 1]);
        await dbConnection.query("UPDATE hacker_jobs_analytics.system_configs t SET t.config_value = ? WHERE t.id = 1;", [chunk[chunk.length - 1]]);
    }
    return formatJSONResponse({
        data: Number(lastRecordInHackerRank) - Number(lastRecordInDb),
    });
};

async function processHiringPost(parentPost) {
    console.log("Processing the hiring Post: ", parentPost);
    try {
        // const parentPost = await getItem(postId);
        await dbConnection.query("INSERT INTO hacker_jobs_analytics.hacker_news_job_post (id, `by`, text, time, type, url, score, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", [parentPost.id, parentPost.by, parentPost.text, new Date(parentPost.time * 1000), parentPost.type, parentPost.url, parentPost.score, parentPost.title]);
    } catch (error) {
        if (error.message.includes("Duplicate entry")) {
            // Ignoring the error
            console.log("Duplicate entry found. Ignoring the error");
        } else if (error.message.includes("connection is in closed")) {
            dbConnection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DBNAME,
                ssl: {
                    minVersion: 'TLSv1.2',
                    rejectUnauthorized: true
                }
            });
        } else {
            throw error;
        }
    }
    const promises = [];
    parentPost.kids.forEach((kid) => {
        promises.push(getItem(kid));
    });
    let kidsData = await Promise.all(promises);
    console.log("Total Kids: ", kidsData.length);
    let existingRecords= await dbConnection.query("SELECT id FROM hacker_jobs_analytics.jobs WHERE jobs.parent_id = ?", [parentPost.id]);
    existingRecords = existingRecords[0];
    existingRecords = existingRecords.map((record) => record.id);
    console.log(existingRecords);
    console.log("Typeof ", existingRecords);
    kidsData = kidsData.filter((kid) => !existingRecords.includes(kid.id));
    console.log("Kids After Filter: ", kidsData.length);
    for (const kid of kidsData) {
        try {
            await dbConnection.query("INSERT INTO hacker_jobs_analytics.jobs (id, parent_id, text, time, type, is_meta_extracktted, latest_error) VALUES (?, ?, ?, ?, ?, 0, null);", [kid.id, parentPost.id, kid.text, new Date(kid.time * 1000), kid.type])
            const response = await getJobMetaData(kid.text);
            await loadDataToMetaDataTable(kid, response, dbConnection);
        } catch (error) {
            if (error.message.includes("Duplicate entry")) {
                // Ignoring the error
                console.log("Duplicate entry found found on meta data. Ignoring the error");
            } else if (error.message.includes("connection is in closed")) {
                dbConnection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    user: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DBNAME,
                    ssl: {
                        minVersion: 'TLSv1.2',
                        rejectUnauthorized: true
                    }
                });
            } else {
                throw error;
            }
        }
    }
}

async function findHiringStory(startingPosition, endingPosition) {
    const idsToBeScanned = range(startingPosition, endingPosition);
    console.log(`Scanning - Start: ${startingPosition} , End: ${endingPosition}`);
    const promises = [];
    idsToBeScanned.forEach((item) => {
        promises.push(getItem(item));
    });
    const records = await Promise.all(promises);
    const hiringPosts = [];
    records.forEach((item) => {
        if (item.type === 'story' && item.by === 'whoishiring' && item.title.includes('Ask HN: Who is')) {
            hiringPosts.push(item);
        }
    });
    return hiringPosts;
}

const getItem = async (itemId) => {
    const res = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`);
    return res.data;
}

function range(start, end) {
    if (typeof start !== 'number' || typeof end !== 'number') {
        throw new Error('Both start and end should be numbers.');
    }

    if (start > end) {
        throw new Error('Start should be less than or equal to the end.');
    }

    const result = [];
    for (let num = start; num <= end; num++) {
        result.push(num);
    }

    return result;
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

const loadDataToMetaDataTable = async (jobKid, response, connection) => {
    try {

        if (!response || response.length < 1) {
            throw new Error('Empty or null response. Response: ' + response);
        }

        if (isValidJSON(response)) {
            const jsonResponse = JSON.parse(response);
            console.log("Loading Data For ", jobKid.id);
            console.log("Open AI Response:  ", jsonResponse);
            const techStack = jsonResponse.techStack
                ? {technologies: jsonResponse.techStack}
                : jsonResponse.tech_stacks ? {technologies: jsonResponse.tech_stacks} : {technologies: []};
            const refinedTech = [];
            for (const tech of techStack.technologies) {
                for (const techKnowledge of technologies_languages_frameworks) {
                    if (ratio(tech, techKnowledge) > 80) {
                        refinedTech.push(tech);
                    }
                }
            }
            techStack.technologies = refinedTech;

            const dataSet = {
                id: jobKid.id,
                company: jsonResponse.company ? jsonResponse.company : 'Nil',
                tech_stacks: JSON.stringify(techStack),
                url: jsonResponse.url ? jsonResponse.url : 'No Url',
                title: jsonResponse.jobtitle ?
                    Array.isArray(jsonResponse.jobtitle) ? jsonResponse.jobtitle[0] : jsonResponse.jobtitle
                    : 'No Title',
                location: jsonResponse.location ?
                    Array.isArray(jsonResponse.location) ? jsonResponse.location[0] : jsonResponse.location
                    : 'No Location'
            }
            console.log("DataSet: ", dataSet);
            const insertQuery = 'INSERT INTO hacker_jobs_analytics.job_meta_data (id, company, tech_stacks, url, title, location) VALUES (?, ?, ?, ?, ?, ?)';
            const [result] = await connection.query(insertQuery, [dataSet.id, dataSet.company, dataSet.tech_stacks, dataSet.url, dataSet.title, dataSet.location]);
            await connection.query(`UPDATE jobs
                                    SET is_meta_extracktted = ?
                                    WHERE id = ?`, [1, jobKid.id]);

        } else {
            throw new Error('Not a valid JSON. Check the prompt: ' + response)
        }
        ;
    } catch (error) {
        console.log("Error: ", error);
        console.log("Response: ", response);
        await connection.query(`UPDATE jobs
                                SET latest_error = ?
                                WHERE id = ?`, [error.message, jobKid.id])
    }
}

async function getLatestRecordFromHackerNews() {
    const res = await axios.get('https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty');
    return res.data;
}

export const dataLoaderHandler = new HandlerWrapper().jsonBodyParse().cors().get(lambdaHandler);