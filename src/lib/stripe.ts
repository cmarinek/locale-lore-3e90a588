import { loadStripe, Stripe } from '@stripe/stripe-js';
import { config } from '@/config/environments';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripePublishableKey);
  }
  return stripePromise;
};
