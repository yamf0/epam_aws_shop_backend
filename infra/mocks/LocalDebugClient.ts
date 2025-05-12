import {getProductById, getProducts} from "../service/productService";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";


console.log('start')
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const documentClient = DynamoDBDocumentClient.from(client);


/*getProductById({productId: 1}).then(product => {
    console.log(product);
})*/

getProducts().then(products => {console.log(products)})