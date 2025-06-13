import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { PricingInteraction } from "./PricingInteraction";

export function LocalUserBillingTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Label className="text-base font-medium">Current Plan</Label>
        <p className="text-sm text-muted-foreground">
          You're using Local-GPT in offline mode
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Local Free Plan
            <Badge>Current</Badge>
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
              ✓ Bring your own API keys (ChatGPT, Claude, Gemini, etc.)
            </li>
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
            <li>✓ No usage limits</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium mb-4 block">
            Upgrade Options
          </Label>
          <PricingInteraction
            starterMonth={9}
            starterAnnual={7}
            proMonth={19}
            proAnnual={15}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Starter Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Local Free</li>
                <li>✓ Cross-device sync (manual)</li>
                <li>✓ Advanced export options</li>
                <li>✓ Online shared chat</li>
                <li>✓ Speech-to-text functionality</li>
                <li>✓ File uploads (Coming Soon)</li>
                <li>✓ Priority support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pro Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Starter</li>
                <li>✓ Automatic cloud backup</li>   
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