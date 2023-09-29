import Stripe from 'stripe';

const stripeSecret: string = process.env.STRIPE_SECRET_LIVE || process.env.STRIPE_SECRET || "";

/**
 * Initialize the Stripe SDK with the secret key.
 */
const stripe: Stripe = new Stripe(stripeSecret as string, {
    apiVersion: "2023-08-16"
});


/**
 * Handles Stripe specific errors and throws a user-friendly message.
 * 
 * @param error - The error object returned from Stripe.
 * @throws Throws a user-friendly error message based on the error type from Stripe.
 */
function handleStripeError(error: Stripe.errors.StripeError): never {
    switch (error.type) {
        case 'StripeCardError':
            console.error('Card error:', error.message);
            throw new Error('There was an issue with your card. Please check your card details and try again.');
        case 'StripeRateLimitError':
            console.error('Rate limit error:', error.message);
            throw new Error('Too many requests made to Stripe. Please try again later.');
        case 'StripeInvalidRequestError':
            console.error('Invalid request error:', error.message);
            throw new Error('There was an issue with the payment request. Please contact support.');
        case 'StripeAPIError':
            console.error('API error:', error.message);
            throw new Error('There was an internal issue with our payment provider. Please try again later.');
        case 'StripeConnectionError':
            console.error('Connection error:', error.message);
            throw new Error('Unable to connect to our payment provider. Please check your internet connection and try again.');
        default:
            console.error('STRIPE error:', error.message);
            throw error;
    }
}

export {
    stripe,
    handleStripeError
};
