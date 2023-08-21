import { stripe, handleStripeError } from "../utils/stripe";

/**
 * Create a new Stripe customer.
 * 
 * @param {string} email - The email address of the customer.
 * @returns {object} - The created customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function createCustomer(email) {
    try {
        return await stripe.customers.create({ email });
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Retrieve customer details from Stripe.
 * 
 * @param {string} customerId - The ID of the customer in Stripe.
 * @returns {object} - The customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getCustomer(customerId) {
    try {
        return await stripe.customers.retrieve(customerId);
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Update a customer's details in Stripe.
 * 
 * @param {string} customerId - The ID of the customer in Stripe.
 * @param {object} updates - An object containing fields to update for the customer.
 * @returns {object} - The updated customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
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
