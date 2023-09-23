"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCheckoutSessionCompleted = void 0;
const stripe_1 = require("../utils/stripe");
async function handleCheckoutSessionCompleted(checkoutSession, manageSubscriptionChange, manageCustomerDetailsChange) {
    const client_reference_id = checkoutSession.client_reference_id;
    if (checkoutSession.mode === 'subscription') {
        const subscriptionId = checkoutSession.subscription;
        if (checkoutSession.customer !== null) {
            const customerId = typeof checkoutSession.customer === 'string'
                ? checkoutSession.customer
                : checkoutSession.customer.id; // Assuming checkoutSession.customer is a Customer object
            await manageSubscriptionChange(subscriptionId, customerId, client_reference_id, true);
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
            // Ensure the customer ID and payment method are valid
            if (!checkoutSession.customer || typeof checkoutSession.customer !== 'string') {
                throw new Error('Invalid customer ID');
            }
            if (!setupIntent.payment_method || typeof setupIntent.payment_method !== 'string') {
                throw new Error('Invalid payment method ID');
            }
            // Set the payment method as the default for the customer
            await stripe_1.stripe.customers.update(checkoutSession.customer, {
                invoice_settings: {
                    default_payment_method: setupIntent.payment_method,
                },
            });
            await manageCustomerDetailsChange(checkoutSession.customer, setupIntent.payment_method, client_reference_id);
        }
        catch (error) {
            console.error("Failed to update customer's default payment method:", error);
            throw new Error('Failed to set default payment method.');
        }
    }
}
exports.handleCheckoutSessionCompleted = handleCheckoutSessionCompleted;
//# sourceMappingURL=handleCheckoutSessionCompleted.js.map