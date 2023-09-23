import Stripe from 'stripe';
export interface ManageSubscriptionChangeFunction {
    (subscriptionId: string, customerId: string, isCreated: boolean): Promise<void>;
}
export interface ManageCustomerDetailsChangeFunction {
    (customerId: string, paymentMethodId: string | Stripe.PaymentMethod | null): Promise<void>;
}
export declare function handleCheckoutSessionCompleted(checkoutSession: Stripe.Checkout.Session, manageSubscriptionChange: ManageSubscriptionChangeFunction, manageCustomerDetailsChange: ManageCustomerDetailsChangeFunction): Promise<void>;
