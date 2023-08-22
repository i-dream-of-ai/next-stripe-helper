import Stripe from "stripe";
declare function getUserSubscriptions(customerId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>> | null>;
declare function getUserSubscription(subscriptionID: string): Promise<Stripe.Subscription>;
interface UserSubscriptionDetails {
    status: string;
    [key: string]: string;
}
declare function getUserSubscriptionDetails(subscriptionID: string): Promise<UserSubscriptionDetails>;
declare function getUserCurrentPlan(customerId: string): Promise<Stripe.Plan | null>;
declare function updateUserSubscriptionMetadata(subscriptionID: string, metadata: {
    [key: string]: string;
}): Promise<Stripe.Subscription>;
/**
 * Updates a customer's subscription to a new plan.
 *
 * @param {string} subscriptionId - The ID of the subscription to be updated.
 * @param {string} newPlanId - The ID of the new plan to which the subscription should be updated.
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
declare function changeSubscriptionPlan(subscriptionId: string, newPlanId: string): Promise<Stripe.Subscription>;
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
export { getUserCurrentPlan, getUserSubscription, getUserSubscriptions, getUserSubscriptionDetails, updateUserSubscriptionMetadata, listUserSubscriptions, changeSubscriptionPlan, cancelUserSubscription, getSubscriptionPeriod };
