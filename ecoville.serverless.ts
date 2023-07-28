import type {AWS} from '@serverless/typescript';

import {hello, getJobsHandler, dataLoader} from './services/ecoville/app';
type AWSCustom = AWS & {
    resources: AWS["resources"] | string[];
    provider: AWS["provider"] | (AWS["provider"] & AWS["provider"]["region"]);
};
const serverlessConfiguration: AWSCustom = {
    service: 'hackerJob',
    frameworkVersion: '3',
    plugins: [
        'serverless-esbuild',
        'serverless-deployment-bucket',
        'serverless-prune-plugin',
        'serverless-dotenv-plugin',
        'serverless-offline'
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
                executionLogging: false,
            },
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        lambdaHashingVersion: '20201221',
    },
    // import the function via paths
    functions: {hello,getJobsHandler, dataLoader},
    package: {individually: true},
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
            define: {'require.resolve': undefined},
            platform: 'node',
            concurrency: 10,
        },
        authorizerId: {
            "Ref": "ApiGatewayAuthorizer"
        }
    },
    resources: [
        "${file(./services/ecoville/infra-assets/lambda-role.yml)}",
        "${file(./services/ecoville/infra-assets/cognito.yml)}",
    ]
};

module.exports = serverlessConfiguration;
