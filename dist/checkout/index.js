"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionForSavingCard = exports.createCheckoutSession = void 0;
const stripe_1 = require("../utils/stripe");
/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 */
const createCheckoutSession = async (successUrl, cancelUrl = "", itemsArray, mode = "subscription", customerId, additionalParams = {}) => {
    try {
        const session = await stripe_1.stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            line_items: itemsArray,
            mode: mode,
            customer: customerId,
            ...additionalParams
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
        return session.id;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
};
exports.createCheckoutSessionForSavingCard = createCheckoutSessionForSavingCard;
//# sourceMappingURL=index.js.map