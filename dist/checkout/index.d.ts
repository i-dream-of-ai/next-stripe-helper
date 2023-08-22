import { Stripe } from 'stripe';
/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 *
 * @param options - The options for creating the checkout session.
 * @returns A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} If there's an error during session creation.
 */
declare const createCheckoutSession: (options: Stripe.Checkout.SessionCreateParams) => Promise<Stripe.Checkout.Session | undefined>;
/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 */
declare const createCheckoutSessionForSavingCard: (customerId: string, successUrl: string, cancelUrl: string) => Promise<Stripe.Checkout.Session>;
export { createCheckoutSession, createCheckoutSessionForSavingCard };
