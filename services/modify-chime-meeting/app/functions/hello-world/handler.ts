import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import schema from "../../../../platform/app/functions/hello-world/schema";

const logger = Logger.getInstance();

const lambdaHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (_event, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('This is an INFO log with some context');
    return formatJSONResponse({
        message: `Hello ${_event.body.name}, welcome to the exciting Serverless world!`,
        _event,
    });
};
export const helloHandler = new HandlerWrapper().jsonBodyParse().cors().get(lambdaHandler);