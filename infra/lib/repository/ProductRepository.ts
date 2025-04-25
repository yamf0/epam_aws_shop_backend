
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
}
export interface AvailableProduct extends Product {
    count: number;
}

export class ProductRepository {

    private products: Product[] = Array.from({ length: 20 }, (_, index) => ({
        id: `product-${index + 1}`,
        title: `Product ${index + 1}`,
        description: `Description for Product ${index + 1}`,
        price: index + 10, // Random price between 1 and 100
    }));

    public getProducts(): Product[] {
        return this.products;
    }

    public getProduct(id: string): Product | undefined {
        return this.products.find(product => product.id === id);
    }
}