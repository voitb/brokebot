import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { MessageSquare, Zap, Shield, Cpu, type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Chat with AI",
    description: "Start conversations with your local AI assistant",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant responses powered by WebLLM technology",
  },
  {
    icon: Shield,
    title: "Free & 100% Private",
    description: "Completely free with local models. All data stays on your device.",
  },
  {
    icon: Cpu,
    title: "Runs Locally",
    description: "AI model runs entirely in your browser",
  },
];

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <Card className="border-muted">
    <CardHeader className="pb-3">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
        <feature.icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle className="text-lg">{feature.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm">
        {feature.description}
      </CardDescription>
    </CardContent>
  </Card>
);

export const FeatureGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
    {features.map((feature, index) => (
      <FeatureCard key={index} feature={feature} />
    ))}
  </div>
); 