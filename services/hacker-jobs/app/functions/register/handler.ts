import { formatJSONResponse } from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import { Logger } from "../../../../../libs/logger";
import { APIGatewayEvent } from "aws-lambda";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

const logger = Logger.getInstance();
const cognitoClient = new CognitoIdentityProviderClient({"region": "us-east-1"});

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <register.lambdaHandler>');
    const body: any  = _event.body;
    const command = new SignUpCommand({
        ClientId: process.env.APP_CLIENT_ID,
        Username: body.username, Password: body.password,
        UserAttributes: [
            {
                Name: "email",
                Value: body.username
            }
        ]
    })
    const response = await cognitoClient.send(command);
    return formatJSONResponse({
        response,
    });
};

export const registrationHandler = new HandlerWrapper().jsonBodyParse().secretsManager({ secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials` }).dbManager().cors().get(lambdaHandler);