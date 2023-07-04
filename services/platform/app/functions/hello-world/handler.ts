import type { ValidatedEventAPIGatewayProxyEvent } from '../../../../../libs/apiGateway';
import { formatJSONResponse } from '../../../../../libs/apiGateway';
import schema from './schema';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    return formatJSONResponse({
        message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
        event,
    });
}
export const helloHandler = new HandlerWrapper().jsonBodyParse().cors().get(hello);