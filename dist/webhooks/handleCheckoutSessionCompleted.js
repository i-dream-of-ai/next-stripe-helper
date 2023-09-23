"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCheckoutSessionCompleted = void 0;
const stripe_1 = require("../utils/stripe");
async function handleCheckoutSessionCompleted(checkoutSession, manageSubscriptionChange, manageCustomerDetailsChange) {
    if (checkoutSession.mode === 'subscription') {
        const subscriptionId = checkoutSession.subscription;
        if (checkoutSession.customer !== null) {
            const customerId = typeof checkoutSession.customer === 'string'
                ? checkoutSession.customer
                : checkoutSession.customer.id; // Assuming checkoutSession.customer is a Customer object
            await manageSubscriptionChange(subscriptionId, customerId, true);
        }
        else {
            console.error('Error: Customer ID is null on subscription->manageSubscriptionChange');
            throw new Error('Error: Customer ID is null on subscription->manageSubscriptionChange');
        }
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
                await manageCustomerDetailsChange(checkoutSession.customer, paymentMethodId);
            }
        }
        catch (error) {
            console.error("Failed to update customer's default payment method:", error);
            throw new Error('Failed to set default payment method.');
        }
    }
}
exports.handleCheckoutSessionCompleted = handleCheckoutSessionCompleted;
//# sourceMappingURL=handleCheckoutSessionCompleted.js.map