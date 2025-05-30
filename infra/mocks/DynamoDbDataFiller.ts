import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb"
import {randomInt} from "node:crypto";
import { v4 as uuidv4 } from 'uuid';


console.log('start')
const client = new DynamoDBClient({ region: process.env.AWS_REGION });

async function addMockProducts(){
    const products = Array.from({ length: 20 }, (_, index) => {
        return {
            id: uuidv4(), // Convertimos a string para compatibilidad con DynamoDB
            title: `Product ${index}`,
            description: `Product ${index}`,
            price: randomInt(0, 1000),
        }
    });
    console.log('products', JSON.stringify(products))

    const command = new PutItemCommand({
        TableName: 'products',
        Item: {
            id: {S: "1"},
            title: {S: "Test"},
            description: {S: "Test"},
            price: {N: '1000'}
        },
    })

    try {
        const data = client.send(command);
    } catch (error) {
        console.error("Error:", error);
    }

    products.forEach((product) => {
        const command = new PutItemCommand({
            TableName: 'products',
            Item: {
                id: {S: product.id},
                title: {S: product.title},
                description: {S: product.description},
                price: {N: product.price.toString()}
            },
        })
        try {
            const data = client.send(command);
        } catch (error) {
            console.error("Error:", error);
        }

        const stockCommand = new PutItemCommand({
            TableName: "stock",
            Item: {
                product_id: {S: product.id},
                count: {N: randomInt(0, 100).toString() },
            }
        })

        try {
            client.send(stockCommand)
        }
        catch (error) {
            console.error("Error:", error);
        }
    })
}

addMockProducts().then(() => {console.log('done')})