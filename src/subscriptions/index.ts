import Stripe from "stripe";
import { handleStripeError, stripe } from "../utils/stripe";

interface UserSubscriptionDetails {
    status: string;
    [key: string]: string;
}

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

/**
 * Retrieves the first active plan for a given customer.
 * 
 * @param {string} customerId - The ID of the customer.
 * @returns {Promise<{ subscription: Stripe.Subscription | null, plan: Stripe.Plan | null }>} 
 * - A promise that resolves to an object containing the subscription and plan, or null if no active plan is found.
 * @throws {Error} - Throws an error if there's a problem communicating with the Stripe API or if the customer ID is invalid.
 */
async function getUserFirstActivePlan(customerId: string): Promise<{ subscription: Stripe.Subscription | null, plan: Stripe.Plan | null }> {
    try {
        // Retrieve the customer's active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active'
        });
    
        if (subscriptions.data.length === 0) {
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
  
    } catch (error) {
      console.error("Error fetching active plan for user:", error);
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
 * Retrieves the product metadata associated with a given subscription ID.
 * 
 * @param {string} subscriptionId - The ID of the subscription.
 * @returns {Promise<Stripe.Metadata | null>} - A promise that resolves to the product metadata or null if not found.
 * @throws {Error} - Throws an error if there's an issue retrieving the product metadata.
 */
async function getProductMetadataFromSubscription(subscriptionId: string): Promise<Stripe.Metadata | null> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
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
  
    } catch (error) {
      console.error("Error fetching product metadata:", error);
      return null;
    }
  }

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
async function updateSubscriptionPlan(subscriptionId:string, options: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
    try {

        // Update the subscription to a new plan
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, options);

        return updatedSubscription;
    } catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}


/**
 * Changes a customer's subscription to a new plan. Deletes the old one plan, adds the new one to the subscription, and charges the prorated price.
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
async function changeSubscriptionPlan(subscriptionId:string, oldItemId:string, newPriceId:string): Promise<Stripe.Subscription> {
    try {

        // Update the subscription to a new plan
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
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
    } catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
    }
}

async function addItemToSubscription(
    subscriptionId: string,
    priceId: string,
    additionalQuantity: number = 1,
    proration_behavior: Stripe.SubscriptionItemCreateParams.ProrationBehavior = 'always_invoice'
  ) {
    try {
      // Retrieve the existing subscription to find the subscription item for the specified price
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items'],
      });
  
      // Find the subscription item for the specified price
      const subscriptionItem = subscription.items.data.find(item => item.price.id === priceId);
  
      if (subscriptionItem) {
        // Ensure the quantities are treated as numbers
        const newQuantity = Number(subscriptionItem.quantity) + Number(additionalQuantity);
  
        // Update the quantity of the subscription item
        const updatedSubscriptionItem = await stripe.subscriptionItems.update(
          subscriptionItem.id,
          {
            quantity: newQuantity,
            proration_behavior
          }
        );
  
        return updatedSubscriptionItem;
      } else {
        // Create a new subscription item if it doesn't exist
        const newSubscriptionItem = await stripe.subscriptionItems.create({
          subscription: subscriptionId,
          price: priceId,
          quantity: Number(additionalQuantity),
          proration_behavior,
        });
  
        return newSubscriptionItem;
      }
    } catch (error) {
      console.error('Error updating or creating subscription item:', error);
      throw error;
    }
}

async function removeItemsFromSubscription(
    subscriptionItemId: string,
    removeQuantity: number,
    proration_behavior: Stripe.SubscriptionItemCreateParams.ProrationBehavior = 'always_invoice'
  ) {
    try {
      // Retrieve the current subscription item to check its quantity
      const subscriptionItem = await stripe.subscriptionItems.retrieve(subscriptionItemId);
  
      // Ensure subscriptionItem.quantity is defined before proceeding
      if (subscriptionItem.quantity === undefined) {
        throw new Error('Subscription item quantity is undefined');
      }
  
      removeQuantity = Number(removeQuantity);

      const currentQuantity = Number(subscriptionItem.quantity);

      // Calculate the new quantity
      const newQuantity = Math.max(currentQuantity - removeQuantity, 0);
  
      if (newQuantity === 0) {
        // If the new quantity is 0, delete the subscription item
        const deletedSubscriptionItem = await stripe.subscriptionItems.del(
          subscriptionItemId,
          {proration_behavior}
        );
  
        return deletedSubscriptionItem;
      } else {
        // If the new quantity is greater than 0, update the subscription item with the new quantity
        const updatedSubscriptionItem = await stripe.subscriptionItems.update(
          subscriptionItemId,
          {
            quantity: newQuantity,
            proration_behavior
          }
        );
  
        return updatedSubscriptionItem;
      }
    } catch (error) {
      console.error('Error updating or deleting subscription item:', error);
      throw error;
    }
}

async function removeItemsByPriceId(
    subscriptionId: string,
    priceId: string,
    removeQuantity: number,
    proration_behavior: Stripe.SubscriptionItemCreateParams.ProrationBehavior = 'always_invoice'
  ) {
    try {
      // Retrieve the existing subscription to find the subscription item for the specified price
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items'],
      });
  
      // Find the subscription item for the specified price
      const subscriptionItem = subscription.items.data.find(item => item.price.id === priceId);
  
      if (!subscriptionItem) {
        throw new Error('Subscription item not found for the specified price');
      }
  
      // Ensure subscriptionItem.quantity is defined before proceeding
      if (subscriptionItem.quantity === undefined) {
        throw new Error('Subscription item quantity is undefined');
      }

      removeQuantity = Number(removeQuantity);
  
      const currentQuantity = Number(subscriptionItem.quantity);

      // Calculate the new quantity
      const newQuantity = Math.max(currentQuantity - removeQuantity, 0);
  
      if (newQuantity === 0) {
        // If the new quantity is 0, delete the subscription item
        const deletedSubscriptionItem = await stripe.subscriptionItems.del(
          subscriptionItem.id,
          { proration_behavior }
        );
  
        return deletedSubscriptionItem;
      } else {
        // If the new quantity is greater than 0, update the subscription item with the new quantity
        const updatedSubscriptionItem = await stripe.subscriptionItems.update(
          subscriptionItem.id,
          {
            quantity: newQuantity,
            proration_behavior
          }
        );
  
        return updatedSubscriptionItem;
      }
    } catch (error) {
      console.error('Error updating or deleting subscription item:', error);
      throw error;
    }
}

async function updateItemQuantity(
    subscriptionItemId: string,
    newQuantity: number,
    proration_behavior: Stripe.SubscriptionItemCreateParams.ProrationBehavior = 'always_invoice'
  ) {
    try {

        newQuantity = Number(newQuantity);

      // Update the quantity of the subscription item
      const updatedSubscriptionItem = await stripe.subscriptionItems.update(
        subscriptionItemId,
        {
          quantity: newQuantity,
          proration_behavior
        }
      );
  
      return updatedSubscriptionItem;
    } catch (error) {
      console.error('Error updating subscription item quantity:', error);
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
    getUserFirstActivePlan,
    getUserSubscription,
    getUserSubscriptions,
    getUserSubscriptionDetails,
    addItemToSubscription,
    updateItemQuantity,
    removeItemsFromSubscription,
    removeItemsByPriceId,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    changeSubscriptionPlan,
    updateSubscriptionPlan,
    cancelUserSubscription,
    getSubscriptionPeriod,
    getProductMetadataFromSubscription
}
