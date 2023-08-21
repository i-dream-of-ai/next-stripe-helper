import { stripe } from '../utils/stripe';
import { buffer } from 'micro';

const webhookHandler = (upsertProduct, upsertPrice, manageSubscriptionChange) => async (req, res) => {
    try {
        if (req.method === 'POST') {
            const buf = await buffer(req);
            const sig = req.headers['stripe-signature'];

            const webhookSecret =
                process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;

            let event;
            try {
                if (!sig || !webhookSecret) return;
                event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
                console.log('stripe event', event);
            } catch (err) {
                console.log(`❌ Error message: ${err.message}`);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            const relevantEvents = new Set([
                'product.created',
                'product.updated',
                'price.created',
                'price.updated',
                'checkout.session.completed',
                'customer.subscription.created',
                'customer.subscription.updated',
                'customer.subscription.deleted',
            ]);

            if (relevantEvents.has(event.type)) {
                try {
                    switch (event.type) {
                        case 'product.created':
                        case 'product.updated':
                            await upsertProduct(event.data.object);
                            break;
                        case 'price.created':
                        case 'price.updated':
                            await upsertPrice(event.data.object);
                            break;
                        case 'customer.subscription.created':
                        case 'customer.subscription.updated':
                        case 'customer.subscription.deleted':
                            const subscription = event.data.object;
                            await manageSubscriptionChange(
                                subscription.id,
                                subscription.customer,
                                event.type === 'customer.subscription.created'
                            );
                            break;
                        case 'checkout.session.completed':
                            const checkoutSession = event.data.object;
                            if (checkoutSession.mode === 'subscription') {
                                const subscriptionId = checkoutSession.subscription;
                                await manageSubscriptionChange(
                                    subscriptionId,
                                    checkoutSession.customer,
                                    true
                                );
                            }
                            break;
                        default:
                            throw new Error('Unhandled relevant event!');
                    }
                } catch (error) {
                    console.log('Webhook error: "Webhook handler failed.', error);
                    return res.status(400).send('Webhook error: "Webhook handler failed. View logs."');
                }
            }

            res.json({ received: true });
        } else {
            console.log('Webhook error: Method not allowed.', req.method);
            res.setHeader('Allow', 'POST');
            res.status(405).end('Method Not Allowed');
        }
    } catch (error) {
        console.log(`Webhook error: ${error.message}`);
        res.status(400).send(`Webhook error: ${error.message}`);
    }
};

export default webhookHandler;