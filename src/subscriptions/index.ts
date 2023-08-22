import Stripe from "stripe";
import { handleStripeError, stripe } from "../utils/stripe";

async function getUserSubscriptions(customerId:string) {
    try {
      // Retrieve the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });
  
      if (subscriptions.data.length === 0) {
        return null; // Customer has no subscriptions
      }
  
      return subscriptions;
  
    } catch (error) {
      console.error("Error fetching plan for user:", error);
      throw error;
    }
}

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

async function getUserCurrentPlan(customerId:string) {
    try {
      // Retrieve the customer's subscriptions
      const subscriptions = await stripe.subscriptions.list({
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
  
    } catch (error) {
      console.error("Error fetching plan for user:", error);
      throw error;
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

/**
 * Retrieves the start and end dates of the current billing period for a given subscription.
 *
 * @param {string} subscriptionId - The ID of the subscription for which to fetch the billing period.
 * @returns {Promise<{start: Date, end: Date}>} - A promise that resolves to an object with start and end dates of the current billing period.
 * @throws {Error} - Throws an error if there's a problem communicating with the Stripe API or if the subscription ID is invalid.
 */
async function getSubscriptionPeriod(subscriptionId: string): Promise<{ start: Date; end: Date }> {
    try {
        // Retrieve the subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Extract the start and end dates of the current billing period
        const currentPeriodStart = new Date(subscription.current_period_start * 1000); // Convert from UNIX timestamp to JS Date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000); // Convert from UNIX timestamp to JS Date

        return {
            start: currentPeriodStart,
            end: currentPeriodEnd
        };
    } catch (error) {
        console.error("Error fetching period for subscription:", error);
        throw error;
    }
}

export {
    getUserCurrentPlan,
    getUserSubscription,
    getUserSubscriptions,
    getUserSubscriptionDetails,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    cancelUserSubscription,
    getSubscriptionPeriod
}
