import Stripe from 'stripe';
import { ManageCustomerDetailsChangeFunction, ManageSubscriptionChangeFunction } from './handleCheckoutSessionCompleted';
interface UpsertProductFunction {
    (product: Stripe.Product): Promise<void>;
}
interface UpsertPriceFunction {
    (price: Stripe.Price): Promise<void>;
}
type WebhookEvent = {
    body: string;
    signature: string;
};
/**
 * Handles incoming webhook events from Stripe.
 *
 * @param {UpsertProductFunction} upsertProduct - Function to upsert a product.
 * @param {UpsertPriceFunction} upsertPrice - Function to upsert a price.
 * @param {ManageSubscriptionChangeFunction} manageSubscriptionChange - Function to manage subscription changes.
 * @param {ManageCustomerDetailsChangeFunction} manageCustomerDetailsChange - Function to manage customer details changes.
 * @param {WebhookEvent} event - The webhook event object containing the body and signature.
 * @returns {Promise<{ received: boolean, message?: string }>} - A promise that resolves to an object indicating whether the event was received and an optional message.
 * @throws {Error} - Throws an error if there's an issue processing the webhook event.
 */
export declare const webhookHandler: (upsertProduct: UpsertProductFunction, upsertPrice: UpsertPriceFunction, manageSubscriptionChange: ManageSubscriptionChangeFunction, manageCustomerDetailsChange: ManageCustomerDetailsChangeFunction, event: WebhookEvent) => Promise<{
    received: boolean;
    message?: string;
}>;
export {};
