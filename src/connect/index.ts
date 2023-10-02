import { Stripe } from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';


interface CreatePayoutOptions {
  amount: number;
  currency: string;
  destination: string;
}

interface CustomAccountCreateParams extends Stripe.AccountCreateParams {
    type?: 'express' | 'custom' | 'standard';
  }
  
  /**
   * Create a connected account with Stripe.
   * 
   * @param {Object} userOptions - The options for creating the connected account.
   * 
   * @returns {Promise<Stripe.Account | undefined>} - A promise that resolves to the created connected account or `undefined` if an error occurs.
   * @throws {Stripe.errors.StripeError} - If there's an error during account creation.
   */
  const createConnectedAccount = async (userOptions: CustomAccountCreateParams): Promise<Stripe.Account | undefined> => {
    const defaultOptions: CustomAccountCreateParams = {
      type: 'express',
      capabilities: {
        transfers: { requested: true },
      },
    };
  
    const options = {
      ...defaultOptions,
      ...userOptions,
    };
  
    try {
      const account = await stripe.accounts.create(options);
      return account;
    } catch (error) {
      handleStripeError(error as Stripe.errors.StripeError);
    }
}

/**
 * Create a payout to a connected account.
 * 
 * @param {Object} options - The options for creating the payout.
 * @param {number} options.amount - The amount to payout.
 * @param {string} options.currency - The currency of the payout.
 * @param {string} options.destination - The ID of the connected account to payout to.
 * 
 * @returns {Promise<Stripe.Payout | undefined>} - A promise that resolves to the created payout or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} - If there's an error during payout creation.
 */
const createPayout = async (options: CreatePayoutOptions): Promise<Stripe.Payout | undefined> => {
  const { amount, currency, destination } = options;

  try {
    const payout = await stripe.payouts.create({
      amount,
      currency,
      destination,
    });
    return payout;
  } catch (error) {
    handleStripeError(error as Stripe.errors.StripeError);
  }
}

export {
  createConnectedAccount,
  createPayout,
};