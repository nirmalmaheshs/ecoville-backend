import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {Sequelize} from "sequelize-typescript";
import {Op} from "sequelize";
import {JobMetaData, NewsLetters, Users} from "../../../../../libs/dao/entities/hacker-news.model";
const logger = Logger.getInstance();

const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <newsletter.lambdaHandler>');
    const _db: Sequelize = _context.dbConnection;
    _db.addModels([NewsLetters, Users, JobMetaData]);
    const newsLetterUsers = await NewsLetters.findAll({raw: true, nest: true});
    let res: any = {};
    for (const newsLetterUser of newsLetterUsers) {
        const techStackFilters = [];

        for (const stack of newsLetterUser.config.techStacks) {
            techStackFilters.push(Sequelize.literal(`JSON_CONTAINS(tech_stacks->'$.technologies', '["${stack}"]')`))
        }
        techStackFilters.push({title: newsLetterUser.config.role});

        res.jobs = await JobMetaData.findAll({
            where: {
                [Op.or]: techStackFilters,
            },
            limit: 10,
            raw: true,
            nest: true
        });
        res.user = newsLetterUser
    }

    return formatJSONResponse({
        data: res,
    });
};


export const newsLetterHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).dbManager().cors().get(lambdaHandler);