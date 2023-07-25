import createHttpError from "http-errors";
import { IError, IErrorOptions } from "../libs/types/error.bean";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ERROR_TYPES,
} from "../libs/constants/exception.constants";
import { HTTP_STATUS_CODES } from "../libs/constants/http.constants";
import {Logger} from "../libs/logger";

const log = Logger.getInstance();
/**
 * Custom Error Class which is used to throw custom errors
 */
export default class Error {
  private error: IError = {};
  private defaults: IErrorOptions = {
    errorType: "SystemException",
    statusCode: 500,
  };

  constructor(opts: IErrorOptions) {
    opts = { ...this.defaults, ...opts };
    this.error.errorCode = opts.errorCode;
    this.error.errorMessage = opts.errorMessage;
    this.error.errorType = opts.errorType;
    this.error.errorData = opts.errorData;
    this.error.statusCode = opts.statusCode;
    this.createError(opts);
  }

  /**
   * This function will create an error by using http-errors
   * @param opts IErrorOptions
   */
  private createError = (opts: IErrorOptions) => {
    return createHttpError(opts.statusCode, JSON.stringify(this.error));
  };
}

export class ResourceNotFoundException extends Error {
  constructor(opts: IErrorOptions = {}) {
    super({
      errorType: ERROR_TYPES.BUSINESS_EXCEPTION,
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      errorCode: ERROR_CODES.RESOURCE_NOT_FOUND,
      errorMessage: opts.errorMessage,
    });
  }
}

export class MissingParameterError extends Error {
  constructor(opts: IErrorOptions = {}) {
    super({
      errorType: ERROR_TYPES.BUSINESS_EXCEPTION,
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      errorCode: opts.errorCode
          ? opts.errorCode
          : ERROR_CODES.VALIDATION_FAILED,
      errorMessage: opts.errorMessage,
      errorData: opts.errorData,
    });
  }
}
/**
 * Error Handler to handle the exceptions.
 */
export const customExceptionHandler = () => {
  log.error("Error found");
  const handleError = async (request) => {
    if (request.error.message === "Event object failed validation") {
      let errorMessages: string[] = [];
      // TODO: propagate actual validation error

      if (request.error.details) {
        errorMessages = request.error.details.map((validation) => {
          const key = validation.instancePath.replace(/\//g, ".");
          let message = validation.message;
          if (
            validation.message.includes(
              `must match pattern "^[A-Za-z0-9](?:[\\w.,\\s-]*[\\w.,-])?$"`
            )
          ) {
            message = `must be valid string`;
          }
          const details =
            "enum" === validation.keyword
              ? ` [${validation.params.allowedValues.join(",")}]`
              : "";
          return `${key} ${message}${details}`;
        });
      } else {
        errorMessages.push("Missing required parameter in the request body.");
      }
      const index = errorMessages.indexOf(` must match "then" schema`);
      if (index > -1) {
        errorMessages.splice(index, 1);
      }
      console.log("I am here");
      request.error = new MissingParameterError({
        errorMessage: errorMessages.join(","),
      });
      console.log("Check Flag: ",request.error);
    }
    if (!isValidJsonString(request.error.error)) {
      console.log("Check Flag3 : ",request.error);
      // request.error.statusCode = request.error.statusCode;
      request.error.message = JSON.stringify({message: request.error});
    } else {
      console.log("Check Flag2 : ",request.error.message);
      const errorPayload = JSON.parse(request.error.message);
      /**
       * If there is no error message and there is a error code
       * adding the default error message for the specific error code.
       */
      if (
        !errorPayload?.errorMessage &&
        errorPayload.errorCode &&
        ERROR_MESSAGES[errorPayload.errorCode]
      ) {
        log.debug("Error message not found!!!, adding default error message.");
        errorPayload.errorMessage = ERROR_MESSAGES[errorPayload.errorCode];
        request.error.message = JSON.stringify(errorPayload);
      }
    }

    const response = {
      body: request.error.message,
      statusCode: request.error.statusCode ? request.error.statusCode : 500,
      headers: {
        "Content-Type": "application/json",
      },
    };
    console.log("Request: ", JSON.stringify(request));
    request.response = response;
    addErrorLogsForTracing(request);
  };

  return {
    onError: handleError,
  };
};

const addErrorLogsForTracing = (request) => {
  // Printing additional logs if error code not found or the status code if system error
  if (
    Object.keys(request.error).length === 0 ||
    request.error.statusCode >= 500
  ) {
    delete request.event?.headers?.Authorization;
    delete request.event?.multiValueHeaders?.Authorization;
    log.error(
      "Error occurred while processing the request. Request: %o, Error : %o",
      request,
      request.error
    );
  } else {
    log.error(
      "Error occurred while processing the request Error: %o",
      request.error
    );
  }
};



/**
 * To validate the given error payload is JSON
 * @param content error payload
 */
const isValidJsonString = (content) => {
  try {
    JSON.parse(content);
    return true;
  } catch (e) {
    return false;
  }
};
