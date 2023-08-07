import {formatJSONResponse} from '../../../../../libs/apiGateway';
import HandlerWrapper from "../../../../../middlewares/HandlerWrapper";
import {Logger} from "../../../../../libs/logger";
import {APIGatewayEvent} from "aws-lambda";
import {NewsLetters, UserResumes, Users} from "../../../../../libs/dao/entities/hacker-news.model";
import {Sequelize} from "sequelize-typescript";
import {newsLetterRequest} from "./schema";
const { v4: uuidv4 } = require('uuid');

const logger = Logger.getInstance();
const lambdaHandler = async (_event: APIGatewayEvent, _context): Promise<{ body: string; statusCode: number }> => {
    logger.info('Entering into <get-resume-request.lambdaHandler>');
    const db: Sequelize = _context.dbConnection;
    db.addModels([UserResumes, Users, NewsLetters]);
    const body: any = _event.body;
    let user = await Users.findOne({
        raw: true,
        nest: true,
        where: {
            username: body.email
        }
    });

    if (!user) {
        user = await Users.create({
            fullName: body.fullName,
            username: body.email,
            isActive: true,
        });
        user = await Users.findOne({
            raw: true,
            nest: true,
            where: {
                username: body.email
            }
        })
        console.log("USER: ", user)
    }
    let newsLetter = await NewsLetters.findOne({
        raw: true,
        nest: true,
        where: {
            userId: user.id,
        }
    });
    console.log("NEWS: ", newsLetter);
    if (newsLetter) {
        await NewsLetters.update({config: body}, {
            where: {
                userId: user.id
            }
        })
    } else {
        await NewsLetters.create({
            userId: user.id,
            config: body,
            letterId: uuidv4(),
            isActive: true,
        })
    }
    return formatJSONResponse({
        message: 'News Letter Created Successfully!',
    });
};

export const submitNewsLetterRequestHandler = new HandlerWrapper().jsonBodyParse().secretsManager({secretsName: `/${process.env.NODE_ENV}/${process.env.SERVICE}/database/credentials`}).schemaValidator({inputSchema: newsLetterRequest}).dbManager().cors().get(lambdaHandler);