"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionForSavingCard = exports.createCheckoutSession = void 0;
const stripe_1 = require("../utils/stripe");
/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 *
 * @param options - The options for creating the checkout session.
 * @returns A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} If there's an error during session creation.
 */
const createCheckoutSession = async (options) => {
    try {
        const session = await stripe_1.stripe.checkout.sessions.create({
            success_url: options.successUrl,
            cancel_url: options.cancelUrl,
            line_items: options.itemsArray,
            mode: options.mode,
            customer: options.customerId,
            ...options.additionalParams
        });
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