import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import schema from "../../../app/functions/hello-world/schema";

const logger = Logger.getInstance();

const lambdaHandler = async (_event, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('This is an INFO log with some context');
    const name = getNameFromPayload(_event);
    return formatJSONResponse({
        message: `Hello ${name}, welcome to the exciting Serverless world!`,
        _event,
    });
};

export const getNameFromPayload = (event) => {
    logger.info('Entering into <getNameFromPaylaod>');
    let name = null;
    if (event.body && event.body.name) {
        name = event.body.name;
    } else {
        throw new Error('Missing Required Property');
    }
    logger.info('Exiting from <getNameFromPaylaod>');
    return name;
}
export const helloHandler = new HandlerWrapper().jsonBodyParse().schemaValidator({inputSchema: schema}).cors().get(lambdaHandler);