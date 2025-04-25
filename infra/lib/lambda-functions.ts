import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export class LambdaDefinitions extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const getProductsListFunction = new lambda.Function(this, 'getProductsListFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(5),
            handler: 'productApi.getProductsList',
            code: lambda.Code.fromAsset(path.join(__dirname, './')),
        });

        const getProductByIdFunction = new lambda.Function(this, 'getProductByIdFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(5),
            handler: 'productApi.getProductById',
            code: lambda.Code.fromAsset(path.join(__dirname, './')),
        });

        // API GateWay
        const api = new apigateway.RestApi(this, "shop-api", {
            restApiName: "Shop API Gateway",
            description: "This API serves the Lambda functions."
        });

        const getProductsListIntegration = new apigateway.LambdaIntegration(getProductsListFunction, {});
        // Create a resource /product and GET request under it
        const productsResource = api.root.addResource("products");
        const productByIdResource = productsResource.addResource("{productId}");
        // On this resource attach a GET method which pass request to our Lambda function
        productsResource.addMethod('GET', getProductsListIntegration);
        productByIdResource.addMethod('GET', getProductsListIntegration);
    }
}