import {Tracer} from "@aws-lambda-powertools/tracer";
const tracer = new Tracer();
import AWS from 'aws-sdk';
tracer.captureAWSClient(AWS);
export {tracer};