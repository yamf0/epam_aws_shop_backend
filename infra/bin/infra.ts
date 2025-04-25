#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {LambdaDefinitions} from "../lib/lambda-functions";

const app = new cdk.App();

new LambdaDefinitions(app, 'LambdaDefinitions', {})