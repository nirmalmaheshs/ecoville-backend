import { Logger } from "../../../../../libs/logger";
import { formatJSONResponse } from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import { S3 } from 'aws-sdk';

const s3Client = new S3();
const logger = Logger.getInstance();
const responseData: any = {};
const lambdaHandler = async (_event, _context): Promise<any> => {
    logger.info('This is an INFO log with some context');
    logger.info("REQUEST RECEIVED:\n" + JSON.stringify(_event));
    logger.info("Context:\n" + JSON.stringify(_context));
    logger.info("S3 Buckket Name: ", _event.ResourceProperties.BucketName);
    const bucketName = _event.ResourceProperties.BucketName;
    const eventType = _event.RequestType;
    try {
        if (eventType === "Create") {
            logger.info("Creating the bucket..");
            const createBucketResponse = await s3Client.createBucket({
                Bucket: bucketName
            }).promise();
            responseData.bucketName = bucketName;
            await sendResponse(_event, _context, "SUCCESS", responseData);
        } else if (eventType === "Delete") {
            await s3Client.deleteBucket({
                Bucket: bucketName
            }).promise();
        }
    } catch (error) {
        logger.info(error);
        await sendResponse(_event, _context, "FAILED", responseData);
    }
};
export const customResouceHandler = new HandlerWrapper().CustomErrorHandler(false).get(lambdaHandler);



function sendResponse(event, context, responseStatus, responseData) {
    return new Promise((resolve, reject) => {
        var responseBody = JSON.stringify({
            Status: responseStatus,
            Reason:
                "See the details in CloudWatch Log Stream: " + context.logStreamName,
            PhysicalResourceId: context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            Data: responseData,
        });
        logger.info("RESPONSE BODY:\n" + JSON.stringify(responseBody));

        var https = require("https");
        var url = require("url");

        var parsedUrl = url.parse(event.ResponseURL);
        var options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: "PUT",
            headers: {
                "content-type": "",
                "content-length": responseBody.length,
            },
        };

        logger.info("SENDING RESPONSE...\n");
        logger.info("Request Options: ", options);
        var request = https.request(options, function (response) {
            logger.info("STATUS: " + response.statusCode);
            logger.info("HEADERS: " + JSON.stringify(response.headers));
            logger.info("Resolving from the sendResponse");
            context.done();
            resolve(true);
        });

        request.on("error", function (error) {
            logger.info("sendResponse Error:" + error);
            // Tell AWS Lambda that the function execution is done
            context.done();
            reject(error);
        });

        // write data to request body
        request.write(responseBody);
        request.end();
    });
}