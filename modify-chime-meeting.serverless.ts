import type {AWS} from '@serverless/typescript';

import {hello, s3CustomResource} from './services/modify-chime-meeting/app';
type AWSCustom = AWS & {
    resources: AWS["resources"] | string[];
    provider: AWS["provider"] | (AWS["provider"] & AWS["provider"]["region"]);
};
const serverlessConfiguration: AWSCustom = {
    service: 'modify-chime',
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
            lambda: true,
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
            EVENT_BUS_ARN: "${cf:${env:EVENT_BUS_STACK_NAME}-${env:NODE_ENV}.EventBusArn}",
        },
        lambdaHashingVersion: '20201221',
    },
    // import the function via paths
    functions: {hello, s3CustomResource},
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
    },
    resources: [
        "${file(./services/modify-chime-meeting/infra-assets/custom-resource.yml)}",
        "${file(./services/modify-chime-meeting/infra-assets/lambda-role.yml)}",
    ]
};

module.exports = serverlessConfiguration;
