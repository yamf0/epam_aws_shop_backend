#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStack} from "../lib/lambdaStack";
import {DynamoStack} from "../lib/dynamoStack";
import {ImportServiceStack} from "../lib/ImportServiceStack";


const app = new cdk.App();
new LambdaStack(app, 'LambdaStack', {
 });

new DynamoStack(app, 'DynamoStack', {})

new ImportServiceStack(app, 'ImportServiceStack', {})