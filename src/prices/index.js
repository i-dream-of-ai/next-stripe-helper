import { stripe, handleStripeError } from '../utils/stripe';

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

export {
    createProduct,
    createPrice,
}