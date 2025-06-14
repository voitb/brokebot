import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscription } from '@/hooks/business/useSubscription';
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { PricingInteraction, type Plan } from "./PricingInteraction";

// Definicja planów z ID ze Stripe
const SUBSCRIPTION_PLANS: Plan[] = [
    {
        name: 'Plus',
        monthlyPrice: 9,
        yearlyPrice: 7,
        monthlyPriceId: 'price_1PgzgXJyM1jT1nL9iSgXfY54', // Pamiętaj, aby zastąpić
        yearlyPriceId: 'price_1PgzgXJyM1jT1nL95pYk0yT9',   // Pamiętaj, aby zastąpić
        isPopular: true,
    },
    {
        name: 'Pro',
        monthlyPrice: 19,
        yearlyPrice: 15,
        monthlyPriceId: 'price_pro_monthly_placeholder',   // Pamiętaj, aby zastąpić
        yearlyPriceId: 'price_pro_yearly_placeholder',     // Pamiętaj, aby zastąpić
    }
];

// Główny, zunifikowany komponent BillingTab
export function LoggedUserBillingTab() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { 
      subscription, 
      hasActiveSubscription, 
      isLoading: isSubLoading, 
      error, 
      redirectToCheckout, 
      redirectToCustomerPortal 
  } = useSubscription();
  
  const isLoading = isAuthLoading || isSubLoading;

  const handleSubscribeClick = (priceId: string) => {
    if (user) {
        redirectToCheckout(priceId);
    } else {
        navigate('/login');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
            <p><strong>Error:</strong> {error.message}</p>
        </div>
    );
  }

  // WIDOK DLA UŻYTKOWNIKA Z AKTYWNĄ SUBSKRYPCJĄ
  if (user && hasActiveSubscription && subscription) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Your Subscription</CardTitle>
                    <div className="flex items-center justify-between pt-2">
                        <Badge className="bg-green-100 text-green-800 capitalize">{subscription.status}</Badge>
                        <p className="text-sm text-muted-foreground">Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/50 rounded-md">
                        <h3 className="font-semibold text-lg">Current Plan: <span className="text-primary capitalize">{subscription.planId.includes('pro') ? 'Pro' : 'Plus'}</span></h3>
                        <p className="text-sm text-muted-foreground">You have full access to all features included in your plan.</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Manage Your Subscription</h4>
                        <p className="text-sm text-muted-foreground mb-4">Click the button below to be securely redirected to the Stripe Customer Portal, where you can:</p>
                        <ul className="space-y-2 text-sm list-disc pl-5 text-muted-foreground">
                            <li>Download past invoices & update payment method</li>
                            <li>Change or cancel your subscription plan</li>
                        </ul>
                    </div>
                    <Button onClick={redirectToCustomerPortal} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                        Open Customer Portal
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  // WIDOK DLA UŻYTKOWNIKÓW BEZ SUBSKRYPCJI (ZALOGOWANYCH LUB NIE) - TWÓJ ORYGINALNY LAYOUT Z PRZYWRÓCONYMI OPISAMI
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Label className="text-base font-medium">Current Plan</Label>
        <p className="text-sm text-muted-foreground">
          {user 
            ? "You're on the Local Free plan. Upgrade for cloud features." 
            : "You're using Local-GPT in offline mode. Log in to upgrade and sync."
          }
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Local Free Plan<Badge>Current</Badge>
          </CardTitle>
          <CardDescription>
            100% local AI with complete privacy using local models or your own
            API keys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Unlimited local AI conversations</li>
            <li>✓ Local LLM models (no API key required)</li> 
            <li>
              ✓ OpenRouter API free models (API key required)
              <p className="pl-4 text-xs text-muted-foreground/80">
                Note: Free models may require enabling data sharing for model
                training, which is not privacy-friendly.
              </p>
            </li>
            <li>✓ Complete privacy with local models and your own keys</li>
            <li>✓ Works offline</li>
            <li>✓ Offline chat sharing</li>
            <li>✓ Cross-device sync (manual JSON export)</li>
            <li>✓ No usage limits</li><li>
              ✓ Bring your own API keys (ChatGPT, Claude, Gemini, etc.) (coming soon)
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div> 
          <PricingInteraction
            plans={SUBSCRIPTION_PLANS}
            isLoading={isLoading}
            onSubscribeClick={handleSubscribeClick}
          />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Plus Benefits</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Local Free</li> 
                <li>✓ Automatic cloud backup</li>
                <li>✓ Online shared chat</li>
                <li>✓ Speech-to-text functionality</li>
                <li>✓ File uploads (Coming Soon)</li>
                <li>✓ Priority support</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Pro Benefits</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Plus</li>
                <li>✓ Mint conversations as NFTs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Why upgrade?</strong> Keep your local privacy while
            gaining cloud features and API access to the latest models.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
