import { handleStripeError, stripe } from '../utils/stripe';

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