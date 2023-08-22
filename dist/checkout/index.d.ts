import { Stripe } from 'stripe';
/**
 * Options for creating a checkout session in Stripe.
 */
interface CreateCheckoutSessionOptions {
    /** The URL to which the user should be redirected after a successful purchase. */
    successUrl: string;
    /** The URL to which the user should be redirected if they decide to cancel the purchase. */
    cancelUrl?: string;
    /** Array of line items for the checkout session. */
    itemsArray: Stripe.Checkout.SessionCreateParams.LineItem[];
    /** The mode of the checkout session, e.g. 'payment' or 'subscription'. Defaults to 'subscription'. */
    mode?: Stripe.Checkout.SessionCreateParams.Mode;
    /** The ID of the Stripe customer. */
    customerId: string;
    /** Any additional parameters for the checkout session, if needed. */
    additionalParams?: Partial<Stripe.Checkout.SessionCreateParams>;
}
/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 *
 * @param options - The options for creating the checkout session.
 * @returns A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} If there's an error during session creation.
 */
declare const createCheckoutSession: (options: CreateCheckoutSessionOptions) => Promise<Stripe.Checkout.Session | undefined>;
/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 */
declare const createCheckoutSessionForSavingCard: (customerId: string, successUrl: string, cancelUrl: string) => Promise<Stripe.Checkout.Session>;
export { createCheckoutSession, createCheckoutSessionForSavingCard };
