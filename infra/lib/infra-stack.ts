import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunction = new lambda.Function(this, 'getProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'productService.getProducts',
      code: lambda.Code.fromAsset('./lib'),
    });

    const getProductByIdFunction = new lambda.Function(this, 'getProductByIdFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'productService.getProductById',
        code: lambda.Code.fromAsset('./lib'),
        });


    // API GateWay
    const api = new apigateway.RestApi(this, "shop-api", {
      restApiName: "Shop API Gateway",
      description: "This API serves the Lambda functions."
    });

    const getProductsListIntegration = new apigateway.LambdaIntegration(getProductsListFunction, {});
    const getProductByIdIntegration = new apigateway.LambdaIntegration(getProductByIdFunction, {
      requestParameters: {
        'integration.request.path.productId': 'method.request.path.productId',
      },
      integrationResponses: [
        { statusCode: '200' },
        { statusCode: '404' },
      ],
      proxy: false,
    });


    // Create a resource /product and GET request under it
    const productsResource = api.root.addResource("products");
    const productByIdResource = productsResource.addResource("{productId}");
    // On this resource attach a GET method which pass request to our Lambda function
    productsResource.addMethod('GET', getProductsListIntegration);
    productByIdResource.addMethod('GET', getProductByIdIntegration, {
      requestParameters: {
        'method.request.path.productId': true,
      },
      methodResponses: [
        {statusCode: '200'},
        {statusCode: '404'},
      ],
    });

  }
}
