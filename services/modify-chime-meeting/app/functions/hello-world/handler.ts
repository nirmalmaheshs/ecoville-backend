import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import schema from "../../../app/functions/hello-world/schema";

const logger = Logger.getInstance();

const lambdaHandler = async (_event, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('This is an INFO log with some context');
    return formatJSONResponse({
        message: `Hello ${_event.body.name}, welcome to the exciting Serverless world!`,
        _event,
    });
};
export const helloHandler = new HandlerWrapper().jsonBodyParse().schemaValidator({inputSchema: schema}).cors().get(lambdaHandler);