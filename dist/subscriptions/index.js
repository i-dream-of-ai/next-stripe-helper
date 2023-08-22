"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionPeriod = exports.cancelUserSubscription = exports.changeSubscriptionPlan = exports.listUserSubscriptions = exports.updateUserSubscriptionMetadata = exports.getUserSubscriptionDetails = exports.getUserSubscriptions = exports.getUserSubscription = exports.getUserCurrentPlan = void 0;
const stripe_1 = require("../utils/stripe");
async function getUserSubscriptions(customerId) {
    try {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripe_1.stripe.subscriptions.list({
            customer: customerId,
        });
        if (subscriptions.data.length === 0) {
            return null; // Customer has no subscriptions
        }
        return subscriptions;
    }
    catch (error) {
        console.error("Error fetching plan for user:", error);
        throw error;
    }
}
exports.getUserSubscriptions = getUserSubscriptions;
async function getUserSubscription(subscriptionID) {
    try {
        const subscription = await stripe_1.stripe.subscriptions.retrieve(subscriptionID);
        return subscription;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.getUserSubscription = getUserSubscription;
async function getUserSubscriptionDetails(subscriptionID) {
    try {
        const subscription = await getUserSubscription(subscriptionID);
        if (!subscription) {
            return {
                status: "No subscription."
            };
        }
        const price = await stripe_1.stripe.prices.retrieve(subscription.items.data[0].price.id);
        return {
            status: subscription.status,
            ...price.metadata
        };
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.getUserSubscriptionDetails = getUserSubscriptionDetails;
async function getUserCurrentPlan(customerId) {
    try {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripe_1.stripe.subscriptions.list({
            customer: customerId,
        });
        if (subscriptions.data.length === 0) {
            return null; // Customer has no subscriptions
        }
        // Assuming the customer only has one subscription.
        // If a customer can have multiple subscriptions, you'll want to loop over these.
        const subscription = subscriptions.data[0];
        // Retrieve the plan from the subscription's items
        const plan = subscription.items.data[0].plan;
        return plan;
    }
    catch (error) {
        console.error("Error fetching plan for user:", error);
        throw error;
    }
}
exports.getUserCurrentPlan = getUserCurrentPlan;
async function updateUserSubscriptionMetadata(subscriptionID, metadata) {
    try {
        return await stripe_1.stripe.subscriptions.update(subscriptionID, {
            metadata: metadata
        });
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.updateUserSubscriptionMetadata = updateUserSubscriptionMetadata;
/**
 * Updates a customer's subscription to a new plan.
 *
 * @param {string} subscriptionId - The ID of the subscription to be updated.
 * @param {string} newPlanId - The ID of the new plan to which the subscription should be updated.
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
async function changeSubscriptionPlan(subscriptionId, newPlanId) {
    try {
        // Update the subscription to a new plan
        const updatedSubscription = await stripe_1.stripe.subscriptions.update(subscriptionId, {
            items: [{
                    id: subscriptionId,
                    plan: newPlanId
                }]
        });
        return updatedSubscription;
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}
exports.changeSubscriptionPlan = changeSubscriptionPlan;
async function listUserSubscriptions(customerID) {
    try {
        const subscriptions = await stripe_1.stripe.subscriptions.list({
            customer: customerID,
            status: 'active'
        });
        return subscriptions.data;
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.listUserSubscriptions = listUserSubscriptions;
async function cancelUserSubscription(subscriptionID) {
    try {
        return await stripe_1.stripe.subscriptions.cancel(subscriptionID);
    }
    catch (error) {
        (0, stripe_1.handleStripeError)(error);
    }
}
exports.cancelUserSubscription = cancelUserSubscription;
/**
 * Retrieves the start and end dates of the current billing period for a given subscription.
 *
 * @param {string} subscriptionId - The ID of the subscription for which to fetch the billing period.
 * @returns {Promise<{start: Date, end: Date}>} - A promise that resolves to an object with start and end dates of the current billing period.
 * @throws {Error} - Throws an error if there's a problem communicating with the Stripe API or if the subscription ID is invalid.
 */
async function getSubscriptionPeriod(subscriptionId) {
    try {
        // Retrieve the subscription
        const subscription = await stripe_1.stripe.subscriptions.retrieve(subscriptionId);
        // Extract the start and end dates of the current billing period
        const currentPeriodStart = new Date(subscription.current_period_start * 1000); // Convert from UNIX timestamp to JS Date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000); // Convert from UNIX timestamp to JS Date
        return {
            start: currentPeriodStart,
            end: currentPeriodEnd
        };
    }
    catch (error) {
        console.error("Error fetching period for subscription:", error);
        throw error;
    }
}
exports.getSubscriptionPeriod = getSubscriptionPeriod;
//# sourceMappingURL=index.js.map