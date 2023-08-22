"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerPaymentMethods = exports.updateCustomer = exports.getCustomer = exports.createCustomer = void 0;
const stripe_1 = require("../utils/stripe");
/**
 * Create a new Stripe customer.
 *
 * @param {string} email - The email address of the customer.
 * @returns {object} - The created customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function createCustomer(email) {
    try {
        return await stripe_1.stripe.customers.create({ email });
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.createCustomer = createCustomer;
/**
 * Retrieve customer details from Stripe.
 *
 * @param {string} customerId - The ID of the customer in Stripe.
 * @returns {object} - The customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getCustomer(customerId) {
    try {
        return await stripe_1.stripe.customers.retrieve(customerId);
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.getCustomer = getCustomer;
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
        return await stripe_1.stripe.customers.update(customerId, updates);
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.updateCustomer = updateCustomer;
/**
 * Retrieves payment methods associated with a given customer.
 *
 * @param {string} customerId The ID of the customer for whom to fetch the payment methods.
 * @returns {Promise<paymentMethod.PaymentMethod[]>} A promise that resolves to an array of payment methods.
 * @throws {Error} Throws an error if there's a problem communicating with the Stripe API.
 */
async function getCustomerPaymentMethods(customerId) {
    try {
        const paymentMethods = await stripe_1.stripe.paymentMethods.list({
            customer: customerId,
            type: 'card', // Assuming you want to retrieve card payment methods
        });
        return paymentMethods.data;
    }
    catch (error) {
        console.error("Error fetching payment methods for customer:", error);
        throw error;
    }
}
exports.getCustomerPaymentMethods = getCustomerPaymentMethods;
//# sourceMappingURL=index.js.map