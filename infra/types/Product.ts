interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
}

interface Stock {
    product_id: string;
    count: number;
}

interface ProductStock extends Product {
    count: number;
}