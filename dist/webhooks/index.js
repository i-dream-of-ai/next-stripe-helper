"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const stripe_1 = require("../utils/stripe");
const handleCheckoutSessionCompleted_1 = require("./handleCheckoutSessionCompleted");
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
const webhookHandler = async (upsertProduct, upsertPrice, manageSubscriptionChange, manageCustomerDetailsChange, event) => {
    const { body, signature } = event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
    let stripeEvent;
    try {
        if (!signature || !body || !webhookSecret) {
            throw new Error('Missing body, signature, or webhook secret');
        }
        stripeEvent = stripe_1.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
    catch (err) {
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
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
    ]);
    if (relevantEvents.has(stripeEvent.type)) {
        console.log('stripe event: ', stripeEvent.type);
        try {
            switch (stripeEvent.type) {
                case 'product.created':
                case 'product.updated':
                    await upsertProduct(stripeEvent.data.object);
                    break;
                case 'price.created':
                case 'price.updated':
                    await upsertPrice(stripeEvent.data.object);
                    break;
                case 'customer.created':
                case 'customer.deleted':
                case 'customer.updated':
                    await manageCustomerDetailsChange(stripeEvent.data.object);
                    break;
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = stripeEvent.data.object;
                    if (typeof subscription.customer === 'string') {
                        await manageSubscriptionChange(subscription.id, subscription.customer, stripeEvent.type === 'customer.subscription.created');
                    }
                    else if (subscription.customer && 'id' in subscription.customer) {
                        await manageSubscriptionChange(subscription.id, subscription.customer.id, stripeEvent.type === 'customer.subscription.created');
                        await manageCustomerDetailsChange(subscription.customer);
                    }
                    else {
                        console.error('Error: Customer ID is not a string or Customer object on subscription deletion');
                        throw new Error('Error: Customer ID is not a string or Customer object on subscription deletion');
                    }
                case 'checkout.session.completed':
                    await (0, handleCheckoutSessionCompleted_1.handleCheckoutSessionCompleted)(stripeEvent.data.object, manageSubscriptionChange, manageCustomerDetailsChange);
                    break;
                default:
                    throw new Error('Unhandled relevant event!');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Webhook Error: ${error.message}`);
            }
            throw error; // This keeps the type as unknown, and re-throws it.
        }
    }
    return { received: true };
};
exports.webhookHandler = webhookHandler;
//# sourceMappingURL=index.js.map