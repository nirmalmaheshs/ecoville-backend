import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import schema from "../../../app/functions/get-jobs/schema";
import {APIGatewayEvent} from "aws-lambda";

const mysql = require("mysql2/promise");
const logger = Logger.getInstance();

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <get-jobs.lambdaHandler>');
    let data;
    let field;
    const connection = await mysql.createConnection({
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
    const body = _event.queryStringParameters;
    let whereQuery = ``;
    let params = [];
    if (body.jobTitle) {
        whereQuery += `and job_meta_data.title like '%${body.jobTitle}%'`;
    }
    if (body.techStack) {
        whereQuery += `and JSON_EXTRACT(job_meta_data.tech_stacks, '$.technologies') LIKE '%${body.techStack}%'`;
    }
    if (body.from) {
        whereQuery += `and jobs.time >= '${body.from}'`;
    }
    if (body.to) {
        whereQuery += `and jobs.time <= '${body.to}'`;
    }
    let query = `select hacker_news_job_post.id   as primaryJobId,
                        job_meta_data.id          as jobId,
                        job_meta_data.company     as company,
                        job_meta_data.tech_stacks as tech_stack,
                        job_meta_data.url         as url,
                        job_meta_data.location,
                        job_meta_data.title,
                        jobs.text                 as jobDesc,
                        jobs.time                 as createdAt
                 from hacker_news_job_post,
                      job_meta_data,
                      jobs
                 where hacker_news_job_post.id = jobs.parent_id
                   and jobs.id = job_meta_data.id ${whereQuery}
                 order by hacker_news_job_post.time
                 limit ${body.limit} offset ${body.offset};`;
    [data, field] = await connection.query(query, params);
    // data = groupArrayObject(data)
    return formatJSONResponse({
        data,
        _event,
    });
};

const groupArrayObject = (array) => {
    return array.reduce((group, arr) => {
        const {primaryJobId} = arr;
        group[primaryJobId] = group[primaryJobId] ?? [];
        group[primaryJobId].push(arr);
        return group;
    }, {});
}

export const getJobsHandler = new HandlerWrapper().jsonBodyParse().schemaValidator({inputSchema: schema}).cors().get(lambdaHandler);