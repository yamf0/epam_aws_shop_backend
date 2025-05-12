interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
}

interface Stock {
    product_id: number;
    count: number;
}

interface ProductStock extends Product {
    count: number;
}