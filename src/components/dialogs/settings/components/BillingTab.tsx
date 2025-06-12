import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";

export function BillingTab() {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Current Plan</Label>
        <p className="text-sm text-muted-foreground">
          You're currently on the free plan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Free Plan
            <Badge>Current</Badge>
          </CardTitle>
          <CardDescription>
            Perfect for getting started with local AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Unlimited local AI conversations</li>
            <li>✓ 5+ local AI models</li>
            <li>✓ Browser-based storage</li>
            <li>✓ No data sent to servers</li>
            <li>✓ Export conversations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Plus Plan
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>Enhanced features for power users</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Everything in Free</li>
            <li>✓ Manual sync between devices</li>
            <li>✓ Advanced model settings</li>
            <li>✓ Priority model downloads</li>
            <li>✓ Custom AI personas</li>
          </ul>
          <Button className="w-full mt-4" disabled>
            Coming Soon
          </Button>
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pro Plan
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>Enhanced features for power users</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Everything in Plus</li>
            <li>✓ Automatic cloud backup & sync</li>
            <li>✓ Team collaboration</li>
          </ul>
          <Button className="w-full mt-4" disabled>
            Coming Soon
          </Button>
        </CardContent>
      </Card>

      <div>
        <Label className="text-base font-medium">API Usage</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Track your external API usage and costs
        </p>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Connect API keys in Integrations to see usage statistics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
