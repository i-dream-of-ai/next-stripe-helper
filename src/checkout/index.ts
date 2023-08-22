import { Stripe } from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 */
const createCheckoutSession = async (
  successUrl: string,
  cancelUrl: string = "",
  itemsArray: Stripe.Checkout.SessionCreateParams.LineItem[],
  mode: Stripe.Checkout.SessionCreateParams.Mode = "subscription",
  customerId: string,
  additionalParams: Partial<Stripe.Checkout.SessionCreateParams> = {}
): Promise<Stripe.Checkout.Session | undefined> => {
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: itemsArray,
      mode: mode,
      customer: customerId,
      ...additionalParams
    });
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
): Promise<string | undefined> => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
    });
    return session.id;
  } catch (error) {
    handleStripeError(error as Stripe.errors.StripeError);
  }
};

export {
  createCheckoutSession,
  createCheckoutSessionForSavingCard
};
