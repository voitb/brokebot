import { Client, Databases, Users } from 'node-appwrite';
import Stripe from 'stripe';

// Validation function to check for required environment variables
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
            'STRIPE_SUCCESS_URL',
            'STRIPE_CANCEL_URL',
        ]);
    } catch (e) {
        error(e.message);
        return res.json({ ok: false, message: e.message }, 500);
    }

    if (req.method !== 'POST') {
        return res.json({ ok: false, message: 'Method Not Allowed' }, 405);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        const { priceId } = JSON.parse(req.body);
        const userJwt = req.headers['x-appwrite-user-jwt'];

        if (!priceId) {
            return res.json({ ok: false, message: 'priceId is required' }, 400);
        }

        if (!userJwt) {
            return res.json({ ok: false, message: 'User not authenticated' }, 401);
        }

        // Get user info from JWT
        client.setJWT(userJwt);
        const users = new Users(client);
        const user = await users.get('current');

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer_email: user.email,
            success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: process.env.STRIPE_CANCEL_URL,
            metadata: {
                appwriteUserId: user.$id,
            }
        });
        
        log(`Created checkout session ${session.id} for user ${user.$id}`);

        return res.json({ ok: true, sessionId: session.id });

    } catch (e) {
        error(e.message);
        return res.json({ ok: false, message: e.message }, 500);
    }
}; 