import { Client, Databases, Query } from 'node-appwrite';
import Stripe from 'stripe';

const validateEnv = (vars) => {
    const missingVars = vars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

export default async ({ req, res, log, error }) => {
    try {
        validateEnv([
            'STRIPE_SECRET_KEY',
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
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);
    const databases = new Databases(client);

    try {
        const userJwt = req.headers['x-appwrite-user-jwt'];
        if (!userJwt) {
            return res.json({ ok: false, message: 'User not authenticated' }, 401);
        }
        
        // We need the Appwrite user ID to find the subscription
        const user = JSON.parse(req.headers['x-appwrite-user']);
        const userId = user.$id;

        // 1. Find the user's subscription in our database to get their Stripe Customer ID
        const subscriptionResponse = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTION_SUBSCRIPTIONS_ID,
            [Query.equal('userId', userId), Query.limit(1)]
        );

        if (subscriptionResponse.documents.length === 0) {
            return res.json({ ok: false, message: 'No active subscription found for this user.' }, 404);
        }

        const stripeCustomerId = subscriptionResponse.documents[0].stripeCustomerId;
        if (!stripeCustomerId) {
            error(`User ${userId} has a subscription document but no stripeCustomerId.`);
            return res.json({ ok: false, message: 'Could not find Stripe customer ID.' }, 500);
        }

        // 2. Create a Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: req.headers['referer'] || 'http://localhost:5173', // Redirect back to the page they came from
        });

        log(`Created portal session for user ${userId}`);

        // 3. Return the one-time URL
        return res.json({ ok: true, url: portalSession.url });

    } catch (e) {
        error(`Error creating portal session: ${e.message}`);
        return res.json({ ok: false, message: e.message }, 500);
    }
}; 