import Stripe from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

const createPortalLink = async (object: Stripe.BillingPortal.SessionCreateParams) => {
    try {
        const { url } = await stripe.billingPortal.sessions.create(object);
        return url;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

export {
    createPortalLink
}