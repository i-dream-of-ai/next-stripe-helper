import Stripe from "stripe";
import { handleStripeError, stripe } from "../utils/stripe";


/**
 * Create a new subscription for a customer.
 * 
 * @param {string} customerId - The ID of the customer.
 * @param {string} priceId - The ID of the price (related to a product) to which the customer is subscribing.
 * @returns {Promise<Stripe.Subscription>} - The newly created subscription object.
 */
async function createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }]
    });
}

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
        if(!subscription){
            return {
                status: "No subscription."
            }
        }
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
            console.log('Customer has no subscriptions: ',customerId)
            return {
                subscription:null, 
                plan:null
            };// Customer has no subscriptions
        }
    
        // Assuming the customer only has one subscription.
        // If a customer can have multiple subscriptions, you'll want to loop over these.
        const subscription = subscriptions.data[0];
        
        // Retrieve the plan from the subscription's items
        const plan = subscription.items.data[0].plan;
  
        return {
            subscription:subscription, 
            plan:plan
        };
  
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

/**
 * Updates a customer's subscription to a new plan. Deletes the old one plan and adds the new one to the subscription.
 * 
 * @param {string} subscriptionId - The ID of the subscription to be updated.
 * @param {string} subItemId - The ID of the subscription item to which the plan should be updated.
 * @param {string} newPriceId - The price ID of the new plan to which the subscription should be updated.
 * @returns {Promise<Stripe.Subscription>} - A promise that resolves to the updated subscription.
 * @throws {Error} - Throws an error if there's an issue updating the subscription.
 */
async function changeSubscriptionPlan(subscriptionId: string, subItemId:string, newPriceId: string): Promise<Stripe.Subscription> {
    try {

        // Update the subscription to a new plan
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                  id: subItemId,
                  deleted: true,
                },
                {
                  price: newPriceId,
                },
              ],
        });

        return updatedSubscription;
    } catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
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
    createSubscription,
    getUserCurrentPlan,
    getUserSubscription,
    getUserSubscriptions,
    getUserSubscriptionDetails,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    changeSubscriptionPlan,
    cancelUserSubscription,
    getSubscriptionPeriod
}
