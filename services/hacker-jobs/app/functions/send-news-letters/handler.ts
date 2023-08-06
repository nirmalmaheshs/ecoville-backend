import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {Sequelize} from "sequelize-typescript";
import {Op} from "sequelize";
import {JobMetaData, NewsLetters, Users} from "../../../../../libs/dao/entities/hacker-news.model";
import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";

const ses = new SESClient({region: "us-east-1"});
const handlebars = require('handlebars');

const logger = Logger.getInstance();

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <newsletter.lambdaHandler>');
    const _db: Sequelize = _context.dbConnection;
    _db.addModels([NewsLetters, Users, JobMetaData]);
    const newsLetterUsers = await NewsLetters.findAll({raw: true, nest: true});
    for (const newsLetterUser of newsLetterUsers) {
        let res: any = {};
        const techStackFilters = [];

        for (const stack of newsLetterUser.config.techStacks) {
            techStackFilters.push(Sequelize.literal(`JSON_CONTAINS(tech_stacks->'$.technologies', '["${stack}"]')`))
        }
        techStackFilters.push({title: newsLetterUser.config.role});

        res.jobs = await JobMetaData.findAll({
            where: {
                [Op.or]: techStackFilters,
                [Op.not]: {
                    title: 'No Title'
                }
            },
            limit: 10,
            raw: true,
            nest: true
        });
        res.user = newsLetterUser;
        console.log("Sending Email For User: ", res.user);
        await sendEmail(res);
    }

    return formatJSONResponse({
        data: "Email Processed Successfully",
    });
};

const sendEmail = async (data) => {
    const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>{{subject}}</title>
        </head>
        <body>
            <h4>Hello, {{name}}!</h4>
            <p>Here is the jobs based on your resume:</p>
            <ul>
                {{#each jobs}}
                <li>{{title}} at {{company}}</li>
                {{/each}}
            </ul>
        </body>
        </html>
        `;

    const compiledTemplate = handlebars.compile(emailTemplate);
    const context = {
        subject: 'HackerJobs - NewsLetter',
        name: data.user.config.fullName,
        jobs: data.jobs
    };

    const emailContent = compiledTemplate(context);


    const command = new SendEmailCommand({
        Destination: {
            ToAddresses: [data.user.config.email],
        },
        Message: {
            Body: {
                Html: {Data: emailContent},
            },

            Subject: {Data: "Hacker Jobs - Express | Personalized | Weekly Newsletter"},
        },
        Source: "indrapranesh2111@gmail.com",
    });
    try {
        let response = await ses.send(command);
        console.log("Email Response: ", response);
        return response;
    } catch (error) {
        console.log("Error: ", error);
    }


    return emailContent;
}


export const newsLetterHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);