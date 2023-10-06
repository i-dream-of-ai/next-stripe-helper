import { Stripe } from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

/**
 * Creates a new Stripe account.
 *
 * @param {Stripe.AccountCreateParams} params - Parameters for creating the account.
 * @returns {Promise<Stripe.Account>} A promise that resolves with the created account.
 */
async function createAccount(params: Stripe.AccountCreateParams): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.create(params);
      return account;
    } catch (error) {
      console.error("Error creating the account:", error);
      handleStripeError(error as Stripe.errors.StripeError);
    }
}

/**
 * Retrieves a Stripe account.
 *
 * @param {string} accountId - The ID of the account to retrieve.
 * @returns {Promise<Stripe.Account>} A promise that resolves with the retrieved account.
 */
async function getAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      console.error("Error retrieving the account:", error);
      handleStripeError(error as Stripe.errors.StripeError);
    }
}

/**
 * Updates a Stripe account.
 *
 * @param {string} accountId - The ID of the account to update.
 * @param {Stripe.AccountUpdateParams} params - Parameters to update the account.
 * @returns {Promise<Stripe.Account>} A promise that resolves with the updated account.
 */
async function updateAccount(accountId: string, params: Stripe.AccountUpdateParams): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.update(accountId, params);
      return account;
    } catch (error) {
      console.error("Error updating the account:", error);
      handleStripeError(error as Stripe.errors.StripeError);
    }
}

/**
 * Deletes a Stripe account.
 *
 * @param {string} accountId - The ID of the account to delete.
 * @returns {Promise<Stripe.Account>} A promise that resolves with the deleted account.
 */
async function deleteAccount(accountId: string): Promise<Stripe.DeletedAccount> {
    try {
      const account = await stripe.accounts.del(accountId);
      return account;
    } catch (error) {
      console.error("Error deleting the account:", error);
      handleStripeError(error as Stripe.errors.StripeError);
    }
}

export {
    createAccount,
    getAccount,
    updateAccount,
    deleteAccount
};