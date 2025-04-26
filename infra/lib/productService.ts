// filename productService.ts
interface Product {
    id: string,
    title: string,
    description: string,
    price: number,
    count: number
}

const products: Product[] = [
    { id: '1', title: 'Product 1', description: 'Description of product 1', price: 10, count: 5 },
    { id: '2', title: 'Product 2', description: 'Description of product 2', price: 20, count: 3 },
    { id: '3', title: 'Product 3', description: 'Description of product 3', price: 30, count: 8 },
    { id: '4', title: 'Product 4', description: 'Description of product 4', price: 40, count: 2 },
    { id: '5', title: 'Product 5', description: 'Description of product 5', price: 50, count: 6 },
    { id: '6', title: 'Product 6', description: 'Description of product 6', price: 60, count: 4 },
    { id: '7', title: 'Product 7', description: 'Description of product 7', price: 70, count: 7 },
    { id: '8', title: 'Product 8', description: 'Description of product 8', price: 80, count: 1 },
    { id: '9', title: 'Product 9', description: 'Description of product 9', price: 90, count: 9 },
    { id: '10', title: 'Product 10', description: 'Description of product 10', price: 100, count: 10 },
];


export async function getProducts(event: any) {
     return {
            body: JSON.stringify({products}),
            statusCode: 200,
        };
}

export async function getProductById(event: any) {
    console.log(JSON.stringify(event))
    // Extract productId from pathParameters
    const {productId} = event.requestParameters;

    // Find the product by ID
    const product = products.find((product) => product.id === productId);

    // Return 404 if the product is not found
    if (!product) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Product not found' }),
        };
    }

    // Return the product if found
    return {
        statusCode: 200,
        body: JSON.stringify(product),
    };
}