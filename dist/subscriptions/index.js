"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductMetadataFromSubscription = exports.getSubscriptionPeriod = exports.cancelUserSubscription = exports.updateSubscriptionPlan = exports.changeSubscriptionPlan = exports.listUserSubscriptions = exports.updateUserSubscriptionMetadata = exports.getUserSubscriptionDetails = exports.getUserSubscriptions = exports.getUserSubscription = exports.getUserFirstActivePlan = exports.createSubscription = void 0;
const stripe_1 = require("../utils/stripe");
/**
 * Create a new subscription for a customer.
 *
 * @param {string} customerId - The ID of the customer.
 * @param {string} priceId - The ID of the price (related to a product) to which the customer is subscribing.
 * @returns {Promise<Stripe.Subscription>} - The newly created subscription object.
 */
async function createSubscription(customerId, priceId) {
    return await stripe_1.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }]
    });
}
exports.createSubscription = createSubscription;
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
/**
 * Retrieves the first active plan for a given customer.
 *
 * @param {string} customerId - The ID of the customer.
 * @returns {Promise<{ subscription: Stripe.Subscription | null, plan: Stripe.Plan | null }>}
 * - A promise that resolves to an object containing the subscription and plan, or null if no active plan is found.
 * @throws {Error} - Throws an error if there's a problem communicating with the Stripe API or if the customer ID is invalid.
 */
async function getUserFirstActivePlan(customerId) {
    try {
        // Retrieve the customer's active subscriptions
        const subscriptions = await stripe_1.stripe.subscriptions.list({
            customer: customerId,
            status: 'active'
        });
        if (subscriptions.data.length === 0) {
            console.log('Customer has no active subscriptions: ', customerId);
            return {
                subscription: null,
                plan: null
            }; // Customer has no active subscriptions
        }
        // Assuming the first active subscription is the one you're interested in.
        const subscription = subscriptions.data[0];
        // Retrieve the plan from the subscription's items
        const plan = subscription.items.data[0].plan;
        return {
            subscription: subscription,
            plan: plan
        };
    }
    catch (error) {
        console.error("Error fetching active plan for user:", error);
        throw error;
    }
}
exports.getUserFirstActivePlan = getUserFirstActivePlan;
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
 * Retrieves the product metadata associated with a given subscription ID.
 *
 * @param {string} subscriptionId - The ID of the subscription.
 * @returns {Promise<Stripe.Metadata | null>} - A promise that resolves to the product metadata or null if not found.
 * @throws {Error} - Throws an error if there's an issue retrieving the product metadata.
 */
async function getProductMetadataFromSubscription(subscriptionId) {
    try {
        const subscription = await stripe_1.stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price.product'],
        });
        const subscriptionItem = subscription.items.data[0];
        if (!subscriptionItem || !subscriptionItem.price) {
            console.error('No associated product found for the subscription.');
            return null;
        }
        const product = subscriptionItem.price.product;
        // Ensure product is neither a string nor a DeletedProduct
        if (typeof product === 'string' || 'deleted' in product) {
            console.error('The product is either deleted or not a valid object.');
            return null;
        }
        // Access the metadata from the product directly
        return product.metadata;
    }
    catch (error) {
        console.error("Error fetching product metadata:", error);
        return null;
    }
}
exports.getProductMetadataFromSubscription = getProductMetadataFromSubscription;
/**
 * Updates a customer's subscription to a new plan. Deletes the old one plan and adds the new one to the subscription.
 *
 *
 * @param {string} subscriptionId - Subscription ID
 *
 * @param {options} Stripe.Subscription.Params Subscription params
 *
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
async function updateSubscriptionPlan(subscriptionId, options) {
    try {
        // Update the subscription to a new plan
        const updatedSubscription = await stripe_1.stripe.subscriptions.update(subscriptionId, options);
        return updatedSubscription;
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}
exports.updateSubscriptionPlan = updateSubscriptionPlan;
/**
 * Updates a customer's subscription to a new plan. Deletes the old one plan, adds the new one to the subscription, and charges the prorated price.
 *
 *
 * @param {string} subscriptionId - Subscription ID
 *
 * @param {string} oldItemId - Item ID that you want to update.
 *
 * @param {string} newPriceId - PRICE ID that you want to change to.
 *
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
async function changeSubscriptionPlan(subscriptionId, oldItemId, newPriceId) {
    try {
        // Update the subscription to a new plan
        const updatedSubscription = await stripe_1.stripe.subscriptions.update(subscriptionId, {
            proration_behavior: "always_invoice",
            items: [
                {
                    id: oldItemId,
                    deleted: true,
                },
                {
                    price: newPriceId,
                },
            ],
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