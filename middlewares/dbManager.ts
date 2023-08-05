import { Sequelize } from 'sequelize-typescript';
import { Logger } from '../libs/logger';
import mysql2 from 'mysql2';
import { decamelize } from 'humps';
import { DbConnectionError } from "./exceptionHandler";

const defaults = {
    dbCreds: undefined,
    tokenExpiresAt: undefined
}

const log = Logger.getInstance();

export const dbManager = (opts = {}) => {
    const options = { ...defaults, ...opts }

    const connect = async (request) => {

        log.debug('dbManager. using direct connection: ', request.context.dbCred);
        options.dbCreds = request.context.dbCred;
        const { connection } = await DbManagerInternal.getConnection(options);
        request.context.dbConnection = connection;

    }

    const close = async (request) => {
        if (request.context.dbConnection) {
            request.context.dbConnection.close();
        }
    }

    return {
        before: connect,
        after: close,
        onError: close,
    }
}

/**
 * DbConfig
 */
class DbManagerInternal {

    /**
     * To get both reader and writer connections.
     */
    public static getConnection(params: any = {}): Promise<{ connection: Sequelize }> {
        return new Promise(async (resolve, reject) => {
            try {
                log.debug('dbManager. Get connections');
                let connection: Sequelize;
                log.debug('dbManager. Getting writer connection');
                // TODO[maxyms]: check if db connection works with SSL to enable semgrep rule back
                connection = new Sequelize({ // nosemgrep: javascript.sequelize.security.audit.sequelize-enforce-tls.sequelize-enforce-tls
                    database: params.dbCreds.database,
                    username: params.dbCreds.username,
                    dialect: 'mysql',
                    password: params.dbCreds.password,
                    port: params.dbCreds.port,
                    host: params.dbCreds.host,
                    benchmark: true,
                    ssl: true,
                    dialectModule: mysql2,
                    dialectOptions: {
                        ssl: {
                            minVersion: 'TLSv1.2',
                            rejectUnauthorized: true
                        }
                    },
                    logging: (msg) => log.debug(`Sequelize: ${msg}`),
                });
                this.init(connection);
                resolve({ connection });
            } catch (error) {
                log.warn('dbManager. Error Occurred while crating the db connection! %o', error)
                reject(new DbConnectionError({ errorMessage: error?.message }));
            }
        })
    }


    /**
     * init method
     */
    private static init(con: Sequelize) {
        log.debug('dbManager. Entering <init>');
        con.addHook('beforeDefine', attributes => {
            Object.keys(attributes).forEach(key => {
                if (typeof attributes[key] !== 'function') {
                    /* tslint:disable:no-string-literal */
                    attributes[key]['field'] = decamelize(key);
                    /* tslint:enable:no-string-literal */
                }
            });
        });
        log.debug('dbManager. Exiting <init>');
    }

}
