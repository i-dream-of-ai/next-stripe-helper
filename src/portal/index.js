import { handleStripeError, stripe } from '../utils/stripe';

const createPortalLink = async (customer, returnUrl) => {
    try {
        const { url } = await stripe.billingPortal.sessions.create({
            customer: customer,
            return_url: returnUrl,
        });
        return url;
    } catch (error) {
        handleStripeError(error);
    }
}

export {
    createPortalLink
}