import { useState, useEffect, useCallback } from 'react';
import { databases, functions } from '@/lib/appwriteClient';
import {
    APPWRITE_DATABASE_ID,
    APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
    APPWRITE_FUNC_CREATE_STRIPE_CHECKOUT_SESSION,
    APPWRITE_FUNC_MANAGE_SUBSCRIPTION,
    STRIPE_PUBLISHABLE_KEY
} from '@/lib/appwriteClient';
import { Query, type Models } from 'appwrite';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/providers/AuthProvider';

// Load Stripe outside of the component render cycle
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface Subscription extends Models.Document {
    userId: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    status: 'active' | 'trialing' | 'inactive' | 'deleted';
    planId: string;
    currentPeriodEnd: string;
}

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const checkSubscriptionStatus = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            setSubscription(null);
            return;
        };

        setIsLoading(true);
        setError(null);

        try {
            const response = await databases.listDocuments<Subscription>(
                APPWRITE_DATABASE_ID,
                APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
                [Query.equal('userId', user.$id), Query.limit(1)]
            );

            if (response.documents.length > 0) {
                const sub = response.documents[0];
                // Check if the subscription is active or trialing
                if(sub.status === 'active' || sub.status === 'trialing') {
                    setSubscription(sub);
                } else {
                    setSubscription(null);
                }
            } else {
                setSubscription(null);
            }
        } catch (e) {
            console.error('Failed to check subscription status', e);
            setError(e as Error);
            setSubscription(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        checkSubscriptionStatus();
    }, [checkSubscriptionStatus]);

    const redirectToCheckout = async (priceId: string) => {
        if (!user) {
            setError(new Error("User must be logged in to subscribe."));
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await functions.createExecution(
                APPWRITE_FUNC_CREATE_STRIPE_CHECKOUT_SESSION,
                JSON.stringify({ priceId }),
                false
            );
            
            const { sessionId } = JSON.parse(result.responseBody);

            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("Stripe.js has not loaded yet.");
            }

            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

            if (stripeError) {
                throw new Error(stripeError.message);
            }
        } catch (e) {
            console.error("Failed to redirect to checkout:", e);
            setError(e as Error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const redirectToCustomerPortal = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await functions.createExecution(
                APPWRITE_FUNC_MANAGE_SUBSCRIPTION,
                '{}',
                false
            );

            const { url } = JSON.parse(result.responseBody);
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Could not retrieve customer portal URL.");
            }

        } catch(e) {
            console.error("Failed to redirect to customer portal:", e);
            setError(e as Error);
        } finally {
            setIsLoading(false);
        }
    }


    return {
        subscription,
        hasActiveSubscription: !!subscription,
        isLoading,
        error,
        checkSubscriptionStatus,
        redirectToCheckout,
        redirectToCustomerPortal
    };
}; 