import Stripe from "stripe";
import { handleStripeError, stripe } from "../utils/stripe";

async function getUserSubscription(subscriptionID: string): Promise<Stripe.Subscription> {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionID);
        return subscription;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

interface UserSubscriptionDetails {
    status: string;
    [key: string]: string;
}

async function getUserSubscriptionDetails(subscriptionID: string): Promise<UserSubscriptionDetails> {
    try {
        const subscription = await getUserSubscription(subscriptionID);
        const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
        return {
            status: subscription.status,
            ...price.metadata
        };
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

async function updateUserSubscriptionMetadata(subscriptionID: string, metadata: { [key: string]: string }): Promise<Stripe.Subscription> {
    try {
        return await stripe.subscriptions.update(subscriptionID, {
            metadata: metadata
        }); 
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

async function listUserSubscriptions(customerID: string): Promise<Stripe.Subscription[]> {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerID,
            status: 'active'
        });
        return subscriptions.data;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

async function cancelUserSubscription(subscriptionID: string): Promise<Stripe.Subscription> {
    try {
        return await stripe.subscriptions.cancel(subscriptionID);
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
}

export {
    getUserSubscription,
    getUserSubscriptionDetails,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    cancelUserSubscription
}
