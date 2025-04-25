import {Product, ProductRepository} from "../repository/ProductRepository";

const products : Product[] = Array.from({ length: 20 }, (_, index) => ({
    id: `product-${index + 1}`,
    title: `Product ${index + 1}`,
    description: `Description for Product ${index + 1}`,
    price: index + 10, // Random price between 1 and 100
}));

export class ProductService {

    public static getProducts() {
        return products;
    }

    public static getProduct(id: string) {
        return products.find(product => product.id === id);
    }
}