import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {UserResumes} from "../../../../../libs/dao/entities/hacker-news.model";
import {Sequelize} from "sequelize-typescript";

const logger = Logger.getInstance();
const axios = require("axios");
const default_prompt = `The above profile is the resume data. Get me the number of years of experience, techstacks, fullName, current role, company. The response should be in the following JSON format. {fullName:'',company:'', experienceL<number>, techStacks: [], role:''}. Return JSON only.`;
const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <get-resume-request.lambdaHandler>');
    const db: Sequelize = _context.dbConnection;
    db.addModels([UserResumes]);
    // Set params
    const body: any = _event.queryStringParameters;
    const userResume = await UserResumes.findOne({
        raw: true,
        nest: true,
        where: {
            jobId: body.resumeId
        }
    });

    if (!userResume) {
        throw new Error('No Job Found!')
    }

    if (userResume.status === 'IN_PROGRESS') {
        throw new Error("Job In Progress");
    }
    let response = null;
    let metaData: any = {
        fullName: null,
        company: null,
        experience: null,
        techStacks: [],
        role: null
    };
    if (userResume.metaStatus === 'NOT_STARTED') {
        const prompt = userResume.response_lines + ` ${default_prompt}`;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const data = {
            messages: [
                {role: 'user', content: prompt}
            ],
            max_tokens: 200,
            model: 'gpt-3.5-turbo',
            temperature: 0.8,
        };
        const headers = {
            'Authorization': `Bearer ${_context.dbCred.open_api_key}`,
            'Content-Type': 'application/json',
        };
        response = await axios.post(apiUrl, data, {headers});

        const isValidJson = isValidJSON(response.data.choices[0].message.content);
        const openAiRes: any = JSON.parse(response.data.choices[0].message.content);
        console.log("ISValidJson: ", openAiRes);
        if (isValidJson) {
            metaData.fullName = openAiRes.fullName && openAiRes.fullName.length > 1 ? openAiRes.fullName : null;
            metaData.company = openAiRes.company && openAiRes.company.length > 1 ? openAiRes.company : null;
            metaData.experience = openAiRes.experience && !isNaN(openAiRes.experience) ? openAiRes.experience : null;
            metaData.techStacks = openAiRes.techStacks && openAiRes.techStacks.length > 1 ? openAiRes.techStacks : null;
            metaData.role = openAiRes.role && openAiRes.role.length > 1 ? openAiRes.role : null;
        }

        await UserResumes.update({meta: metaData, metaStatus: 'SUCCEEDED'}, {
            where: {
                jobId: body.resumeId
            }
        })
    } else {
        metaData = userResume.meta
    }

    return formatJSONResponse({
        data: metaData,
    });
};

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

export const getResumeMetaHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);