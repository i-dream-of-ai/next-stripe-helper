import { stripe, handleStripeError } from '../utils/stripe';

/**
 * Create a new product in Stripe.
 * 
 * @async
 * @function
 * @param {string} name - The name of the product.
 * @param {string} description - The description of the product.
 * @returns {object} - The created product object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function createProduct(name, description) {
    try {
        return await stripe.products.create({
            name,
            description,
            type: 'service',
        });
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Create a new price for a product in Stripe.
 * 
 * @async
 * @function
 * @param {string} productID - The ID of the associated product.
 * @param {number} amount - The amount for the price in the smallest currency unit.
 * @param {string} currency - The currency of the price (e.g., 'usd').
 * @param {object} metadata - Additional metadata for the price.
 * @returns {object} - The created price object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function createPrice(productID, amount, currency, metadata) {
    try {
        return await stripe.prices.create({
            product: productID,
            unit_amount: amount,
            currency: currency,
            recurring: { interval: 'month' },
            metadata: metadata
        });
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Retrieve all products available in Stripe.
 * Handles pagination to get all products if there are more than 100.
 * 
 * @async
 * @function
 * @returns {object[]} - An array of product objects from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getAllProducts() {
    let products = [];
    let lastId;

    while (true) {
        const params = { limit: 100 };
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

/**
 * Retrieve all prices associated with a specific product in Stripe.
 * 
 * @async
 * @function
 * @param {string} productId - The ID of the product to get prices for.
 * @param {number} [limit=100] - The maximum number of prices to retrieve.
 * @returns {object[]} - An array of price objects associated with the given product from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getPricesForProduct(productId, limit = 100) {
    const prices = await stripe.prices.list({ product: productId, limit: limit });
    return prices.data;
}

/**
 * Sync local database with products data from Stripe.
 * 
 * @async
 * @function
 * @param {object} dbOperations - An object containing database operations methods.
 * @returns {object} - An object containing the result of the sync operation.
 * @throws {Error} - Throws an error if syncing fails.
 */
const syncWithStripe = async (dbOperations) => {
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
        return { success: false, error: "Error syncing with Stripe.", details: error.message };
    }
}

export {
    getAllProducts,
    createProduct,
    createPrice,
    getPricesForProduct,
    syncWithStripe
}
