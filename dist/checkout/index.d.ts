import { Stripe } from 'stripe';
/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 */
declare const createCheckoutSession: (successUrl: string, cancelUrl: string | undefined, itemsArray: Stripe.Checkout.SessionCreateParams.LineItem[], mode: Stripe.Checkout.SessionCreateParams.Mode | undefined, customerId: string, additionalParams?: Partial<Stripe.Checkout.SessionCreateParams>) => Promise<Stripe.Checkout.Session | undefined>;
/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 */
declare const createCheckoutSessionForSavingCard: (customerId: string, successUrl: string, cancelUrl: string) => Promise<Stripe.Checkout.Session>;
export { createCheckoutSession, createCheckoutSessionForSavingCard };
