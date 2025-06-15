import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Shield, Database, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TermsOfService() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
                          <CardTitle>Welcome to BrokeBot</CardTitle>
            <CardDescription>
              A privacy-first, local AI assistant that runs entirely in your
              browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
                              BrokeBot is a web application that provides AI-powered
              conversations using WebLLM technology. By using this service, you
              agree to the following terms and conditions.
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              How BrokeBot Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Local AI Processing</h4>
              <p className="text-sm text-muted-foreground">
                BrokeBot runs AI models directly in your browser using WebLLM
                technology. All AI processing happens locally on your device -
                no data is sent to external servers for AI inference.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Model Downloads</h4>
              <p className="text-sm text-muted-foreground">
                AI models are downloaded once from public CDNs and cached in
                your browser. These downloads are necessary for the application
                to function and may use several gigabytes of storage and
                bandwidth.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Browser Requirements</h4>
              <p className="text-sm text-muted-foreground">
                BrokeBot requires a modern browser with WebAssembly and WebGPU
                support. Performance depends on your device's capabilities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Local Data Storage</h4>
              <p className="text-sm text-muted-foreground">
                Your conversations, settings, and files are stored locally in
                your browser's IndexedDB database. This data never leaves your
                device unless you explicitly export it.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">No Server Communication</h4>
              <p className="text-sm text-muted-foreground">
                When using local AI models, no conversation data is transmitted
                to external servers. Your conversations remain completely
                private.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Cloud Features</h4>
              <p className="text-sm text-muted-foreground">
                If you connect external API keys (OpenAI, Anthropic, Google),
                those conversations will be subject to the respective provider's
                privacy policies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Storage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Storage & Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">What We Store Locally</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conversation history and messages</li>
                <li>• User preferences and settings</li>
                <li>• Uploaded documents and files</li>
                <li>• AI model cache and configuration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Persistence</h4>
              <p className="text-sm text-muted-foreground">
                Data persists until you manually delete it through the
                application or clear your browser data. We recommend regular
                exports for backup purposes.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Portability</h4>
              <p className="text-sm text-muted-foreground">
                You can export your conversations and settings at any time in
                standard JSON format for backup or migration purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usage Terms & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Acceptable Use</h4>
              <p className="text-sm text-muted-foreground">
                You agree to use BrokeBot responsibly and in compliance with
                applicable laws. Do not use the service for illegal activities,
                harassment, or generating harmful content.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Model Limitations</h4>
              <p className="text-sm text-muted-foreground">
                AI models may produce inaccurate, biased, or inappropriate
                content. Always verify important information and use your
                judgment when relying on AI responses.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">System Requirements</h4>
              <p className="text-sm text-muted-foreground">
                BrokeBot requires significant computational resources.
                Performance may vary based on your device capabilities and may
                not work on older or low-power devices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disclaimers & Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Service Availability</h4>
              <p className="text-sm text-muted-foreground">
                BrokeBot is provided "as is" without warranties. We do not
                guarantee uninterrupted service or that the application will
                meet your specific needs.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Loss</h4>
              <p className="text-sm text-muted-foreground">
                While we strive for reliability, we are not responsible for data
                loss due to browser issues, device failures, or other technical
                problems. Regular exports are recommended.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Third-Party Models</h4>
              <p className="text-sm text-muted-foreground">
                AI models are provided by third parties (Meta, Microsoft,
                Google, etc.) and are subject to their respective licenses and
                terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These terms may be updated periodically. Continued use of
              BrokeBot constitutes acceptance of any changes.
            </p>
            <p className="text-sm text-muted-foreground">
              For questions or concerns about these terms, please contact us
              through our support channels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
