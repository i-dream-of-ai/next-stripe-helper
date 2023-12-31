# next-stripe-helper

`next-stripe-helper` is a module designed to simplify the integration of Stripe's functionality into Next.js applications. Whether you're looking to process payments, manage customers, or handle subscriptions, this utility aims to streamline those interactions. 

This utility is perfect for developers building e-commerce platforms, subscription-based services, or any other application that requires payment functionalities within a JS or TS ecosystem.

Includes a smart webhook handler that will automatically keep your database up to date with current plans, pricing, and subscriptions. I also included a few helper function examples below.

If you would like to contribute or report an error, the github repo is [here](https://github.com/i-dream-of-ai/next-stripe-helper). Please star and follow if you find this tool helpful!!

## Installation

```bash
npm install next-stripe-helper
```

## Prerequisites

Ensure you've set up Stripe and have an error handler in your project, as this utility relies on those components. 

You will likely want to start in TEST MODE!! Make sure you use the test mode switch to turn Test Mode on before proceeding. Once you are setup and ready to take live payments, turn off test mode, get your LIVE stripe keys, and setup your LIVE webhooks secret and endpoint.

Ensure you have set the `STRIPE_SECRET_LIVE` or `STRIPE_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files).

Ensure you have set the `STRIPE_WEBHOOK_SECRET_LIVE` or `STRIPE_WEBHOOK_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files). 

If you would like to log Stripe Webhook Events for debugging purposes you can add `NEXT_STRIPE_HELPER_DEBUG` in your `.env.local` (or other environment-specific `.env` files). 

``` dotenv

# Stripe configuration
STRIPE_SECRET=your_stripe_TEST_secret_key
STRIPE_WEBHOOK_SECRET=your_TEST_stripe_webhook_secret

STRIPE_SECRET_LIVE=your_LIVE_stripe_secret_key
STRIPE_WEBHOOK_SECRET_LIVE=your_LIVE_stripe_webhook_secret

```

Make sure you complete your checkout settings from within the Stripe dashboard before using any checkout functions. [Setup Checkout Settings](https://dashboard.stripe.com/settings/checkout)

Make sure you add your webhooks endpoint URL!! [Setup Webhook URL](https://dashboard.stripe.com/webhooks)

## Usage

## Checkout Sessions
First, ensure that you've imported the necessary functions from the package:

```javascript
import { createCheckoutSession, createCheckoutSessionForSavingCard } from 'next-stripe-helper';
```

### Create Checkout Session

Create a checkout session with Stripe.

```javascript
   const session = await createCheckoutSession({
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/canceled',
        line_items: [
            {price: 'price_idhere', quantity: 1},
        ],
        mode: 'subscription',
        client_reference_id: 'your_user_id',
        additionalParams: {}
    });
```

   Parameters:

   - `success_url` (required): The URL to redirect upon successful payment.
   - `cancel_url` (optional, default `""`): The URL to redirect upon payment cancellation.
   - `line_items` (required unless setup mode): An array of line items for the checkout.
   - `mode` (optional, default `subscription`): The mode of the checkout session (`subscription` or `payment`).
   - `customer` (optional): The Stripe customer ID. A new Customer will be created if no ID is provided.
   - `client_reference_id` (optional): Your User ID. This ID is from your own DB, and is returned via webhook so you can use it to track the session and user in your app.
   - `additionalParams` (optional): Additional parameters can be found in the stripe api docs.

### Create Checkout Session for Saving Card

   Create a checkout session with Stripe for the purpose of saving a card.

   ```javascript
   const sessionId = await createCheckoutSessionForSavingCard(
       'customer_id',
       'https://your-success-url.com',
       'https://your-cancel-url.com'
   );
   ```

   Parameters:

   - `customerId` (required): The Stripe customer ID.
   - `successUrl` (required): The URL to redirect upon successful card saving.
   - `cancelUrl` (required): The URL to redirect upon cancellation.

## Customer Utilities

Import the required functions:

```javascript
import { createCustomer, getCustomer, updateCustomer } from 'next-stripe-helper';
```

### Create a New Stripe Customer

   Create a new customer in Stripe using their email address.

   ```javascript
   const newCustomer = await createCustomer('example@email.com');
   ```

   Parameters:

   - `email` (required): The email address of the new customer.

### Get a Stripe Customer based on a specific email

   Get a customer in Stripe using their email address.

   ```javascript
   const customerData = await getCustomerByEmail(email: string, limit: number = 1)
   ```

   Parameters:

   - `email` (required): The email address of the new customer.
   - `limit` (optional): Limit the number of returned customer data. If limit is higher than 1, then an array will be returned.

### Retrieve Customer Details

   Fetch the details of a specific customer using their Stripe customer ID.

   ```javascript
   const customerDetails = await getCustomer('customer_id');
   ```

   Parameters:

   - `customerId` (required): The Stripe customer ID.

### Update a Customer's Details

   Update the details of a customer in Stripe.

   ```javascript
   const updates = {
       // Your update parameters here (e.g., email, name, etc.)
   };
   const updatedCustomer = await updateCustomer('customer_id', updates);
   ```

   Parameters:

   - `customerId` (required): The Stripe customer ID.
   - `updates` (required): An object containing key-value pairs of the properties to be updated.

### Get a Customer's Payment Details

   Get the payment details of a customer in Stripe.

   ```javascript
   const paymentMethods = await getCustomerPaymentMethods('customer_id');
   ```

   Parameters:

   - `customerId` (required): The Stripe customer ID.


## Billing Portal Utilities

The `next-stripe-helper` also facilitates easy interaction with Stripe's billing portal.

### Usage

Firstly, remember to import the necessary function:

```javascript
import { createPortalLink } from 'next-stripe-helper';
```

### Create Portal Session Link

Generate a link for your users to access Stripe's billing portal where they can manage their billing details.

```javascript
const portalUrl = await createPortalLink({customer:'customerId', returnUrl:'https://your-return-url.com'});
```

Parameters:

- `customer` (required): The Stripe customer ID.
- `configuration` (optional): The ID of an existing configuration to use for this session, describing its functionality and features. If not specified, the session uses the default configuration.
- `flow_data` (optional): Information about a specific flow for the customer to go through. See the stripe docs to learn more about using customer portal deep links and flows.
- `returnUrl` (required): The URL where the user will be redirected after exiting the billing portal.

For more params see the [stripe docs](https://stripe.com/docs/api/customer_portal/sessions/create).


## Stripe Accounts

### Create a Stripe Account

Create a new account on Stripe.

```javascript
import { createAccount } from 'next-stripe-helper';

const params = {
  type: 'custom', // or 'standard', 'express'
  country: 'US',
  email: 'user@example.com',
  // Add other Stripe.AccountCreateParams properties as needed
};

const account = await createAccount(params);
```

#### Parameters:

- `params`: An object containing parameters for creating the account. Common properties include:
  - `type`: The type of account to create (`custom`, `standard`, or `express`).
  - `country`: The country in which the account holder resides.
  - `email`: The email address of the account holder.
  - Refer to the [Stripe API documentation](https://stripe.com/docs/api/accounts/create) for a full list of parameters.

#### Returns:

- A promise that resolves with the created account.

### Get Account

Retrieve details of a Stripe account.

```javascript
import { getAccount } from 'next-stripe-helper';

const accountId = 'acct_1234567890';

try {
  const account = await getAccount(accountId);
  console.log(account);
} catch (error) {
  console.error("Error:", error);
}
```

#### Parameters:

- `accountId`: The ID of the Stripe account you want to retrieve.

#### Returns:

- A promise that resolves with the details of the Stripe account.

---

### Update Account

Update details of a Stripe account.

```javascript
import { updateAccount } from 'next-stripe-helper';

const accountId = 'acct_1234567890';
const params = {
  email: 'new-email@example.com',
  // Add other Stripe.AccountUpdateParams properties as needed
};

try {
  const account = await updateAccount(accountId, params);
  console.log(account);
} catch (error) {
  console.error("Error:", error);
}
```

#### Parameters:

- `accountId`: The ID of the Stripe account you want to update.
- `params`: An object containing the properties you want to update on the Stripe account.

#### Returns:

- A promise that resolves with the updated details of the Stripe account.

---

### Delete Account

Delete a Stripe account.

```javascript
import { deleteAccount } from 'next-stripe-helper';

const accountId = 'acct_1234567890';

try {
  const account = await deleteAccount(accountId);
  console.log(account);
} catch (error) {
  console.error("Error:", error);
}
```

#### Parameters:

- `accountId`: The ID of the Stripe account you want to delete.

#### Returns:

- A promise that resolves with the details of the deleted Stripe account.



## Products and Prices Utilities

The `next-stripe-helper` provides utilities to help with the creation of products and their associated prices on Stripe.

### Usage

Start by importing the functions you need:

```javascript
import { createProduct, createPrice } from 'next-stripe-helper';
```

### Create a Product

To create a new product in Stripe, use:

```javascript
const newProduct = await createProduct('Product Name', 'Product Description');
```

Parameters:

- `name` (required): The name of the product.
- `description` (required): A brief description of the product.

### Create a Price for a Product

Once you have a product, you can set its price:

```javascript
const newPrice = await createPrice('product_id', 1000, 'usd', { optionalMetadata: 'value' });
```

Parameters:

- `productID` (required): The ID of the product for which the price is being set.
- `amount` (required): The amount to be charged for the product, in the smallest unit for the currency (e.g., cents for USD).
- `currency` (required): The three-letter ISO currency code. (e.g., 'usd', 'eur', 'gbp').
- `metadata` (optional): A key-value store for any additional information you want to store.

Note: The price is set up as recurring, with a monthly interval. If you wish to modify the recurrence, you would need to adjust the utility function accordingly.


## Connect Utilities

### Create Connected Account

Create a connected account with Stripe.

```javascript
const account = await createConnectedAccount({
    country: 'US',
    email: 'affiliate@example.com',
    type: 'express',  // Optional, defaults to 'express'
    capabilities: {   // Optional, defaults to requesting 'transfers'
        card_payments: { requested: true },
        transfers: { requested: true },
    },
    // ...any other Stripe AccountCreateParams
});
```

Parameters:

- `country` (required): The country of the connected account.
- `email` (required): The email address of the connected account.
- `type` (optional, default `'express'`): The type of the connected account (`'express'`, `'custom'`, or `'standard'`).
- `capabilities` (optional, default `{ card_payments: { requested: true }, transfers: { requested: true } }`): The capabilities to request for the connected account.
- ...any other parameters as per the [Stripe AccountCreateParams documentation](https://stripe.com/docs/api/accounts/create#create_account).


### Start OAuth Flow

Initiates the Stripe OAuth flow by constructing the OAuth URL.

```javascript
const oauthURL = startOAuthFlow('your-stripe-client-id', 'https://your-redirect-uri.com/api/stripe/callback');
```

Parameters:

- `clientId` (required): Your Stripe client ID. The clientId in the context of the Stripe OAuth flow is not the Stripe customer ID. Instead, it refers to the "Client ID" of your Stripe Connect application.

When you set up Stripe Connect in your Stripe Dashboard, you'll be provided with a set of API keys specific to your Connect application. One of these keys is the "Client ID." This ID is used to initiate the OAuth flow for connecting other Stripe accounts to your platform.
- `redirectUri` (required): The URL where Stripe should redirect the user after completing the OAuth flow. Our example shows using an api route that you would create.

Returns:

- A string representing the constructed OAuth URL.


### Handle OAuth Callback

Process the OAuth callback by exchanging the authorization code for a connected account ID.

```javascript
const connectedAccountId = await handleOAuthCallback(authorizationCode);
```

Parameters:

- `authorizationCode` (required): The authorization code returned by Stripe after the user completes the OAuth flow.

Returns:

- A Promise that resolves to a string containing the ID of the connected Stripe account.

### Create Payout for Connected Account

Create a payout to a connected account.

```javascript
const payout = await createPayout({
    amount: 1000,  // amount in cents
    currency: 'usd',
    destination: 'acct_123456789',  // the ID of the connected account
});
```

Parameters:

- `amount` (required): The amount to payout, in the smallest currency unit (e.g., cents for USD).
- `currency` (required): The currency of the payout.
- `destination` (required): The ID of the connected account to which the payout will be sent.

### Create Account Link

Creates an account link for onboarding or updating a connected account.

```javascript
const accountLink = await createAccountLink({
  account: 'acct_123456789',
  refresh_url: 'https://example.com/reauth',
  return_url: 'https://example.com/return',
  type: 'account_onboarding'
});
```

Parameters:

- `accountId` (required): The ID of the connected account.
- `refreshUrl` (required): The URL to redirect to if the user's session expires.
- `returnUrl` (required): The URL to redirect to upon completion.
- `type` (optional, default `'account_onboarding'`): The type of account link. Possible values are:
  - `account_onboarding`: Provides a form for inputting outstanding requirements.
  - `account_update`: Displays the fields that are already populated on the account object and allows editing.

Returns:

- An object representing the created account link, which includes the URL to redirect the user to start the onboarding or update process.


### Retrieve Connect Account

Retrieves a Stripe Connect account.

```javascript
const account = await retrieveAccount(
  'acct_123456789'
);
```

Parameters:

- `accountId` (required): The ID of the connected account.

Returns:

- An object representing the retrieved Stripe Connect account.


### Create Connect Express Login Link

Creates a Connect Express login link for a connected account.

```javascript
const loginLinkUrl = await createConnectExpressLoginLink(
  'acct_123456789',  // Replace with your users connected account ID
);
```

Parameters:

- `accountId` (required): The ID of the connected account.

Returns:

- A string representing the created login link URL.


### Delete a Stripe Express Account

Delete a specific Stripe Express account using its account ID.

```javascript
import { deleteExpressAccount } from 'your-package-name';

const accountId = 'acct_1234567890'; // Replace with the ID of the account you want to delete

const deletedAccount = await deleteExpressAccount(accountId);
```

#### Parameters:

- `accountId`: The ID of the Stripe Express account you want to delete.

#### Returns:

- A promise that resolves with the deleted account object. If the deletion was successful, the object will have a `deleted` property set to `true`.

> ⚠️ **Warning**: Deleting an account is irreversible. Ensure you've backed up any necessary data and are certain about the deletion before proceeding.


### List All Transfers

Retrieve a list of all transfers made on your Stripe Connect account.

```javascript
import { listAllTransfers } from 'next-stripe-helper';

const params = {
  destination: 'acc_1234567', //Optional:  Only return transfers to this account ID. 
  limit: 10, // Optional: Number of transfers to retrieve. Max value is 100.
  // Add other Stripe.TransferListParams properties as needed
};

const transfers = await listAllTransfers(params);
```

#### Parameters:

- `params` (optional): An object containing parameters to filter the list of transfers. Some of the commonly used properties include:
  - `limit`: A limit on the number of objects to be returned. Limit can range between 1 and 100 items.
  - `status`: The status of the transfers to retrieve. Can be `pending`, `paid`, `failed`, or `reversed`.
  - `created`: A filter on the list based on the object `created` field. The value can be a string with an integer Unix timestamp, or it can be a dictionary with the following options:
    - `gt`: Return results with a `created` value greater than this timestamp.
    - `gte`: Return results with a `created` value greater than or equal to this timestamp.
    - `lt`: Return results with a `created` value less than this timestamp.
    - `lte`: Return results with a `created` value less than or equal to this timestamp.
  - Refer to the [Stripe API documentation](https://stripe.com/docs/api/transfers/list) for a full list of parameters.

#### Returns:

- A promise that resolves with a list of transfers. Each transfer object contains details about the transfer, such as the amount, currency, status, and more.


## Subscription Utilities

The `next-stripe-helper` package offers a suite of utilities designed to streamline interactions with Stripe subscriptions.

### Usage

Before you can use these utilities, you need to import them.

Here is a list of available subscription functions:

```javascript
import {
    createSubscription,
    getUserFirstActivePlan,
    getUserSubscription,
    getUserSubscriptions,
    getUserSubscriptionDetails,
    addItemToSubscription,
    updateItemQuantity,
    updateItemQuantityByPriceId,
    removeItemsFromSubscription,
    removeItemsByPriceId,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    changeSubscriptionPlan,
    updateSubscriptionPlan,
    cancelUserSubscription,
    getSubscriptionPeriod,
    getProductMetadataFromSubscription
} from 'next-stripe-helper';
```

### Create a Subscription

Create a subscription for a customer using the Price ID:

```javascript
const subscription = await createSubscription('customer_id', 'price_id');
```

Parameters:

- `customerID` (required): The Customer ID of the user.
- `priceId` (required): The Price ID of the plan.

### Retrieve a User's Current Plan (first subscription)

Fetch details of a users first plan using the Customer ID:

```javascript
const plan = await getUserFirstActivePlan('customer__id');
```

Parameters:

- `customerId` (required): The Customer ID of the user.

Returns: object {subscription, plan}
- first subscription or null
- first plan or null if no plan is found

### Retrieve a User's Subscription

Fetch details of a specific subscription using its Stripe ID:

```javascript
const subscriptionDetails = await getUserSubscription('subscription_id');
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.


### Update a User's Subscription

Update a users existing subscription:

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const subscriptionDetails = await updateSubscriptionPlan('subscription_id', 'options object')
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the existing subscription.
- `options` : The Stripe api subscription update parameters.

### Change a User's Subscription

Change a users existing subscription first item product/price using its Stripe ID:

Deletes the old one plan/price and adds the new one to the subscription item.
This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const subscriptionDetails = await changeSubscriptionPlan('subscription_id', 'item_id', 'new_price_id')
```

Parameters:

- `subscriptionID` (required): The Stripe subscription ID of the existing subscription.
- `item_id` (required): The Stripe Item ID of the plan.
- `new_price_id` (required): The Stripe Price ID of the new plan (price_id).


### Add a single price to a User's Subscription

Add a quantity of an item to a users existing subscription:

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const subscriptionItem = await addItemToSubscription("subscriptionId", "priceId", "quantity", "proration_behavior")
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the existing subscription.
- `priceId` (required): The Stripe Price ID of the item.
- `quantity` (optional): The quantity of the item you are adding. Defaults to 1. Will add to existing quantity or add the item to the subsdcription if it doesnt exist.
- `proration_behavior` (optional): Determines how to handle prorations when the billing cycle changes (e.g., when switching plans, resetting billing_cycle_anchor=now, or starting a trial), or if an item’s quantity changes. The default value is always_invoice. ('create_prorations', 'none', 'always_invoice')


### Update an items quantity on a User's Subscription

Update a subscription items quantity on a users existing subscription:

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const updatedSubscriptionItem = await updateItemQuantity("subscriptionItemId", "newQuantity", "proration_behavior")
```

Parameters:

- `subscriptionItemId` (required): The ID of the existing ITEM in the subscription (not the subscription ID).
- `newQuantity` (required): The new quanity of the item. Does not add or subtract, it updates the quantity to the new number.
- `proration_behavior` (optional): Determines how to handle prorations when the billing cycle changes (e.g., when switching plans, resetting billing_cycle_anchor=now, or starting a trial), or if an item’s quantity changes. The default value is always_invoice. ('create_prorations', 'none', 'always_invoice')


### Update an items quantity on a User's Subscription by Price ID

Update a subscription items quantity on a users existing subscription:

This function will ADD an item to a subscription, or UPDATE the quantity if an item is already present on the subscription. 

If the quantity is 0, the item will be DELETED from the subscription.

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const updatedSubscriptionItem = await updateItemQuantityByPriceId("subscriptionId", "priceId", "newQuantity", "proration_behavior")
```

Parameters:

- `subscriptionItemId` (required): The ID of the existing ITEM in the subscription (not the subscription ID).
- `priceId` (required): The Stripe Price ID of the item.
- `newQuantity` (required): The new quanity of the item. Does not add or subtract, it updates the quantity to the new number.
- `proration_behavior` (optional): Determines how to handle prorations when the billing cycle changes (e.g., when switching plans, resetting billing_cycle_anchor=now, or starting a trial), or if an item’s quantity changes. The default value is always_invoice. ('create_prorations', 'none', 'always_invoice')



### Remove a quantity of an item on a User's Subscription

Update a subscription items quantity on a users existing subscription by removing a certain number:

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const updatedSubscriptionItem = await removeItemsFromSubscription("subscriptionItemId", "removeQuantity", "proration_behavior")
```

Parameters:

- `subscriptionItemId` (required): The ID of the existing ITEM in the subscription (not the subscription ID).
- `removeQuantity` (required): The number you wish to remove of item. Subtracts the given quantity from the existing amount.
- `proration_behavior` (optional): Determines how to handle prorations when the billing cycle changes (e.g., when switching plans, resetting billing_cycle_anchor=now, or starting a trial), or if an item’s quantity changes. The default value is always_invoice. ('create_prorations', 'none', 'always_invoice')


### Remove a quantity of an item on a User's Subscription using the Price ID

Update a subscription items quantity on a users existing subscription by removing a certain number:

This will use the current payment method by default.
Customer must have an existing subscription.

```javascript
const updatedSubscriptionItem = await removeItemsByPriceId("subscriptionId", "priceId", "removeQuantity", "proration_behavior")
```

Parameters:

- `subscriptionId` (required): The subscriptionID of the subscription.
- `priceId` (required): The Stripe Price ID of the item.
- `removeQuantity` (required): The number you wish to remove of item. Subtracts the given quantity from the existing amount.
- `proration_behavior` (optional): Determines how to handle prorations when the billing cycle changes (e.g., when switching plans, resetting billing_cycle_anchor=now, or starting a trial), or if an item’s quantity changes. The default value is always_invoice. ('create_prorations', 'none', 'always_invoice')


### Get a subscription Item by Price ID

Retrieve a subscription item on a users existing subscription by using the price id:

Customer must have an existing subscription.
No item returns null.

```javascript
const subscriptionItem = await getASubscriptionItemByPriceId("subscriptionId", "priceId")
```

Parameters:

- `subscriptionId` (required): The subscriptionID of the subscription.
- `priceId` (required): The Stripe Price ID of the item.



### List all subscription Items in a subscription

Retrieve a list of all the subscription items on a users existing subscription:

Customer must have an existing subscription.

```javascript
const subscriptionItem = await getASubscriptionItemByPriceId("subscriptionID")
```

Parameters:

- `subscriptionID` (required): The ID of the users subscription.


### Get Detailed Information About a Subscription

To fetch comprehensive details about a subscription, including its associated price metadata:

```javascript
const detailedInfo = await getUserSubscriptionDetails('subscription_id');
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.

### Update Metadata for a User's Subscription

If you wish to modify the metadata of a subscription:

```javascript
const updatedSubscription = await updateUserSubscriptionMetadata('subscription_id', { key: 'newValue' });
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.
- `metadata` (required): An object containing key-value pairs for metadata updates.

### List All Active Subscriptions for a User

Retrieve a list of all active subscriptions associated with a particular customer:

```javascript
const activeSubscriptions = await listUserSubscriptions('customer_id');
```

Parameters:

- `customerID` (required): The Stripe ID of the customer.

### Cancel a User's Subscription

To cancel a subscription:

```javascript
const cancelledSubscription = await cancelUserSubscription('subscription_id');
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.

### Retrieve User's Subscription Period

To cancel a subscription:

```javascript
const periodData = await getSubscriptionPeriod('subscription_id');
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.

Returns: 

- `start` period start JS Date
- `end` period end JS Date

## Webhook Handler with Next.js

In the Next.js 13 environment, API routes provide a solution to build your backend functionality. The `next-stripe-helper` comes equipped with a webhook handler specifically designed for easy integration with Next.js API routes.

If you add the webhookHandler to an api route, your Database can automatically stay in sync with Stripe Products, Prices, and Subscriptions.

First create your DB functions (upsertProductRecord, upsertPriceRecord, manageSubscriptionStatusChange, manageCustomerDetailsChange), then use them with the webhookHandler function in an api endpoint. 

```javascript
async function upsertProductRecord(product)
```
Returns: 

- `product` Stripe Product Data

```javascript
async function upsertPriceRecord(price)
```
Returns: 

- `price` Stripe Price Data

```javascript
async function manageSubscriptionStatusChange(subscriptionId, customerId, isCreated)
```
Returns: 

- `subscriptionId` string - Stripe Subcription ID
- `customerId` string - Stripe Customer ID
- `isCreated` string - is newly created

```javascript
async function manageCustomerDetailsChange(stripeCustomer, eventType)
```
Returns: 

- `stripeCustomer` object - Stripe Customer data
- `eventType` string - 'created', 'updated', 'deleted'

You can find example functions below that use MongoDb, but it can be used with any DB type.


### Usage

First, you'll need to import the webhook handler into your API route:

```javascript
import { webhookHandler } from 'stripe-next-helper'; 
```

Then, set up an API route in Next.js to handle the Stripe webhook:

```javascript
// pages/api/stripe/webhook/route.js

import { webhookHandler } from 'next-stripe-helper';
import { 
  manageSubscriptionStatusChange, 
  manageCustomerDetailsChange, 
  upsertPriceRecord, 
  upsertProductRecord 
} from '@/lib/stripe';
import { headers } from "next/headers"

export async function POST(req) {
    try {
        const body = await req.text();
        const signature = headers().get("Stripe-Signature");

        if (!signature) {
            throw new Error('Stripe signature missing from headers');
        }

        await webhookHandler(
            upsertProductRecord, 
            upsertPriceRecord, 
            manageSubscriptionStatusChange, 
            manageCustomerDetailsChange,
            { body, signature }
        );

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}


```

Examples of Webhook helper functions you could use with a MongoDB Database.

``` javascript
import { ObjectId } from "mongodb";
import Stripe from "stripe";

import clientPromise from "@/lib/mongodb";

import { convertToNumberOrBoolean } from "./utils";
import { getCustomer } from "next-stripe-helper";

const stripeSecret = process.env.STRIPE_SECRET_LIVE || process.env.STRIPE_SECRET || "";

/**
 * Initialize the Stripe SDK with the secret key.
 */
const stripe = new Stripe(stripeSecret, {
  apiVersion: "2023-08-16",
});

const dbName = process.env.MONGODB_DB;

export const getActiveProductsWithPrices = async () => {
  try {
    const client = await clientPromise;
    const data = await client
      .db(dbName)
      .collection("products")
      .aggregate([
        {
          $lookup: {
            from: "prices",
            localField: "_id",
            foreignField: "product_id",
            as: "prices",
          },
        },
        { $match: { active: true, "prices.active": true } },
        { $sort: { "metadata.index": 1, "prices.unit_amount": 1 } },
      ])
      .toArray();

    return data || [];
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

export const getActiveApiProductsWithPrices = async () => {
  try {
    const client = await clientPromise;
    const data = await client
      .db(dbName)
      .collection("products")
      .aggregate([
        {
          $lookup: {
            from: "prices",
            localField: "_id",
            foreignField: "product_id",
            as: "prices",
          },
        },
        {
          $match: {
            active: true,
            "prices.active": true,
            "metadata.is_api_product": "true",
          },
        },
        { $sort: { "metadata.index": 1, "prices.unit_amount": 1 } },
      ])
      .toArray();

    return data || [];
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

export const upsertProductRecord = async (product) => {
  const productData = {
    _id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? undefined,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };
  const client = await clientPromise;
  const result = await client
    .db(dbName)
    .collection("products")
    .updateOne({ _id: productData._id }, { $set: productData }, { upsert: true });

  if (result.upsertedCount || result.modifiedCount) {
    console.log(`Product inserted/updated: ${product.id}`);
  }
};

export const upsertPriceRecord = async (price) => {
  const priceData = {
    _id: price.id,
    product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? undefined,
    type: price.type,
    unit_amount: price.unit_amount ?? undefined,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
    trial_period_days: price.recurring?.trial_period_days,
    metadata: price.metadata,
  };
  const client = await clientPromise;
  const result = await client
    .db(dbName)
    .collection("prices")
    .updateOne({ _id: priceData._id }, { $set: priceData }, { upsert: true });

  if (result.upsertedCount || result.modifiedCount) {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

const copyBillingDetailsToCustomer = async (uuid, payment_method) => {
  const customer = payment_method.customer;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;

  //optionally you can add illing details to your stripe customer
  await stripe.customers.update(customer, { name, phone, address });

  const client = await clientPromise;
  const result = await client
    .db(dbName)
    .collection("users")
    .findOneAndUpdate(
      { _id: new ObjectId(uuid) },
      {
        $set: {
          billing_address: { ...address },
          payment_method: { ...payment_method[payment_method.type] },
        },
      },
      { returnDocument: "after" }
    );
  if (!result) {
    console.error("Error updating user billing details");
    throw new Error("Error updating user billing details");
  }
};

export const checkSubscriptionLimit = async (collectionKey, metadataKey, userId) => {
  if (!collectionKey || !metadataKey || !userId) return;

  const client = await clientPromise;

  const subscription = await client
    .db(dbName)
    .collection("subscriptions")
    .findOne({ user_id: new ObjectId(userId), status: "active" });

  if (!subscription) {
    return false;
  }

  const product = await client
    .db(dbName)
    .collection("products")
    .findOne({ _id: subscription.items[0].product_id });

  if (!product) {
    return false;
  }

  let limit = convertToNumberOrBoolean(product.metadata[metadataKey]);

  let result;
  let allowed = false;
  if (typeof limit !== "boolean") {
    const count = await client
      .db(dbName)
      .collection(collectionKey)
      .countDocuments({ userId: new ObjectId(userId) });
    allowed = count < limit;
    result = count;
  } else {
    allowed = limit;
    limit = 0;
    result = 0;
  }

  return { allowed, result, limit };
};

export const manageSubscriptionStatusChange = async (
  subscriptionId,
  customerId,
  createAction = false
) => {

  const customer = await getCustomer(customerId);

  const client = await clientPromise;
  const user = await client.db(dbName).collection("users").findOne({ email: customer.email });

  if (!user) {
    console.log("manageSubscriptionStatusChange: Customer not found. id:", customerId);
    throw new Error("Customer not found");
  } else {
    console.log("manageSubscriptionStatusChange: Customer found: ", customerId);
  }

  const uuid = user._id.toString();

  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"],
    });
  } catch (error) {
    console.log("manageSubscriptionStatusChange: Stripe Error: ", error);
    throw new Error("Stripe error retrieving subscription in manageSubscriptionStatusChange.");
  }

  if (!subscription) {
    throw new Error(
      "Stripe error retrieving subscription in manageSubscriptionStatusChange.",
      subscription
    );
  } else {
    console.log("manageSubscriptionStatusChange: Stripe subscription found.", subscription.id);
  }

  const subscriptionItems = subscription.items.data.map((item) => ({
    price_id: item.price.id,
    product_id: item.price.product,
    quantity: item.quantity,
  }));

  const existingSubscription = await client
    .db(dbName)
    .collection("subscriptions")
    .findOne({ user_id: new ObjectId(uuid) });

  let subscriptionData;
  if (!existingSubscription) {
    // If the subscription doesn't exist, include the _id field for the new document
    subscriptionData = {
      _id: subscription.id,
      user_id: new ObjectId(uuid),
      team_id: new ObjectId(subscription.metadata.team_id),
      metadata: subscription.metadata,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      items: subscriptionItems,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      created: new Date(subscription.created * 1000),
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    };
  } else {
    // If the subscription exists, omit the _id field to avoid the immutable field error
    subscriptionData = {
      user_id: new ObjectId(uuid),
      team_id: new ObjectId(subscription.metadata.team_id),
      metadata: subscription.metadata,
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      items: subscriptionItems,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      created: new Date(subscription.created * 1000),
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    };
  }

  const result = await client
    .db(dbName)
    .collection("subscriptions")
    .updateOne({ user_id: new ObjectId(uuid) }, { $set: subscriptionData }, { upsert: true });

  if (result.upsertedCount || result.modifiedCount) {
    console.log(`Inserted/updated subscription [${subscriptionId}] for user [${uuid}]`);
  } else {
    console.error(
      `manageSubscriptionStatusChange: Subscription for user [${uuid}] was not updated.`,
      result
    );
  }

  if (createAction && subscription.default_payment_method && uuid) {
    await copyBillingDetailsToCustomer(uuid, subscription.default_payment_method);
  }
};

export async function manageCustomerDetailsChange(stripeCustomer, eventType) {
  if(eventType !== 'deleted'){
    try {
      const client = await clientPromise;
      await client.db(dbName).collection("users").findOneAndUpdate({ email: stripeCustomer.email },{
        $set: {customerId: stripeCustomer.id}
      });
  
    } catch (error) {
      throw error
    }
  }
}
```

### Configuration

1. **Environment Variables**: Ensure you have set the `STRIPE_WEBHOOK_SECRET_LIVE` or `STRIPE_WEBHOOK_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files). With Next.js, you can access these environment variables using `process.env`. Remember best practice is giving the api key the least amount of access needed.

2. **Stripe Dashboard**: Configure your Stripe dashboard to send webhooks to `https://your-domain.com/api/stripe-webhook`.

### Important Notes

- As with the general use-case, you need to provide the `upsertProduct`, `upsertPrice`, `manageSubscriptionChange`, and `manageCustomerDetailsChange` callback functions. These functions will handle the various events as they occur on Stripe.
  
- Always handle errors gracefully. The provided webhook handler has built-in error handling, but you may want to extend or customize this for your specific needs.

### Deployment

When deploying your Next.js application, make sure to include your Stripe webhook secret in your production environment variables or secrets management solution. Never expose the secret or api keys.

## Error Handling

All utility functions incorporate internal error handling. You can catch these errors using try/catch. Ensure your project provides meaningful and appropriate error handling based on your application's needs.

## Contributing

Feel free to contribute to the project by submitting a pull request or raising an issue.
[Next Stripe Helper Repo](https://github.com/i-dream-of-ai/next-stripe-helper)

## License

MIT License