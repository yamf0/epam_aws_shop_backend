import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {ProductModel} from "./model/ProductModel";
import {Code, Runtime} from "aws-cdk-lib/aws-lambda";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export let getProductsListFunction : lambda.Function;
export let getProductByIdFunction : lambda.Function;

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, 'NodeLayer', {
      code: Code.fromAsset('./lib/layer'),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      layerVersionName: "NodeLayer",
    })

    getProductsListFunction = new lambda.Function(this, 'getProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'productService.getProducts',
      code: lambda.Code.fromAsset('./service'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        PRODUCT_TABLE_NAME: "products",
        STOCK_TABLE_NAME: "stock",
        LOG_LEVEL: 'INFO',
      },
      logRetention: RetentionDays.ONE_DAY,
      layers: [layer],
    });

    getProductByIdFunction = new lambda.Function(this, 'getProductByIdFunction', {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'productService.getProductById',
        code: lambda.Code.fromAsset('./service'),
      timeout: cdk.Duration.seconds(30),
      environment: {
          PRODUCT_TABLE_NAME: "products",
          STOCK_TABLE_NAME: "stock",
        LOG_LEVEL: 'INFO',
      },
      logRetention: RetentionDays.ONE_DAY,
      layers: [layer],
    });

    const createProductFunction = new lambda.Function(this, 'createProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'productService.createProduct',
      code: lambda.Code.fromAsset('./service'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        PRODUCT_TABLE_NAME: "products",
        LOG_LEVEL: 'INFO',
      },
      logRetention: RetentionDays.ONE_DAY,
      layers: [layer],
    });


    // API GateWay
    const api = new apigateway.RestApi(this, "shop-api", {
      restApiName: "Shop API Gateway",
      description: "This API serves the Lambda functions."
    });

    api.addModel("ProductModel", ProductModel)

    const createProductIntegration = new apigateway.LambdaIntegration(createProductFunction, {
      integrationResponses: [
        {
          statusCode: "201",
          responseTemplates: {
            'application/json': '$input.json("$")'
          },
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          }
        }
      ],
      requestTemplates: {
        'application/json': JSON.stringify({
          body: '$util.escapeJavaScript($input.body)',
          headers: {
            'Content-Type': "'application/json'"
          }
        })
      },
      proxy: false
    })

    const getProductsListIntegration = new apigateway.LambdaIntegration(getProductsListFunction, {
      integrationResponses:[
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '$input.json("$")'
          },
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          }
        }
        ],
      proxy: false
    });

    const getProductByIdIntegration = new apigateway.LambdaIntegration(getProductByIdFunction, {
      requestTemplates: {
        // Extract 'productId' from the path and send it as JSON to Lambda
        'application/json': '{ "productId": "$input.params(\'productId\')" }'
      },
      integrationResponses: [
        {
          // Successful response (200 OK)
          statusCode: '200',
          responseTemplates: {
            // Lambda returns the product object directly
            'application/json': '$input.json("$")'
          },
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          }
        },
        {
          // Map the "Not Found" error thrown by Lambda
          // Selection pattern looks for '[404]' in the Lambda error message
          selectionPattern: '^\\[404\\].*', // Regex for errors starting with '[404]'
          statusCode: '404',
          responseTemplates: {
            'application/json': JSON.stringify({ message: 'Product not found.' })
          },
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          }
        }
        ],
      proxy: false,
    });


    // Create a resource /product and GET request under it
    const productsResource = api.root.addResource("products");
    const productByIdResource = productsResource.addResource("{productId}");
    // On this resource attach a GET method which pass request to our Lambda function
    productsResource.addMethod('GET', getProductsListIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true, // Enable CORS header
          },
        }
      ]
    });
    productsResource.addMethod('POST', createProductIntegration, {
      methodResponses: [
        {
          statusCode: '201',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          }
        }
      ],
    })
    productByIdResource.addMethod('GET', getProductByIdIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
        {
          statusCode: '404', // Declare that 404 is a possible response
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        }],
    });

    // --- Output ---

    new cdk.CfnOutput(this, 'ApiUrlOutput', {
      value: api.url,
      description: 'The base URL for the Products API',
    });

    // Dynamo Stack
    const productsTable = dynamodb.Table.fromTableName(
        this,
        'ImportedProductsTable',
        'products'  // The actual table name in AWS
    );
    const stockTable = dynamodb.Table.fromTableName(
        this,
        'ImportedStockTable',
        'stock'
    )

    productsTable.grantReadData(getProductsListFunction);
    stockTable.grantReadData(getProductsListFunction);
    productsTable.grantReadData(getProductByIdFunction);
    stockTable.grantReadData(getProductByIdFunction);
    productsTable.grantWriteData(createProductFunction);
  }
}
