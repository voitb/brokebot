import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscription } from '@/hooks/business/useSubscription';
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, LogIn } from 'lucide-react';
import { PricingInteraction, type Plan } from "./PricingInteraction";

const SUBSCRIPTION_PLANS: Plan[] = [
    {
        name: 'Plus',
        monthlyPrice: 9,
        yearlyPrice: 7,
        monthlyPriceId: 'price_1RZx0MP4jwSv1dGyjJxAy9A2', 
        yearlyPriceId: 'price_1RZz8rP4jwSv1dGyfDlqHshL',  
        isPopular: true,
    },
    {
        name: 'Pro',
        monthlyPrice: 19,
        yearlyPrice: 15,
        monthlyPriceId: 'price_pro_monthly_placeholder',
        yearlyPriceId: 'price_pro_yearly_placeholder',
    }
];

const LoggedInView: React.FC = () => {
    const { 
        subscription, 
        hasActiveSubscription, 
        isLoading: isSubLoading, 
        error, 
        redirectToCheckout, 
        redirectToCustomerPortal 
    } = useSubscription();
    
    if (isSubLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
                <p><strong>Error:</strong> {error.message}</p>
            </div>
        );
    }

    if (hasActiveSubscription && subscription) {
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
                        <Button onClick={redirectToCustomerPortal} disabled={isSubLoading} className="w-full sm:w-auto">
                            {isSubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                            Open Customer Portal
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <Label className="text-base font-medium">Current Plan</Label>
                <p className="text-sm text-muted-foreground">You're on the Local Free plan. Upgrade for cloud features.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Local Free Plan<Badge>Current</Badge></CardTitle>
                    <CardDescription>100% local AI with complete privacy using local models or your own API keys.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li>✓ Unlimited local AI conversations</li>
                        <li>✓ Local LLM models (no API key required)</li>
                        <li>✓ OpenRouter API free models (API key required)
                            <p className="pl-4 text-xs text-muted-foreground/80">Note: Free models may require enabling data sharing for model training, which is not privacy-friendly.</p>
                        </li>
                        <li>✓ Complete privacy with local models and your own keys</li>
                        <li>✓ Cross-device sync (manual JSON export)</li>
                        <li>✓ Works offline & Offline chat sharing (html export)</li>
                        <li>✓ Speech-to-text functionality</li>
                        <li>✓ Read from .txt files</li>
                        <li>✓ Bring your own API keys (Coming Soon)</li>
                    </ul>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* <div> 
                    <PricingInteraction plans={SUBSCRIPTION_PLANS} isLoading={isSubLoading} onSubscribeClick={redirectToCheckout} />
                </div> */}
                <div className="space-y-4 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex justify-between items-center">
                                <span>Plus Benefits <span className="text-xs text-muted-foreground">(10$ monthly / 84$ yearly)</span></span>
                                <Badge variant="outline">Coming Soon</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Everything in Local Free</li> 
                                <li>✓ Automatic cloud backup (optional)</li>
                                <li>✓ Online shared chat links</li>
                                <li>✓ Read from PDF and RTF files</li>
                                <li>✓ Export chats to PDF</li>
                                <li>✓ Advanced local reasoning models</li>
                                <li>✓ Priority support</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex justify-between items-center">
                                <span>Pro Benefits <span className="text-xs text-muted-foreground">(20$ monthly / 168$ yearly)</span></span>
                                <Badge variant="outline">Coming Soon</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Everything in Plus</li>
                                <li>✓ Full voice-to-voice conversations</li>
                                <li>✓ Image analysis & reasoning</li>
                                <li>✓ Generate images & video</li>
                                {/* <li>✓ Real-time web search (Experimental)</li>
                                <li>✓ Mint conversations as NFTs (Experimental)</li>
                                <li>✓ MCP integration (Experimental)</li> */}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card className="bg-muted/20">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">💡 <strong>Why upgrade?</strong> Keep your local privacy while gaining cloud features and API access to the latest models.</p>
                </CardContent>
            </Card>
        </div>
    );
};

const LoggedOutView: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <Label className="text-base font-medium">Current Plan</Label>
                <p className="text-sm text-muted-foreground">You're using brokebot in offline mode. Log in to upgrade and sync.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Local Free Plan<Badge>Current</Badge></CardTitle>
                    <CardDescription>100% local AI with complete privacy using local models or your own API keys.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li>✓ Unlimited local AI conversations</li>
                        <li>✓ Local LLM models (no API key required)</li>
                        <li>✓ OpenRouter API free models (API key required)
                            <p className="pl-4 text-xs text-muted-foreground/80">Note: Free models may require enabling data sharing for model training, which is not privacy-friendly.</p>
                        </li>
                        <li>✓ Complete privacy with local models and your own keys</li>
                        <li>✓ Cross-device sync (manual JSON export)</li>
                        <li>✓ Works offline & Offline chat sharing (html export)</li>
                        <li>✓ Speech-to-text functionality</li>
                        <li>✓ Read from .txt files</li>
                        <li>✓ Bring your own API keys (Coming Soon)</li>
                    </ul>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Ready to Upgrade?</CardTitle>
                            <CardDescription>Log in or create an account to unlock cloud features and choose a plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <Button className="w-full" onClick={() => navigate('/login')}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Log In to Upgrade
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex justify-between items-center">
                                <span>Plus Benefits <span className="text-xs text-muted-foreground">(10$ monthly / 84$ yearly)</span></span>
                                <Badge variant="outline">Coming Soon</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Everything in Local Free</li> 
                                <li>✓ Automatic cloud backup (optional)</li>
                                <li>✓ Online shared chat links</li>
                                <li>✓ Read from PDF and RTF files</li>
                                <li>✓ Export chats to PDF</li>
                                <li>✓ Advanced local reasoning models</li>
                                <li>✓ Priority support</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex justify-between items-center">
                                <span>Pro Benefits <span className="text-xs text-muted-foreground">(20$ monthly / 168$ yearly)</span></span>
                                <Badge variant="outline">Coming Soon</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Everything in Plus</li>
                                <li>✓ Full voice-to-voice conversations</li>
                                <li>✓ Image analysis & reasoning</li>
                                <li>✓ Generate images & video</li>
                                {/* <li>✓ Real-time web search (Experimental)</li>
                                <li>✓ Mint conversations as NFTs (Experimental)</li>
                                <li>✓ MCP integration (Experimental)</li> */}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card className="bg-muted/20">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">💡 <strong>Why upgrade?</strong> Keep your local privacy while gaining cloud features and API access to the latest models.</p>
                </CardContent>
            </Card>
        </div>
    );
};


export function BillingTab() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  return user ? <LoggedInView /> : <LoggedOutView />;
} 