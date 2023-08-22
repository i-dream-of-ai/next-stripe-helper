"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = void 0;
const stripe_1 = require("../utils/stripe");
const webhookHandler = async (upsertProduct, upsertPrice, manageSubscriptionChange, event) => {
    const { body, signature } = event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
    let stripeEvent;
    try {
        if (!signature || !body || !webhookSecret) {
            throw new Error('Missing body, signature, or webhook secret');
        }
        stripeEvent = stripe_1.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('stripe event', stripeEvent);
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
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = stripeEvent.data.object;
                    await manageSubscriptionChange(subscription.id, subscription.customer, stripeEvent.type === 'customer.subscription.created');
                    break;
                case 'checkout.session.completed':
                    const checkoutSession = stripeEvent.data.object;
                    if (checkoutSession.mode === 'subscription') {
                        const subscriptionId = checkoutSession.subscription;
                        await manageSubscriptionChange(subscriptionId, checkoutSession.customer, true);
                    }
                    if (checkoutSession.mode === 'setup') {
                        try {
                            // Retrieve the setup intent
                            const setupIntent = await stripe_1.stripe.setupIntents.retrieve(checkoutSession.setup_intent);
                            if (setupIntent.payment_method) {
                                // Assuming payment_method is either a string or a PaymentMethod object,
                                // we check its type and handle accordingly.
                                const paymentMethodId = typeof setupIntent.payment_method === 'string'
                                    ? setupIntent.payment_method
                                    : setupIntent.payment_method.id;
                                // Set the payment method as the default for the customer
                                await stripe_1.stripe.customers.update(checkoutSession.customer, {
                                    invoice_settings: {
                                        default_payment_method: paymentMethodId,
                                    },
                                });
                            }
                        }
                        catch (error) {
                            console.error("Failed to update customer's default payment method:", error);
                            throw new Error('Failed to set default payment method.');
                        }
                    }
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