import Stripe from 'stripe';

// 1. Initialize Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function handleStripeError(error) {
    switch (error.type) {
        case 'StripeCardError':
            // Handle card errors
            console.error('Card error:', error.message);
            throw new Error('There was an issue with your card. Please check your card details and try again.');
        case 'RateLimitError':
            // Handle requests that hit Stripe's rate limits
            console.error('Rate limit error:', error.message);
            throw new Error('Too many requests made to Stripe. Please try again later.');

        case 'StripeInvalidRequestError':
            // Invalid parameters were supplied to Stripe's API
            console.error('Invalid request error:', error.message);
            throw new Error('There was an issue with the payment request. Please contact support.');

        case 'StripeAPIError':
            // An error occurred internally with Stripe's API
            console.error('API error:', error.message);
            throw new Error('There was an internal issue with our payment provider. Please try again later.');

        case 'StripeConnectionError':
            // Network communication with Stripe failed
            console.error('Connection error:', error.message);
            throw new Error('Unable to connect to our payment provider. Please check your internet connection and try again.');

        default:
            // Handle any other types of unexpected errors
            console.error('Unknown error:', error.message);
            throw new Error('An unexpected error occurred. Please try again later.');

    }
}

export {
    stripe,
    handleStripeError
};