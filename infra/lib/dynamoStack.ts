import * as cdk from "aws-cdk-lib";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from "constructs";

export class DynamoStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const productsTable = new dynamodb.TableV2(this, 'productsTable', {
            tableName: 'products',
            partitionKey: {
                name: "id", type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "title", type: dynamodb.AttributeType.STRING
            }
        })

        const stockTable = new dynamodb.TableV2(this, 'stockTable', {
            tableName: 'stock',
            partitionKey:{
                name: "product_id", type: dynamodb.AttributeType.STRING
            },
            sortKey:{
                name: "count", type: dynamodb.AttributeType.NUMBER
            }
        })
    }
}