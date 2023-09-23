import Stripe from 'stripe';
import { stripe } from '../utils/stripe';

export interface ManageSubscriptionChangeFunction {
    (subscriptionId: string, customerId: string, client_reference_id: string | null, isCreated: boolean): Promise<void>;
}

export interface ManageCustomerDetailsChangeFunction {
    (customerId: string, paymentMethodId: string | Stripe.PaymentMethod | null, client_reference_id: string | null): Promise<void>;
}

export async function handleCheckoutSessionCompleted(
    checkoutSession: Stripe.Checkout.Session,
    manageSubscriptionChange: ManageSubscriptionChangeFunction,
    manageCustomerDetailsChange: ManageCustomerDetailsChangeFunction
): Promise<void> {
    const client_reference_id = checkoutSession.client_reference_id;
    if (checkoutSession.mode === 'subscription') {
        const subscriptionId = checkoutSession.subscription as string;
        if (checkoutSession.customer !== null) {
            const customerId = typeof checkoutSession.customer === 'string'
                ? checkoutSession.customer
                : checkoutSession.customer.id;  // Assuming checkoutSession.customer is a Customer object
            await manageSubscriptionChange(
                subscriptionId,
                customerId,
                client_reference_id,
                true
            );
        } else {
            console.error('Error: Customer ID is null on subscription->manageSubscriptionChange');
            throw new Error('Error: Customer ID is null on subscription->manageSubscriptionChange');
        }
    }
    if (checkoutSession.mode === 'setup') {
        try {
            // Retrieve the setup intent
            const setupIntent = await stripe.setupIntents.retrieve(
                checkoutSession.setup_intent as string
            );

            if (setupIntent.payment_method) {
                // Assuming payment_method is either a string or a PaymentMethod object,
                // we check its type and handle accordingly.
                const paymentMethodId = typeof setupIntent.payment_method === 'string'
                    ? setupIntent.payment_method
                    : setupIntent.payment_method.id;

                // Set the payment method as the default for the customer
                await stripe.customers.update(checkoutSession.customer as string, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId,
                    },
                });
                await manageCustomerDetailsChange(
                    checkoutSession.customer as string,
                    paymentMethodId,
                    client_reference_id
                );
            }
        } catch (error) {
            console.error("Failed to update customer's default payment method:", error);
            throw new Error('Failed to set default payment method.');
        }
    }
}