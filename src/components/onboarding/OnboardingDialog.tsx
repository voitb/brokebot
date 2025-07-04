"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui";

const OnboardingContent = () => (
    <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_p]:text-muted-foreground">
        <div className="rounded-md border border-yellow-500/50 bg-yellow-950/20 p-4 space-y-1">
            <p>
                <strong className="text-yellow-400/90">A Note on "Broke"</strong>
            </p>
            <p>
                The name isn't just about providing free models. It's a nod to the
                fact that this started as a "cloneathon" project, sometimes coded purely
                on vibes. As a result, it can be a little... well, "broke".
            </p>
            <p className="pt-2">
                This journey taught me that "vibe-driven development" isn't the best
                path (and I definitely don't recommend it!). From this point forward,
                things will be fixed more properly. Known issues are tracked on
                GitHub, and your feedback is highly appreciated!
            </p>
        </div>

        <div className="space-y-1">
            <p>
                <strong>Welcome to brokebot!</strong>
            </p>
            <p>
                Our main goal is to provide free access to powerful AI models, while giving you full control over your privacy. This overview explains how it works.
            </p>
        </div>

        <div className="space-y-1">
            <p>
                <strong>Free Models First, Privacy by Design</strong>
            </p>
            <p>
                By default, you can use powerful online AI models for free. For absolute privacy, you can switch to a local model (WebLLM) at any time, which runs entirely on your device.
            </p>
            <ul className="list-disc space-y-1 pl-6">
                <li>Conversations and files with local models are stored only in your browser.</li>
                <li>Settings and API keys are always encrypted and stored locally.</li>
            </ul>
        </div>

        <div className="space-y-1">
            <p>
                <strong>Understanding AI Model Choices</strong>
            </p>
            <p>
                The privacy implications differ significantly between model types. It's crucial to understand them.
            </p>
        </div>

        <div className="rounded-md border bg-secondary/30 p-4 space-y-1">
            <p>
                <strong>Local Models & Your Own API Keys</strong>
            </p>
            <p>
                When using local models (WebLLM) or your own API key, your data is sent directly to the respective service. We do not log or store it. Your privacy is protected.
            </p>
        </div>

        <div className="rounded-md border border-yellow-500/50 bg-yellow-950/20 p-4 space-y-1">
            <p>
                <strong className="text-yellow-400/90">Free Models (via OpenRouter)</strong>
            </p>
            <p>
                To provide free access, some models are routed through a secure proxy function before reaching OpenRouter. While our proxy does not log your conversation content, be aware that third-party providers may use your prompts to improve their services. This is the trade-off for free usage.
            </p>
            <p className="font-semibold">
                By using a free model, you acknowledge and accept this condition.
            </p>
        </div>

        <div className="space-y-1">
            <p>
                <strong>Your Support Matters</strong>
            </p>
            <p>
                Creating an account is a great way to show your support! It signals that you find brokebot useful and motivates further development—including free conversation sync (coming soon)!
            </p>
        </div>

        <div className="space-y-1">
            <p>
                <strong>You're in Control</strong>
            </p>
            <p>
                You have full control over your data and can choose your preferred models at any time. By clicking "I Understand & Continue", you confirm you have read and understood these points.
            </p>
        </div>
    </div>
);


interface OnboardingDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const [hasReadToBottom, setHasReadToBottom] = useState(false); 

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // 20px tolerance - considered "at the bottom"
        const isAtBottom = distanceFromBottom <= 20;

        if (isAtBottom && !hasReadToBottom) {
            setHasReadToBottom(true);
        }
    };
    return (
        <Dialog modal={true} open={isOpen}>
            <DialogContent showCloseButton={false} className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b border-border px-6 py-4 text-base">
                        Welcome to brokebot!
                    </DialogTitle>
                    <ScrollArea type="auto" onScrollCapture={handleScroll} className="h-[calc(90vh-203px)]">
                        <DialogDescription asChild>
                            <div className="px-6 py-4">
                                <p className="mb-4 text-muted-foreground">
                                    A few key things to know before you get started.
                                </p>
                                <OnboardingContent />
                            </div>
                        </DialogDescription>
                    </ScrollArea>
                </DialogHeader>

                <DialogFooter className="shrink-0 border-t border-border px-6 py-4 sm:items-center">
                    {!hasReadToBottom ? (
                        <span className="grow text-xs text-muted-foreground max-sm:text-center">
                            Please scroll to the bottom to continue.
                        </span>
                    ) : (
                        <div className="grow" />
                    )}
                    <Button
                        type="button"
                        disabled={!hasReadToBottom}
                        onClick={onClose}
                    >
                        I Understand & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 