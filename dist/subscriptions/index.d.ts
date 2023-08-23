import Stripe from "stripe";
/**
 * Create a new subscription for a customer.
 *
 * @param {string} customerId - The ID of the customer.
 * @param {string} priceId - The ID of the price (related to a product) to which the customer is subscribing.
 * @returns {Promise<Stripe.Subscription>} - The newly created subscription object.
 */
declare function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription>;
declare function getUserSubscriptions(customerId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>> | null>;
declare function getUserSubscription(subscriptionID: string): Promise<Stripe.Subscription>;
interface UserSubscriptionDetails {
    status: string;
    [key: string]: string;
}
declare function getUserSubscriptionDetails(subscriptionID: string): Promise<UserSubscriptionDetails>;
declare function getUserCurrentPlan(customerId: string): Promise<{
    subscription: null;
    plan: null;
} | {
    subscription: Stripe.Subscription;
    plan: Stripe.Plan;
}>;
declare function updateUserSubscriptionMetadata(subscriptionID: string, metadata: {
    [key: string]: string;
}): Promise<Stripe.Subscription>;
/**
 * Updates a customer's subscription to a new plan. Deletes the old one plan and adds the new one to the subscription.
 *
 * @param {string} subscriptionId - The ID of the subscription to be updated.
 * @param {string} subItemId - The ID of the subscription item to which the plan should be updated.
 * @param {string} newPriceId - The price ID of the new plan to which the subscription should be updated.
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
declare function changeSubscriptionPlan(subscriptionId: string, subItemId: string, newPriceId: string): Promise<Stripe.Subscription>;
declare function listUserSubscriptions(customerID: string): Promise<Stripe.Subscription[]>;
declare function cancelUserSubscription(subscriptionID: string): Promise<Stripe.Subscription>;
/**
 * Retrieves the start and end dates of the current billing period for a given subscription.
 *
 * @param {string} subscriptionId - The ID of the subscription for which to fetch the billing period.
 * @returns {Promise<{start: Date, end: Date}>} - A promise that resolves to an object with start and end dates of the current billing period.
 * @throws {Error} - Throws an error if there's a problem communicating with the Stripe API or if the subscription ID is invalid.
 */
declare function getSubscriptionPeriod(subscriptionId: string): Promise<{
    start: Date;
    end: Date;
}>;
export { createSubscription, getUserCurrentPlan, getUserSubscription, getUserSubscriptions, getUserSubscriptionDetails, updateUserSubscriptionMetadata, listUserSubscriptions, changeSubscriptionPlan, cancelUserSubscription, getSubscriptionPeriod };
