import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient, PutCommand, PutCommandInput, QueryCommand, ScanCommand} from "@aws-sdk/lib-dynamodb"
import { v4 as uuidv4 } from 'uuid';


const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(dynamoDB);
const productTable = process.env.PRODUCT_TABLE_NAME as string;
const stockTable = process.env.STOCK_TABLE_NAME as string;

export async function getProducts() {
    try {
    // Step 1: Get all products
    const productsResponse = await documentClient.send(new ScanCommand({
        TableName: productTable,
        Limit: 10
    }));
    const products = productsResponse.Items as Product[];

    if (!products) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'No products' }),
        };
    }

    console.log(`Products found: ${products.length}`)

        // Step 2: For each product, get its stock information
        return await Promise.all(products.map(async (product: Product) => {
        return await mergeWithStock(product)
    }));
} catch (error) {
    console.error("Error fetching products with stock:", error);
    throw error;
}
}

export async function getProductById(event: any) {
    console.log("Received event for GetProductById:", JSON.stringify(event, null, 2));
    // Extract productId from pathParameters
    const productId = event.productId;

    const getCommand = new QueryCommand({
        TableName: productTable,
        KeyConditionExpression: 'id = :productId',
        ExpressionAttributeValues: {
            ':productId': productId
        }
    })

   try {
       const productResponse = await documentClient.send(getCommand)
       console.log("Response:", JSON.stringify(productResponse));
       const product = productResponse.Items![0] as Product;

       // Return 404 if the product is not found
       if (!product) {
           return {
               statusCode: 404,
               body: JSON.stringify({ message: 'Product not found' }),
           };
       }
       console.log("product ", JSON.stringify(product))

       return await mergeWithStock(product);
   }
   catch (e) {
        console.log(e)
        throw e;
   }

}

export async function createProduct(event: any) {
    console.log("Received event for CreateProduct:", JSON.stringify(event, null, 2));

    if (!event.body) {
        throw new Error("Invalid requestBody");
    }

    const body = JSON.parse(event.body);
    const product: Product = {
        ...body,
        id: uuidv4()
    }

    console.log("Product", product)

    try {
        const insertParams: PutCommandInput = {
            TableName: productTable,
            Item: product
        }

        const putResponse = await documentClient.send(new PutCommand(insertParams))
        console.log("Response:", JSON.stringify(putResponse));
        return {
            statusCode: 201,
            body: product
        }
    }
    catch (e) {
        console.log(e)
        throw e;
    }
}

async function mergeWithStock(product: Product): Promise<ProductStock | undefined> {
    console.log("Merging product", product.id);

    try {
        const query = new QueryCommand({
            TableName: stockTable,
            KeyConditionExpression: 'product_id = :productId',
            ExpressionAttributeValues: {
                ':productId': product.id,
            }
        })

        const productResponse = await documentClient.send(query)
        const stocks = productResponse.Items![0]
        console.log("Stock of product ", JSON.stringify(stocks))
        return {
            ...product,
            count: stocks ? stocks.count : 0
        } as ProductStock
    }
    catch (e) {
        console.log(e)
        return
    }
}