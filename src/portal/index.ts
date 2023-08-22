import Stripe from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

const createPortalLink = async (customer: string , returnUrl: string) => {
    try {
        const { url } = await stripe.billingPortal.sessions.create({
            customer: customer,
            return_url: returnUrl,
        });
        return url;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

export {
    createPortalLink
}