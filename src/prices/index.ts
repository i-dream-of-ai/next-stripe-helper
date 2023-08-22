import Stripe from 'stripe';
import { stripe, handleStripeError } from '../utils/stripe';

async function createProduct(name: string, description: string): Promise<Stripe.Product> {
    try {
        return await stripe.products.create({
            name,
            description,
            type: 'service',
        });
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
        throw error;  // Ensure the error bubbles up if you want it to
    }
}

async function createPrice(productID: string, amount: number, currency: string, metadata: Stripe.MetadataParam): Promise<Stripe.Price> {
    try {
        return await stripe.prices.create({
            product: productID,
            unit_amount: amount,
            currency: currency,
            recurring: { interval: 'month' },
            metadata: metadata
        });
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
        throw error;
    }
}

async function getAllProducts(): Promise<Stripe.Product[]> {
    let products: Stripe.Product[] = [];
    let lastId: string | undefined;

    while (true) {
        const params: Stripe.ProductListParams = { limit: 100 };
        if (lastId) {
            params.starting_after = lastId;
        }
        
        const batch = await stripe.products.list(params);
        products = products.concat(batch.data);
        
        if (batch.has_more) {
            lastId = products[products.length - 1].id;
        } else {
            break;
        }
    }

    return products;
}

async function getPricesForProduct(productId: string, limit: number = 100): Promise<Stripe.Price[]> {
    const prices = await stripe.prices.list({ product: productId, limit: limit });
    return prices.data;
}

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

const syncWithStripe = async (dbOperations: DbOperations): Promise<SyncResult> => {
    try {
        const stripeProducts = await getAllProducts();
        const localProducts = await dbOperations.getAllLocalProducts();

        for (const product of stripeProducts) {
            const localProduct = localProducts.find(p => p.id === product.id);

            if (!localProduct) {
                await dbOperations.addProduct(product);
            } else {
                await dbOperations.updateProduct(product);
            }
        }

        return { success: true, message: "Sync with Stripe completed successfully." };

    } catch (error) {
        const err = error as Error;
        return { success: false, error: "Error syncing with Stripe.", details: err.message };
    }
}


export {
    getAllProducts,
    createProduct,
    createPrice,
    getPricesForProduct,
    syncWithStripe
}
