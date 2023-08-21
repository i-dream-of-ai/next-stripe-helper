import { handleStripeError, stripe } from "../utils/stripe";

async function getUserSubscription(subscriptionID) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionID);
        return subscription;
    } catch (error) {
        handleStripeError(error);
    }
}

async function getUserSubscriptionDetails(subscriptionID) {
    try {
        const subscription = await getUserSubscription(subscriptionID);
        const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
        return {
            status: subscription.status,
            ...price.metadata
        };
    } catch (error) {
        handleStripeError(error);
    }
}

async function updateUserSubscriptionMetadata(subscriptionID, metadata) {
    try {
        return await stripe.subscriptions.update(subscriptionID, {
            metadata: metadata
        }); 
    } catch (error) {
        handleStripeError(error);
    }
}

async function listUserSubscriptions(customerID) {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerID,
            status: 'active'
        });
        return subscriptions.data;
    } catch (error) {
        handleStripeError(error);
    }
}

async function cancelUserSubscription(subscriptionID) {
    try {
        return await stripe.subscriptions.del(subscriptionID);
    } catch (error) {
        handleStripeError(error);
    }
}

export {
    getUserSubscription,
    getUserSubscriptionDetails,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    cancelUserSubscription
}
