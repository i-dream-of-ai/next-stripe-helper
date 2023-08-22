import { Stripe } from 'stripe';
import { handleStripeError, stripe } from '../utils/stripe';

/**
 * Create a checkout session in Stripe for making purchases or setting up subscriptions.
 * 
 * @param options - The options for creating the checkout session.
 * @returns A promise that resolves to the created checkout session or `undefined` if an error occurs.
 * @throws {Stripe.errors.StripeError} If there's an error during session creation.
 */
const createCheckoutSession = async (options: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session | undefined> => {
  try {
    const session = await stripe.checkout.sessions.create(options);
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
