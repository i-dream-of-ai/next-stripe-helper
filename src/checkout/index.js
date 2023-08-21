import { handleStripeError, stripe } from '../utils/stripe';

/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 * 
 * @async
 * @function
 * @param {string} successUrl - The URL to redirect to upon successful checkout.
 * @param {string} [cancelUrl=""] - The URL to redirect to upon checkout cancellation.
 * @param {object[]} itemsArray - An array of items for the checkout session.
 * @param {string} [mode="subscription"] - The mode of the checkout session (e.g., "subscription" or "payment").
 * @param {string} customerId - The ID of the customer in Stripe.
 * @param {object} [additionalParams={}] - Additional parameters for the checkout session.
 * @returns {object} - The created checkout session.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
const createCheckoutSession = async (
    successUrl,
    cancelUrl = "",
    itemsArray,
    mode = "subscription",
    customerId,
    additionalParams = {}
) => {
    try {
        const session = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            line_items: itemsArray,
            mode: mode,
            customer: customerId,
            ...additionalParams
        });
        return session;
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 * 
 * @async
 * @function
 * @param {string} customerId - The ID of the customer in Stripe.
 * @param {string} successUrl - The URL to redirect to upon successful card saving.
 * @param {string} cancelUrl - The URL to redirect to upon card saving cancellation.
 * @returns {string} - The ID of the created checkout session.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
const createCheckoutSessionForSavingCard = async (customerId, successUrl, cancelUrl) => {
    try {
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'setup',
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            payment_method_types: ['card'],
        });
        return session.id;
    } catch (error) {
        handleStripeError(error);
    }
};

module.exports = {
  createCheckoutSession,
  createCheckoutSessionForSavingCard
};
