import Stripe from "stripe";
/**
 * Create a new Stripe customer.
 *
 * @param {string} email - The email address of the customer.
 * @returns {object} - The created customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
declare function createCustomer(email: string): Promise<object>;
/**
 * Gets a Stripe customer based on the email given.
 *
 * @param {string} email - The email address of the customer.
 * @returns {Customer} - The customer data found mathing the email given
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
declare function getCustomerByEmail(email: string, limit?: number): Promise<object>;
/**
 * Retrieve customer details from Stripe.
 *
 * @param {string} customerId - The ID of the customer in Stripe.
 * @returns {object} - The customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
declare function getCustomer(customerId: string): Promise<object>;
/**
 * Update a customer's details in Stripe.
 *
 * @param {string} customerId - The ID of the customer in Stripe.
 * @param {object} updates - An object containing fields to update for the customer.
 * @returns {object} - The updated customer object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
declare function updateCustomer(customerId: string, updates: object): Promise<object>;
/**
 * Retrieves payment methods associated with a given customer.
 *
 * @param {string} customerId The ID of the customer for whom to fetch the payment methods.
 * @returns {Promise<paymentMethod.PaymentMethod[]>} A promise that resolves to an array of payment methods.
 * @throws {Error} Throws an error if there's a problem communicating with the Stripe API.
 */
declare function getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
export { createCustomer, getCustomer, getCustomerByEmail, updateCustomer, getCustomerPaymentMethods };
