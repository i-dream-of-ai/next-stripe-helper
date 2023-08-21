import { stripe, handleStripeError } from "../utils/stripe";

/**
 * Create a new Stripe customer.
 */
async function createCustomer(email) {
    try {
        return await stripe.customers.create({ email });
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Retrieve customer details.
 */
async function getCustomer(customerId) {
    try {
        return await stripe.customers.retrieve(customerId);
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Update a customer's details.
 */
async function updateCustomer(customerId, updates) {
    
    try {
        return await stripe.customers.update(customerId, updates);
    } catch (error) {
        handleStripeError(error);
    }
}

export {
    createCustomer,
    getCustomer,
    updateCustomer
};