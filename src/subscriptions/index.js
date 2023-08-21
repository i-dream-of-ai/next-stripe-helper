import { handleStripeError, stripe } from "../utils/stripe";

/**
 * Retrieve a user's subscription by its ID from Stripe.
 * 
 * @async
 * @function
 * @param {string} subscriptionID - The ID of the subscription.
 * @returns {object} - The retrieved subscription object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function getUserSubscription(subscriptionID) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionID);
        return subscription;
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * Retrieve detailed information about a user's subscription from Stripe.
 * 
 * @async
 * @function
 * @param {string} subscriptionID - The ID of the subscription.
 * @returns {object} - An object containing the subscription's status and associated price metadata.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
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

/**
 * Update metadata of a user's subscription in Stripe.
 * 
 * @async
 * @function
 * @param {string} subscriptionID - The ID of the subscription.
 * @param {object} metadata - The metadata object to update the subscription with.
 * @returns {object} - The updated subscription object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
async function updateUserSubscriptionMetadata(subscriptionID, metadata) {
    try {
        return await stripe.subscriptions.update(subscriptionID, {
            metadata: metadata
        }); 
    } catch (error) {
        handleStripeError(error);
    }
}

/**
 * List all active subscriptions for a user in Stripe.
 * 
 * @async
 * @function
 * @param {string} customerID - The ID of the customer to list subscriptions for.
 * @returns {object[]} - An array of subscription objects for the specified customer from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
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

/**
 * Cancel a user's subscription in Stripe.
 * 
 * @async
 * @function
 * @param {string} subscriptionID - The ID of the subscription to cancel.
 * @returns {object} - The canceled subscription object from Stripe.
 * @throws {Error} - Throws an error if the Stripe API call fails.
 */
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
