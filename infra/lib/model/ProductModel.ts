import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export const ProductModel = {
    contentType: 'application/json',
        modelName: 'ProductModel',
        schema: {
            type: apigateway.JsonSchemaType.OBJECT,
            required: ['title', 'description', 'price'],
            properties: {
                title: {
                    type: apigateway.JsonSchemaType.STRING,
                    minLength: 1,
                    maxLength: 100
                },
                description: {
                    type: apigateway.JsonSchemaType.STRING,
                    minLength: 1,
                    maxLength: 500
                },
                price: {
                    type: apigateway.JsonSchemaType.NUMBER,
                    minimum: 0.01
                }
            }
        }
}