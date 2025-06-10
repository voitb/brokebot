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
// import { Progress } from "../../../ui/progress";

export function LoggedUserBillingTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Label className="text-base font-medium">Current Subscription</Label>
        <p className="text-sm text-muted-foreground">
          Manage your Local-GPT Pro subscription
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pro Plan
            <Badge>Active</Badge>
          </CardTitle>
          <CardDescription>
            Next billing: December 15, 2024 • $19.00/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Plan status</span>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Active
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Auto-renewal</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              Change Plan
            </Button>
            <Button variant="outline" size="sm" className="ml-2">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage This Month</CardTitle>
            <CardDescription>API calls and cloud features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>API Calls</span>
                <span>2,847 / 10,000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "28%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Cloud Storage</span>
                <span>1.2 GB / 5 GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "24%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Team Members</span>
                <span>3 / 5</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Billing History</CardTitle>
            <CardDescription>Recent charges and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Nov 2024</span>
                <span className="font-medium">$19.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Oct 2024</span>
                <span className="font-medium">$19.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sep 2024</span>
                <span className="font-medium">$19.00</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View All Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-400 rounded"></div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/27</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Cancel subscription</Label>
              <p className="text-xs text-muted-foreground mb-2">
                You'll keep access until your next billing date
              </p>
              <Button variant="destructive" size="sm">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
