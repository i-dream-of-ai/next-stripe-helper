import Stripe from 'stripe';
declare const createPortalLink: (object: Stripe.BillingPortal.SessionCreateParams) => Promise<string>;
export { createPortalLink };
