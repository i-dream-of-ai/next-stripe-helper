import Stripe from 'stripe';
declare function createProduct(name: string, description: string): Promise<Stripe.Product>;
declare function createPrice(productID: string, amount: number, currency: string, metadata: Stripe.MetadataParam): Promise<Stripe.Price>;
declare function getAllProducts(): Promise<Stripe.Product[]>;
declare function getPricesForProduct(productId: string, limit?: number): Promise<Stripe.Price[]>;
interface DbOperations {
    getAllLocalProducts: () => Promise<any[]>;
    addProduct: (product: Stripe.Product) => Promise<void>;
    updateProduct: (product: Stripe.Product) => Promise<void>;
}
interface SyncResult {
    success: boolean;
    message?: string;
    error?: string;
    details?: string;
}
declare const syncWithStripe: (dbOperations: DbOperations) => Promise<SyncResult>;
export { getAllProducts, createProduct, createPrice, getPricesForProduct, syncWithStripe };
