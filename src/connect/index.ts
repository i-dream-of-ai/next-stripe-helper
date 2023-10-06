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

/**
 * Handles the OAuth callback by exchanging the authorization code for a connected account ID.
 *
 * @param {string} authorizationCode - The authorization code returned by Stripe.
 * @returns {Promise<string | null>} - A promise that resolves to the connected account ID or null if it doesnt exist.
 */
const handleOAuthCallback = async (authorizationCode: string): Promise<string | null> => {

  
    try {
      // Exchange the authorization code for an access token and connected account ID
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code: authorizationCode,
      });
  
      // Return the connected account ID
      return response.stripe_user_id || null;
    } catch (error) {
      handleStripeError(error as Stripe.errors.StripeError);
    }
  };


/**
 * Initiates the Stripe OAuth flow.
 *
 * @param {string} clientId - Your Stripe client ID.
 * @param {string} redirectUri - The URL where Stripe should redirect the user after completing the OAuth flow.
 */
const startOAuthFlow = (clientId: string, redirectUri: string) => {
    // Ensure the parameters are provided
    if (!clientId || !redirectUri) {
      throw new Error('Both clientId and redirectUri are required.');
    }
  
    // Construct the OAuth URL
    const oauthURL = new URL('https://connect.stripe.com/oauth/authorize');
    oauthURL.searchParams.set('response_type', 'code');
    oauthURL.searchParams.set('client_id', clientId);
    oauthURL.searchParams.set('scope', 'read_write');
    oauthURL.searchParams.set('redirect_uri', redirectUri);
  
    // Redirect the user to the OAuth URL
    return oauthURL.toString();
};

/**
 * Creates an account link for onboarding or updating a connected account.
 *
 * @param {Stripe.AccountLinkCreateParams} options - The options for creating the account link.
 * @returns {Promise<Stripe.AccountLink>} - A promise that resolves to the created account link.
 */
const createAccountLink = async (options: Stripe.AccountLinkCreateParams): Promise<Stripe.AccountLink> => {
    const { account, refresh_url, return_url, type = 'account_onboarding' } = options;  // Set default value here
  
    try {
      const accountLink = await stripe.accountLinks.create({
        account,
        refresh_url,
        return_url,
        type,
      });
      return accountLink;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
};


/**
 * Retrieves a Stripe Connect account.
 *
 * @param {string} accountId - The ID of the connected account.
 * @returns {Promise<Stripe.Account>} - A promise that resolves to the retrieved account.
 * @throws {Error} - If there's an error during the request.
 */
const retrieveAccount = async (accountId: string): Promise<Stripe.Account> => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    handleStripeError(error as Stripe.errors.StripeError);
  }
};


/**
 * Creates a Connect Express login link for a connected account.
 *
 * @param {string} accountId - The ID of the connected account.
 * @param {string} secretKey - Your Stripe secret key.
 * @returns {Promise<string>} - A promise that resolves to the created login link URL.
 * @throws {Error} - If there's an error during the request.
 */
const createConnectExpressLoginLink = async (accountId: string): Promise<string> => {
    try{
      const loginLink = await stripe.accounts.createLoginLink(
        accountId
      );
      return loginLink.url;
    } catch (error) {
        handleStripeError(error as Stripe.errors.StripeError);
    }
};

/**
 * Lists all transfers for a Stripe Connect account.
 *
 * @param {Stripe.TransferListParams} [params] - Parameters to filter the list of transfers.
 * @returns {Promise<Stripe.ApiListPromise<Stripe.Transfer>>} A promise that resolves with the list of transfers.
 */
async function listAllTransfers(
  params?: Stripe.TransferListParams
): Promise<Stripe.ApiListPromise<Stripe.Transfer>> {
  try {
    const transfers = await stripe.transfers.list(
      params
    );
    return transfers;
  } catch (error) {
    console.error("Error listing transfers:", error);
    throw error;
  }
}

export {
  createConnectedAccount,
  createPayout,
  startOAuthFlow,
  handleOAuthCallback,
  createAccountLink,
  retrieveAccount,
  createConnectExpressLoginLink,
  listAllTransfers
};