import {ProductService} from "./service/ProductService";

// Filename: productApi.ts
export async function getProductsList() {
    const products = ProductService.getProducts();
    return {
        body: JSON.stringify({products}),
        statusCode: 200,
    };
}

export async function getProductById(event: any) {
    const productId = event.pathParameters.id;
    const product = ProductService.getProduct(productId);

    if (!product) {
        return {
            body: JSON.stringify({message: 'Product not found'}),
            statusCode: 404,
        };
    }

    return {
        body: JSON.stringify({product}),
        statusCode: 200,
    };
}