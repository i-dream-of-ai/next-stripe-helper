import Stripe from 'stripe';
export interface ManageSubscriptionChangeFunction {
    (subscriptionId: string, customerId: string, client_reference_id: string | null, isCreated: boolean): Promise<void>;
}
export interface ManageCustomerDetailsChangeFunction {
    (customerId: string, paymentMethodId: string | Stripe.PaymentMethod | null, client_reference_id: string | null): Promise<void>;
}
export declare function handleCheckoutSessionCompleted(checkoutSession: Stripe.Checkout.Session, manageSubscriptionChange: ManageSubscriptionChangeFunction, manageCustomerDetailsChange: ManageCustomerDetailsChangeFunction): Promise<void>;
