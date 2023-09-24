import Stripe from 'stripe';
import { stripe } from '../utils/stripe';
import { handleCheckoutSessionCompleted, ManageCustomerDetailsChangeFunction, ManageSubscriptionChangeFunction } from './handleCheckoutSessionCompleted';

interface UpsertProductFunction {
    (product: Stripe.Product): Promise<void>;
}

interface UpsertPriceFunction {
    (price: Stripe.Price): Promise<void>;
}

type WebhookEvent = {
    body: string,
    signature: string
};

/**
 * Handles incoming webhook events from Stripe.
 *
 * @param {UpsertProductFunction} upsertProduct - Function to upsert a product.
 * @param {UpsertPriceFunction} upsertPrice - Function to upsert a price.
 * @param {ManageSubscriptionChangeFunction} manageSubscriptionChange - Function to manage subscription changes.
 * @param {ManageCustomerDetailsChangeFunction} manageCustomerDetailsChange - Function to manage customer details changes.
 * @param {WebhookEvent} event - The webhook event object containing the body and signature.
 * @returns {Promise<{ received: boolean, message?: string }>} - A promise that resolves to an object indicating whether the event was received and an optional message.
 * @throws {Error} - Throws an error if there's an issue processing the webhook event.
 */
export const webhookHandler = async (
    upsertProduct: UpsertProductFunction,
    upsertPrice: UpsertPriceFunction,
    manageSubscriptionChange: ManageSubscriptionChangeFunction,
    manageCustomerDetailsChange: ManageCustomerDetailsChangeFunction,
    event: WebhookEvent
): Promise<{ received: boolean, message?: string }> => {
    const { body, signature } = event;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent
    try {
        if (!signature || !body || !webhookSecret) {
            throw new Error('Missing body, signature, or webhook secret');
        }

        stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
        throw err; // This keeps the type as unknown, and re-throws it.
    }

    const relevantEvents = new Set([
        'product.created',
        'product.updated',
        'price.created',
        'price.updated',
        'customer.created',
        'customer.deleted',
        'customer.updated',
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
    ]);

    if (relevantEvents.has(stripeEvent.type)) {
        
        if(process.env.NEXT_STRIPE_HELPER_DEBUG){
            console.log('Processing event:', stripeEvent.type, stripeEvent);
        }

        try {
            switch (stripeEvent.type) {
                case 'product.created':
                case 'product.updated':
                    await upsertProduct(stripeEvent.data.object as Stripe.Product);
                    break;
                case 'price.created':
                case 'price.updated':
                    await upsertPrice(stripeEvent.data.object as Stripe.Price);
                    break;
                case 'customer.created':
                case 'customer.deleted':
                case 'customer.updated':
                    await manageCustomerDetailsChange(stripeEvent.data.object as Stripe.Customer);
                    break;
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = stripeEvent.data.object as Stripe.Subscription;
                    if (typeof subscription.customer === 'string') {
                        await manageSubscriptionChange(
                            subscription.id,
                            subscription.customer,
                            stripeEvent.type === 'customer.subscription.created'
                        );
                    } else if (subscription.customer && 'id' in subscription.customer) {
                        await manageSubscriptionChange(
                            subscription.id,
                            subscription.customer.id,
                            stripeEvent.type === 'customer.subscription.created'
                        );
                        await manageCustomerDetailsChange(subscription.customer);
                    } else {
                        console.error('Error: Customer ID is not a string or Customer object on subscription deletion');
                        throw new Error('Error: Customer ID is not a string or Customer object on subscription deletion');
                    }
                    break; 
                case 'checkout.session.completed':
                    await handleCheckoutSessionCompleted(
                        stripeEvent.data.object as Stripe.Checkout.Session,
                        manageSubscriptionChange,
                        manageCustomerDetailsChange
                    );
                    break;
                default:
                    throw new Error('Unhandled relevant event!');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Webhook Error: ${error.message}`);
            }
            throw error; // This keeps the type as unknown, and re-throws it.
        }
    }

    return { received: true };
};