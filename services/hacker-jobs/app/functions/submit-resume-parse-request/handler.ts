import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {TextractClient} from "@aws-sdk/client-textract";
import { StartDocumentAnalysisCommand } from  "@aws-sdk/client-textract";
import {
    StartDocumentAnalysisCommandInput
} from "@aws-sdk/client-textract/dist-types/commands/StartDocumentAnalysisCommand";
import {Sequelize} from "sequelize-typescript";
import {UserResumes} from "../../../../../libs/dao/entities/hacker-news.model";
const logger = Logger.getInstance();

const texTractClient = new TextractClient({region: 'us-east-1'});

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <resume-parser.lambdaHandler>');
    const _db: Sequelize = _context.dbConnection;
    _db.addModels([UserResumes]);

    // Set params
    const body: any = _event.body;
    const params: StartDocumentAnalysisCommandInput = {
        DocumentLocation: {
            S3Object: {
                Bucket: process.env.RESUME_BUCKET_NAME,
                Name: body.resumeId
            },
        },
        FeatureTypes: ['TABLES', 'FORMS'],

    }
    const analyzeDoc = new StartDocumentAnalysisCommand(params);
    const response = await texTractClient.send(analyzeDoc);
    await UserResumes.create({
        path: `${process.env.RESUME_BUCKET_NAME}/${body.resumeId}`,
        jobId: response.JobId
    });
    return formatJSONResponse({
        data: response,
    });
};


export const resumeParserHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);