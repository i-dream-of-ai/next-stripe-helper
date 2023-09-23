"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionForSavingCard = exports.createCheckoutSession = void 0;
const stripe_1 = require("../utils/stripe");
/**
 * Create a checkout session with Stripe.
 *
 * @param {Object} options - The options for creating the checkout session.
 * @param {string} options.success_url - The URL to redirect upon successful payment. (required)
 * @param {string} [options.cancel_url=""] - The URL to redirect upon payment cancellation. (optional, default `""`)
 * @param {Object[]} options.line_items - An array of line items for the checkout. (required unless setup mode)
 * @param {string} [options.mode="subscription"] - The mode of the checkout session (`subscription` or `payment`). (optional, default `subscription`)
 * @param {string} options.customer - The Stripe customer ID. (required)
 * @param {Object} [options.additionalParams] - Additional parameters can be found in the stripe api docs. (optional)
 *
 * @returns {Promise<Stripe.Checkout.Session | undefined>} - A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} - If there's an error during session creation.
 */
const createCheckoutSession = async (options) => {
    const { success_url, cancel_url = "", line_items, mode = 'subscription', customer, additionalParams = {} } = options;
    try {
        const sessionParams = {
            success_url,
            cancel_url,
            mode,
            customer,
            ...additionalParams
        };
        if (line_items) {
            sessionParams.line_items = line_items;
        }
        const session = await stripe_1.stripe.checkout.sessions.create(sessionParams);
        return session;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
};
exports.createCheckoutSession = createCheckoutSession;
/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 */
const createCheckoutSessionForSavingCard = async (customerId, successUrl, cancelUrl) => {
    try {
        const session = await stripe_1.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'setup',
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_method_types: ['card'],
        });
        return session;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
};
exports.createCheckoutSessionForSavingCard = createCheckoutSessionForSavingCard;
//# sourceMappingURL=index.js.map