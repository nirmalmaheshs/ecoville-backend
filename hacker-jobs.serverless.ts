import type { AWS } from '@serverless/typescript';

import {
    hello,
    getJobsHandler,
    dataLoader,
    s3PreSignUrlGenerator,
    submitResumeParseRequest,
    getResumeParseRequest,
    getResumeMeta
} from './services/hacker-jobs/app';
type AWSCustom = AWS & {
    resources: AWS["resources"] | string[];
    provider: AWS["provider"] | (AWS["provider"] & AWS["provider"]["region"]);
};
const serverlessConfiguration: AWSCustom = {
    service: 'hacker-job',
    frameworkVersion: '3',
    plugins: [
        'serverless-esbuild',
        'serverless-deployment-bucket',
        'serverless-prune-plugin',
        'serverless-dotenv-plugin',
        'serverless-offline',
    ],
    useDotenv: true,
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
        stage: "${opt:stage, 'dev'}",
        region: 'us-east-1',
        role: "DefaultLambdaIAMRole",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        tracing: {
            lambda: 'Active',
            apiGateway: true,
        },
        logs: {
            restApi: {
                executionLogging: true,
            },
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            RESUME_BUCKET: { "Ref" : "ResumeBucket" },
            USER_POOL_ID: { "Ref" : "UserPool" },
            APP_CLIENT_ID: { "Ref" : "UserPoolClient"},
        },
        lambdaHashingVersion: '20201221',
    },
    // import the function via paths
    functions: { hello, getJobsHandler, dataLoader, s3PreSignUrlGenerator, submitResumeParseRequest, getResumeParseRequest, getResumeMeta },
    package: { individually: true },
    custom: {
        prune: {
            automatic: true,
            includeLayers: true,
            number: 5,
        },
        esbuild: {
            bundle: true,
            minify: true,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node14',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
        authorizerId: {
            "Ref": "ApiGatewayAuthorizer"
        }
    },
    resources: [
        "${file(./services/hacker-jobs/infra-assets/lambda-role.yml)}",
        "${file(./services/hacker-jobs/infra-assets/cognito.yml)}",
        "${file(./services/hacker-jobs/infra-assets/secrets-manager.yml)}",
        "${file(./services/hacker-jobs/infra-assets/s3.yml)}",
    ]
};

module.exports = serverlessConfiguration;