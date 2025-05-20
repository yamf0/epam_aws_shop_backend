import * as cdk from "aws-cdk-lib";
import * as s3 from 'aws-cdk-lib/aws-s3';
import {EventType} from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {RetentionDays} from "aws-cdk-lib/aws-logs";

const S3_BUCKET_NAME = 'shop-api-backend-import-bucket';

export class ImportServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, 'importBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Note: only use DESTROY for development
            bucketName: S3_BUCKET_NAME,
            versioned: true,
        });

        const importProductsFile = new lambda.Function(this, 'importProductsFileFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'importService.importProductFile',
            code: lambda.Code.fromAsset('./service'),
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'INFO',
                BUCKET_NAME: S3_BUCKET_NAME,
            },
            logRetention: RetentionDays.ONE_DAY,
        });

        const parseProductsFile = new lambda.Function(this, 'parseProductsFileFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'importService.parseProductFile',
            code: lambda.Code.fromAsset('./service'),
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'INFO',
                BUCKET_NAME: S3_BUCKET_NAME,
            },
            logRetention: RetentionDays.ONE_DAY,
        });

        // API GateWay
        const api = new apigateway.RestApi(this, "shop-api", {
            restApiName: "Shop API Gateway - Import Service",
            description: "This API serves the Lambda functions."
        });

        const importProductsFileIntegration = new apigateway.LambdaIntegration(importProductsFile, {
            integrationResponses: [
                {
                    statusCode: "200",
                    responseTemplates: {
                        'application/json': '$input.json("$")'
                    },
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    }
                }
            ],
            requestTemplates: {
                // Extract 'productId' from the path and send it as JSON to Lambda
                'application/json': '{ "filename": "$input.params(\'filename\')" }'
            },
            proxy: false
        })

        const uploadProductsResource = api.root.addResource("upload");
        const uploadFileResource = uploadProductsResource.addResource("{filename}")
        uploadFileResource.addMethod('GET', importProductsFileIntegration, {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                },
                {
                    statusCode: '500',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                }
            ],
        });
        // S3 integration with lambda
        bucket.addEventNotification(EventType.OBJECT_CREATED,
            new s3n.LambdaDestination(parseProductsFile), {
            prefix: 'uploaded/',
            suffix: 'csv'
        });

        // S3 Permissions
        bucket.grantPut(importProductsFile);
        bucket.grantRead(parseProductsFile);

        /// OUTPUT
        new cdk.CfnOutput(this, 'ApiUrlOutput', {
            value: api.url,
            description: 'The base URL for the Products API',
        });
    }
}
