import { Client, Databases, Query, ID } from 'node-appwrite';
import Stripe from 'stripe';

const validateEnv = (vars) => {
    const missingVars = vars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

class SubscriptionManager {
    constructor(log, error) {
        this.log = log;
        this.error = error;
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        this.databases = new Databases(client);
        this.DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
        this.COLLECTION_ID = process.env.APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
    }

    async findSubscriptionByUserId(userId) {
        try {
            const response = await this.databases.listDocuments(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                [Query.equal('userId', userId), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (e) {
            this.error(`Failed to find subscription for user ${userId}: ${e.message}`);
            throw e;
        }
    }

    async findSubscriptionByStripeId(stripeSubscriptionId) {
        try {
            const response = await this.databases.listDocuments(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                [Query.equal('stripeSubscriptionId', stripeSubscriptionId), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (e) {
            this.error(`Failed to find subscription for stripe ID ${stripeSubscriptionId}: ${e.message}`);
            throw e;
        }
    }
    
    buildSubscriptionData(session) {
        return {
            userId: session.metadata.appwriteUserId,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            status: 'active',
            planId: session.line_items.data[0].price.id,
            // Stripe uses seconds for timestamps, convert to ISO string
            currentPeriodEnd: new Date(session.current_period_end * 1000).toISOString(),
        };
    }

    async createSubscription(session) {
        const data = this.buildSubscriptionData(session);
        await this.databases.createDocument(
            this.DATABASE_ID,
            this.COLLECTION_ID,
            ID.unique(),
            data
        );
        this.log(`Created new subscription for user ${data.userId}`);
    }

    async updateSubscription(docId, session) {
        const data = this.buildSubscriptionData(session);
        await this.databases.updateDocument(
            this.DATABASE_ID,
            this.COLLECTION_ID,
            docId,
            data
        );
        this.log(`Updated subscription ${docId} for user ${data.userId}`);
    }
    
    async updateSubscriptionStatus(stripeSubscriptionId, status, newPeriodEnd = null) {
        const subscription = await this.findSubscriptionByStripeId(stripeSubscriptionId);
        if (subscription) {
            const data = { status };
            if (newPeriodEnd) {
                 // Stripe uses seconds for timestamps, convert to ISO string
                data.currentPeriodEnd = new Date(newPeriodEnd * 1000).toISOString();
            }
            await this.databases.updateDocument(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                subscription.$id,
                data
            );
            this.log(`Updated subscription ${subscription.$id} status to ${status}`);
        } else {
            this.error(`Could not find subscription with Stripe ID ${stripeSubscriptionId} to update.`);
        }
    }
}


export default async ({ req, res, log, error }) => {
    try {
        validateEnv([
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'APPWRITE_ENDPOINT',
            'APPWRITE_PROJECT_ID',
            'APPWRITE_API_KEY',
            'APPWRITE_DATABASE_ID',
            'APPWRITE_COLLECTION_SUBSCRIPTIONS_ID',
        ]);
    } catch (e) {
        error(e.message);
        return res.json({ ok: false, message: e.message }, 500);
    }
    
    if (req.method !== 'POST') {
        return res.json({ ok: false, message: 'Method Not Allowed' }, 405);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subManager = new SubscriptionManager(log, error);
    const sig = req.headers['stripe-signature'];
    
    let event;
    try {
        // req.body is already a string, no need for Buffer.from
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        error(`Webhook Error: ${err.message}`);
        return res.json({ ok: false, message: `Webhook Error: ${err.message}` }, 400);
    }

    log(`Received Stripe event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { appwriteUserId } = session.metadata;

                if (appwriteUserId) {
                    const existingSub = await subManager.findSubscriptionByUserId(appwriteUserId);
                    if (existingSub) {
                        await subManager.updateSubscription(existingSub.$id, session);
                    } else {
                        await subManager.createSubscription(session);
                    }
                } else {
                    error("Webhook received 'checkout.session.completed' but 'appwriteUserId' was not in metadata.");
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                // Update the subscription's end date
                if(invoice.subscription) {
                    await subManager.updateSubscriptionStatus(invoice.subscription, 'active', invoice.period_end);
                }
                break;
            }

            case 'customer.subscription.updated': {
                 const subscription = event.data.object;
                 await subManager.updateSubscriptionStatus(subscription.id, subscription.status, subscription.current_period_end);
                 break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await subManager.updateSubscriptionStatus(subscription.id, 'deleted');
                break;
            }

            default:
                log(`Unhandled event type ${event.type}`);
        }
    } catch (dbError) {
        error(`Database error while handling webhook: ${dbError.message}`);
        // Return 500 so Stripe knows to retry
        return res.json({ ok: false, message: "Internal server error during DB operation." }, 500);
    }

    return res.json({ received: true });
}; 