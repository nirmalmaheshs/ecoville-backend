import type { MiddyfiedHandler } from "@middy/core";
import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import middySecretsManager from "@middy/secrets-manager";
import middyCORS from "@middy/http-cors";
import validator from "@middy/validator";
import { customExceptionHandler } from "./exceptionHandler";
import sqsJsonBodyParser from "@middy/sqs-json-body-parser";
import {injectLambdaContext} from '@aws-lambda-powertools/logger';
import {captureLambdaHandler} from '@aws-lambda-powertools/tracer';
import {Logger} from "../libs/logger";
import { tracer } from "../libs/tracer";
import {dbManager} from "./dbManager";

class HandlerWrapper {
  private _useJsonBodyParser = false;
  private _jsonBodyParserOpts;

  private _useSecretsManager = false;
  private _secretsManagerOpts;

  private _useCORS = false;
  private _corsOpts;

  private _validatorOpts;
  private _validatorUse = false;

  private _sqsBodyParser = false;
  private _errorHandlerUse = true;

  private _dbManagerUse = false;
  private _dbManagerOpts;

  /**
   * Enable Json Body Parser middy middleware for the current lambda handler wrapper instance
   */
  public jsonBodyParse(opts: Parameters<typeof middyJsonBodyParser>[0] = {}) {
    this._useJsonBodyParser = true;
    this._jsonBodyParserOpts = opts;
    return this;
  }

  /**
   * Enable Secrets Manager middy middleware for the current lambda handler wrapper instance
   */
  public secretsManager(opts: {secretsName: string}) {
    const ssmOpts = {
      fetchData: {
        dbCred: opts.secretsName,
      },
      awsClientOptions: {
        region: process.env.REGION || 'us-east-1'
      },
      setToContext: true,
      disablePrefetch: true
    };
    this._useSecretsManager = true;
    this._secretsManagerOpts = ssmOpts;
    return this;
  }

  dbManager(opts = {}) {
    this._dbManagerOpts = opts;
    this._dbManagerUse = true;
    return this;
  }

  /**
   * Enable CORS middy middleware for the current lambda handler wrapper instance
   */
  public cors(_opts: Parameters<typeof middyCORS>[0] = {}) {
    this._useCORS = true;
    return this;
  }

  /**
   * To enable the schema validator with the help of the OpenAPI Spec.
   * @param opts
   * @returns
   */
  schemaValidator(opts = {inputSchema: null}) {
    this._validatorOpts = opts;
    this._validatorUse = true;
    return this;
  }

  sqsBodyParser() {
    this._sqsBodyParser = true;
    return this;
  }

  CustomErrorHandler(enabled = true) {
    this._errorHandlerUse = enabled;
    return this;
  }

  public get(f): MiddyfiedHandler {
    const _middy = middy(f).use(injectLambdaContext(Logger.getInstance()));

    if (this._useJsonBodyParser) {
      _middy.use(middyJsonBodyParser(this._jsonBodyParserOpts));
    }

    if (this._sqsBodyParser) {
      _middy.use(sqsJsonBodyParser());
    }

    if (this._useSecretsManager) {
      _middy.use(middySecretsManager(this._secretsManagerOpts));
    }

    if (this._dbManagerUse) {
      _middy.use(dbManager(this._dbManagerOpts));
    }

    if (this._errorHandlerUse) {
      _middy.use(customExceptionHandler());
    }

    if (this._validatorUse) {
      _middy.use(validator(this._validatorOpts));
    }

    if (this._useCORS) {
      _middy.use(middyCORS(this._corsOpts));
    }

    return _middy.use(captureLambdaHandler(tracer, {captureResponse: false}));
  }
}

export default HandlerWrapper;
