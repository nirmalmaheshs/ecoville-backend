/**
 * This object will be returned in the HTTP Response altering this object will affect the response structure.
 */
export interface IError {
  errorMessage?: string;
  errorCode?: string | number;
  errorType?: string;
  errorData?: any;
  statusCode?: number;
}

/**
 * ErrorOptions interface to define the possible values and the error structure.
 * We can change this object to change the possible values in the error object.
 */
export interface IErrorOptions {
  errorCode?: string;
  errorMessage?: string;
  errorType?: string;
  statusCode?: number;
  errorData?: any;
}
