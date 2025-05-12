#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStack} from "../lib/lambdaStack";


const app = new cdk.App();
new LambdaStack(app, 'LambdaStack', {
 });
