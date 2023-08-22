import Stripe from "stripe";
import { stripe, handleStripeError } from "../utils/stripe";

/**
 * Create a new Stripe customer.
 * 
 * @param {string} email - The email address of the customer.
 * @returns {object} - The created customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function createCustomer(email: string): Promise<object> {
    try {
        return await stripe.customers.create({ email });
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

/**
 * Retrieve customer details from Stripe.
 * 
 * @param {string} customerId - The ID of the customer in Stripe.
 * @returns {object} - The customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getCustomer(customerId: string): Promise<object> {
    try {
        return await stripe.customers.retrieve(customerId);
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
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
async function updateCustomer(customerId: string, updates: object): Promise<object> {
    try {
        return await stripe.customers.update(customerId, updates);
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}
/**
 * Retrieves payment methods associated with a given customer.
 *
 * @param {string} customerId The ID of the customer for whom to fetch the payment methods.
 * @returns {Promise<paymentMethod.PaymentMethod[]>} A promise that resolves to an array of payment methods.
 * @throws {Error} Throws an error if there's a problem communicating with the Stripe API.
 */
async function getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',  // Assuming you want to retrieve card payment methods
        });

        return paymentMethods.data;
    } catch (error) {
        console.error("Error fetching payment methods for customer:", error);
        throw error;
    }
}

export {
    createCustomer,
    getCustomer,
    updateCustomer,
    getCustomerPaymentMethods
};
