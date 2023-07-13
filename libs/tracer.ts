import {Tracer} from "@aws-lambda-powertools/tracer";
const tracer = new Tracer();
import * as AWS from 'aws-sdk';
tracer.captureAWS(AWS);
export {tracer};