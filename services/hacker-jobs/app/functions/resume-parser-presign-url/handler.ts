import { formatJSONResponse } from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import { Logger } from "../../../../../libs/logger";
import { APIGatewayEvent } from "aws-lambda";
import { S3Client, PutObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const logger = Logger.getInstance();


const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <resume-parser-presign-url.lambdaHandler>');
    const client = new S3Client({ region: 'us-east-1' });
    const res = await client.send(new ListBucketsCommand({}));
    console.log(res);
    const command = new PutObjectCommand({
        Bucket: process.env.RESUME_BUCKET_NAME,
        Key: _event.queryStringParameters?.fileName,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return formatJSONResponse({
        url,
    });
};

export const presignGeneratorHandler = new HandlerWrapper().jsonBodyParse().secretsManager({ secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials` }).dbManager().cors().get(lambdaHandler);