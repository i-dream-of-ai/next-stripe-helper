import Stripe from 'stripe';
/**
 * Initialize the Stripe SDK with the secret key.
 */
declare const stripe: Stripe;
/**
 * Handles Stripe specific errors and throws a user-friendly message.
 *
 * @param error - The error object returned from Stripe.
 * @throws Throws a user-friendly error message based on the error type from Stripe.
 */
declare function handleStripeError(error: Stripe.errors.StripeError): never;
export { stripe, handleStripeError };
