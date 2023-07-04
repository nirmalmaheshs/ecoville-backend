import {Logger as PowerToolsLogger} from "@aws-lambda-powertools/logger";
import {LogLevel} from "@aws-lambda-powertools/logger/lib/types";

export const enum LOG_LEVELS {
    FATAL = 'FATAL',
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    TRACE = 'TRACE'
}

export class Logger {
    private static instance: PowerToolsLogger;

    /**
     * The static method that controls the access to the singleton instance.
     *
     * This implementation let you subclass the Singleton class while keeping
     * just one instance of each subclass around.
     */
    public static getInstance(
        opts = {level: LOG_LEVELS.DEBUG, scrubbing: true}
    ): PowerToolsLogger {
        if (!Logger.instance) {
            Logger.instance = new PowerToolsLogger(
                {
                    logLevel: opts.level as LogLevel,

                }
            );
            Logger.instance.removeKeys([
                "password",
                "Authorization",
                "Connection",
                "AccessKey",
                "dt-password",
                "AccessToken",
                "RefreshToken",
                "IdToken",
                "authKey",
                "accessToken",
                "previousPassword",
                "proposedPassword",
                "X-Amz-Security-Token",
                "cdnCred",
                "secretsKey",
                "secretsKey_uat",
                "webhookKey",
            ]);
        }
        return Logger.instance;
    }
}



