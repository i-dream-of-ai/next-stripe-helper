# next-stripe-helper

A utility module to simplify Stripe checkout session interactions in a Next.js environment.

## Introduction
`next-stripe-helper` is a module designed to simplify the integration of Stripe's functionality into Next.js applications. Whether you're looking to process payments, manage customers, or handle subscriptions, this utility aims to streamline those interactions. This utility is perfect for developers building e-commerce platforms, subscription-based services, or any other application that requires payment functionalities within the Next.js ecosystem.

## Installation

```bash
npm install next-stripe-helper
```

## Prerequisites

Ensure you've set up Stripe and have an error handler in your project, as this utility relies on those components. 

You will likely want to start in TEST MODE!! Make sure you use the test mode switch to turn Test Mode on before proceeding. Once you are setup and ready to take live payments, turn off test mode, get your LIVE stripe keys, and setup your LIVE webhooks secret and endpoint.

Ensure you have set the `STRIPE_SECRET_LIVE` or `STRIPE_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files). With Next.js, you can access these environment variables using `process.env`.

Ensure you have set the `STRIPE_WEBHOOK_SECRET_LIVE` or `STRIPE_WEBHOOK_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files). With Next.js, you can access these environment variables using `process.env`.

``` dotenv

# Stripe configuration
STRIPE_SECRET=your_stripe_TEST_secret_key
STRIPE_WEBHOOK_SECRET=your_TEST_stripe_webhook_secret

STRIPE_SECRET_LIVE=your_LIVE_stripe_secret_key
STRIPE_WEBHOOK_SECRET_LIVE=your_LIVE_stripe_webhook_secret

```

Make sure you complete your checkout settings from within the Stripe dashboard before using any checkout functions. [Checkout Settings](https://dashboard.stripe.com/settings/checkout)

Make sure you add your webhooks endpoint URL!! [Setup Webhook URL](https://dashboard.stripe.com/webhooks)

## Usage

First, ensure that you've imported the necessary functions from the package:

```javascript
import { createCheckoutSession, createCheckoutSessionForSavingCard } from 'next-stripe-helper';
```

1. **Create Checkout Session**

   Create a checkout session with Stripe.

   ```javascript
   const session = await createCheckoutSession(
       'https://your-success-url.com',
       'https://your-cancel-url.com',
       itemsArray,  // Your array of line items
       'subscription',
       'customer_id',
       {}  // Additional optional parameters
   );
   ```

   Parameters:

   - `successUrl` (required): The URL to redirect upon successful payment.
   - `cancelUrl` (optional, default `""`): The URL to redirect upon payment cancellation.
   - `itemsArray` (required): An array of line items for the checkout.
   - `mode` (optional, default `subscription`): The mode of the checkout session (`subscription` or `payment`).
   - `customerId` (required): The Stripe customer ID.
   - `additionalParams` (optional, default `{}`): Any other additional parameters.

2. **Create Checkout Session for Saving Card**

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

1. **Create a New Stripe Customer**

   Create a new customer in Stripe using their email address.

   ```javascript
   const newCustomer = await createCustomer('example@email.com');
   ```

   Parameters:

   - `email` (required): The email address of the new customer.

2. **Retrieve Customer Details**

   Fetch the details of a specific customer using their Stripe customer ID.

   ```javascript
   const customerDetails = await getCustomer('customer_id');
   ```

   Parameters:

   - `customerId` (required): The Stripe customer ID.

3. **Update a Customer's Details**

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
const portalUrl = await createPortalLink('customer_id', 'https://your-return-url.com');
```

Parameters:

- `customer` (required): The Stripe customer ID.
- `returnUrl` (required): The URL where the user will be redirected after exiting the billing portal.

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


## Subscription Utilities

The `next-stripe-helper` package offers a suite of utilities designed to streamline interactions with Stripe subscriptions.

### Usage

Before you can use these utilities, you need to import them:

```javascript
import {
    getUserSubscription,
    getUserSubscriptionDetails,
    updateUserSubscriptionMetadata,
    listUserSubscriptions,
    cancelUserSubscription
} from 'next-stripe-helper';
```

### Retrieve a User's Subscription

Fetch details of a specific subscription using its Stripe ID:

```javascript
const subscriptionDetails = await getUserSubscription('subscription_id');
```

Parameters:

- `subscriptionID` (required): The Stripe ID of the subscription.

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

## Webhook Handler with Next.js

In the Next.js environment, API routes provide a solution to build your backend functionality. The `next-stripe-helper` comes equipped with a webhook handler specifically designed for easy integration with Next.js API routes.

### Usage

First, you'll need to import the webhook handler into your API route:

```javascript
import { webhookHandler } from 'stripe-next-helper'; 
```

Then, set up an API route in Next.js to handle the Stripe webhook:

```javascript
// pages/api/stripe/webhook/route.js

import { webhookHandler } from 'stripe-next-helper'; 

// Import or define upsertProduct, upsertPrice, and manageSubscriptionChange here. These are functions you create to handle the Database updates.

// Ensure you have error handling and necessary functions.
export async function POST(req) {
  try {
    // Validate if the request is legitimate (e.g., you might want to check if there's a user session, but for a stripe webhook, it might not be necessary.)

    const handleWebhook = webhookHandler(
      async (product) => {
        // upsertProduct logic here
      },
      async (price) => {
        // upsertPrice logic here
      },
      async (subscriptionId, customerId, isNew) => {
        // manageSubscriptionChange logic here
      }
    );

    // Call the handler with the adapted request/response format
    const response = await handleWebhook(req, {
      status: (statusCode) => ({ statusCode }),
      json: (body) => new Response(JSON.stringify(body)),
      setHeader: (name, value) => {}, // You can extend this if needed
      end: (text) => new Response(text)
    });

    return response;

  } catch (error) {
    // Handle your errors. If it's a validation error, return a 422 status. Otherwise, return a 500 status.
    if (/* it's a validation error */) {
      return new Response(JSON.stringify(/* error details */), { status: 422 });
    }

    return new Response(null, { status: 500 });
  }
}

```

## Sync with Stripe

## Syncing Stripe Products with Your Local Database

To ensure that your local database reflects your current Stripe products, you can utilize the provided syncing utility. First create DB functions, then use them with the syncWithStripe function in an api endpoint. You can then create a simple button in your app that triggers the sync function.

### Integration Steps:

1. **Add the Syncing Endpoint**:

Set up an API route in your Next.js project that uses the sync utility:

```javascript
// pages/api/syncStripe.js
import { syncWithStripe } from 'next-stripe-helper';

const dbOperations = {
    getAllLocalProducts: async () => { /* fetch all products from the DB */ },
    addProduct: async (product) => { /* add new product to the DB */ },
    updateProduct: async (product) => { /* update existing product in the DB */ },
};

export default async (req, res) => {
    if (req.method === 'POST') {
        const result = await syncWithStripe(dbOperations);

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(500).json({ error: result.error, details: result.details });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
};
```

### Configuration

1. **Environment Variables**: Ensure you have set the `STRIPE_WEBHOOK_SECRET_LIVE` or `STRIPE_WEBHOOK_SECRET` environment variables in your `.env.local` (or other environment-specific `.env` files). With Next.js, you can access these environment variables using `process.env`.

2. **Stripe Dashboard**: Configure your Stripe dashboard to send webhooks to `https://your-domain.com/api/stripe-webhook`.

### Important Notes

- As with the general use-case, you need to provide the `upsertProduct`, `upsertPrice`, and `manageSubscriptionChange` callback functions. These functions will handle the various events as they occur on Stripe.
  
- Always handle errors gracefully. The provided webhook handler has built-in error handling, but you may want to extend or customize this for your specific needs.

### Deployment

When deploying your Next.js application, make sure to include your Stripe webhook secret in your production environment variables or secrets management solution.

## Error Handling

All utility functions incorporate internal error handling. You can catch these errors using try/catch. Ensure your project provides meaningful and appropriate error handling based on your application's needs.

## Contributing

Feel free to contribute to the project by submitting a pull request or raising an issue.

## License

MIT License