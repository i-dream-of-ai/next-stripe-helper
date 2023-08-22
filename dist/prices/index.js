"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWithStripe = exports.getPricesForProduct = exports.createPrice = exports.createProduct = exports.getAllProducts = void 0;
const stripe_1 = require("../utils/stripe");
async function createProduct(name, description) {
    try {
        return await stripe_1.stripe.products.create({
            name,
            description,
            type: 'service',
        });
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
        throw error; // Ensure the error bubbles up if you want it to
    }
}
exports.createProduct = createProduct;
async function createPrice(productID, amount, currency, metadata) {
    try {
        return await stripe_1.stripe.prices.create({
            product: productID,
            unit_amount: amount,
            currency: currency,
            recurring: { interval: 'month' },
            metadata: metadata
        });
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
        throw error;
    }
}
exports.createPrice = createPrice;
async function getAllProducts() {
    let products = [];
    let lastId;
    while (true) {
        const params = { limit: 100 };
        if (lastId) {
            params.starting_after = lastId;
        }
        const batch = await stripe_1.stripe.products.list(params);
        products = products.concat(batch.data);
        if (batch.has_more) {
            lastId = products[products.length - 1].id;
        }
        else {
            break;
        }
    }
    return products;
}
exports.getAllProducts = getAllProducts;
async function getPricesForProduct(productId, limit = 100) {
    const prices = await stripe_1.stripe.prices.list({ product: productId, limit: limit });
    return prices.data;
}
exports.getPricesForProduct = getPricesForProduct;
const syncWithStripe = async (dbOperations) => {
    try {
        const stripeProducts = await getAllProducts();
        const localProducts = await dbOperations.getAllLocalProducts();
        for (const product of stripeProducts) {
            const localProduct = localProducts.find(p => p.id === product.id);
            if (!localProduct) {
                await dbOperations.addProduct(product);
            }
            else {
                await dbOperations.updateProduct(product);
            }
        }
        return { success: true, message: "Sync with Stripe completed successfully." };
    }
    catch (error) {
        const err = error;
        return { success: false, error: "Error syncing with Stripe.", details: err.message };
    }
};
exports.syncWithStripe = syncWithStripe;
//# sourceMappingURL=index.js.map