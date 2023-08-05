import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {GetDocumentAnalysisCommand, TextractClient} from "@aws-sdk/client-textract";
import {UserResumes} from "../../../../../libs/dao/entities/hacker-news.model";
import {Sequelize} from "sequelize-typescript";

const logger = Logger.getInstance();

const texTractClient = new TextractClient({region: 'us-east-1'});

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <get-resume-request.lambdaHandler>');
    const db:Sequelize =_context.dbConnection;
    db.addModels([UserResumes]);
    // Set params
    const body: any = _event.queryStringParameters;
    let tryCount = 1;
    const userResume = await UserResumes.findOne({
        raw: true,
        nest: true,
        where: {
            jobId: body.jobId
        }
    });
    console.log("User Resumes");
    console.log(userResume);
    let jobStatus = null;
    if (userResume) {
        if (userResume.status === 'SUCCEEDED') {
            console.log("Check Check");
            jobStatus = {
                jobId: body.jobId,
                status: "SUCCEEDED"
            }
        }
        while (!jobStatus || jobStatus.JobStatus === "IN_PROGRESS" && tryCount < 3) {
            const jobStatusCommand = new GetDocumentAnalysisCommand({JobId: body.jobId});
            jobStatus = await texTractClient.send(jobStatusCommand);
            logger.info("Job In progress Waiting for 2seconds");
            await sleep(4000);
            jobStatus = await texTractClient.send(jobStatusCommand);
            tryCount += 1;
        }

        if (tryCount >= 3) {
            jobStatus = {
                jobId: body.jobId,
                status: "IN_PROGRESS"
            }
        }

        let lines: any = '';
        if (jobStatus.JobStatus === "SUCCEEDED" || jobStatus.JobStatus === "PARTIAL_SUCCESS") {
            const linesArray = jobStatus.Blocks.filter((block) => block.BlockType === "LINE");
            lines = linesArray.map((lineBlock) => lineBlock.Text);
            lines = lines.join("\n");
            await UserResumes.update({
                status: "SUCCEEDED",
                response_json: jobStatus,
                response_lines: lines
            }, {
                where: {
                    jobId: body.jobId
                }
            })
        }
    } else {
        throw new Error('No Job Found.');
    }

    return formatJSONResponse({
        data: jobStatus,
    });
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export const getResumeParseRequestHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);