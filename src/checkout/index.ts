import { Stripe } from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

interface CheckoutSessionOptions {
  success_url: string;
  cancel_url?: string;
  line_items?: Stripe.Checkout.SessionCreateParams.LineItem[];
  mode?: 'subscription' | 'payment';
  customer: string;
  client_reference_id: string,
  additionalParams?: Partial<Stripe.Checkout.SessionCreateParams>;
}

/**
 * Create a checkout session with Stripe.
 * 
 * @param {Object} options - The options for creating the checkout session.
 * @param {string} options.success_url - The URL to redirect upon successful payment. (required)
 * @param {string} [options.cancel_url=""] - The URL to redirect upon payment cancellation. (optional, default `""`)
 * @param {Object[]} options.line_items - An array of line items for the checkout. (required unless setup mode)
 * @param {string} [options.mode="subscription"] - The mode of the checkout session (`subscription` or `payment`). (optional, default `subscription`)
 * @param {string} options.customer - The Stripe customer ID. (optional)
 * @param {string} options.client_reference_id - Your local User ID. Used to track the session to the user in your app. (optional)
 * @param {Object} [options.additionalParams] - Additional parameters can be found in the stripe api docs. (optional)
 * 
 * @returns {Promise<Stripe.Checkout.Session | undefined>} - A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} - If there's an error during session creation.
 */
const createCheckoutSession = async (options: CheckoutSessionOptions): Promise<Stripe.Checkout.Session | undefined> => {
  const {
      success_url,
      cancel_url = "",
      line_items,
      mode = 'subscription',
      customer,
      client_reference_id,
      additionalParams = {}
  } = options;

  try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
          success_url,
          cancel_url,
          mode,
          customer,
          client_reference_id,
          ...additionalParams
      };

      if (line_items) {
          sessionParams.line_items = line_items;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return session;
  } catch (error) {
      handleStripeError(error as Stripe.errors.StripeError);
  }
}


/**
 * Create a checkout session in Stripe specifically for saving a customer's card information.
 */
const createCheckoutSessionForSavingCard = async (
  customerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
    });
    return session;
  } catch (error) {
    handleStripeError(error as Stripe.errors.StripeError);
  }
};

export {
  createCheckoutSession,
  createCheckoutSessionForSavingCard
};
