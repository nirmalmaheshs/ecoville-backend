import {formatJSONResponseWithRedirection} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {Sequelize} from "sequelize-typescript";
import {JobMetaData, Jobs, NewsLetters, Users} from "../../../../../libs/dao/entities/hacker-news.model";

const logger = Logger.getInstance();

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <newsletter.lambdaHandler>');
    const _db: Sequelize = _context.dbConnection;
    _db.addModels([NewsLetters, Users, JobMetaData, Jobs]);
    await NewsLetters.update({
        isActive: false
    }, {
        where: {
            letterId: _event.queryStringParameters.token
        }
    })
    return formatJSONResponseWithRedirection();
}


export const newsLetterUnsubscribeHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);