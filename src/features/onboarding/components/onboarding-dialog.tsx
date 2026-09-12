import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                Our main goal is to keep your conversations private by running a local AI model on your device by default, while offering you the choice to use powerful online models. This overview explains how it works.
            </p>
        </div>

        <div className="space-y-1">
            <p>
                <strong>Local by Default, Privacy by Design</strong>
            </p>
            <p>
                By default, a local model (WebLLM) loads automatically and runs entirely on your device. If you want more powerful models, you can opt in to free models hosted on OpenRouter at any time.
            </p>
            <ul className="list-disc space-y-1 pl-6">
                <li>Conversations and files with local models are stored only in your browser.</li>
                <li>Your API key is encrypted; all settings are stored locally in your browser.</li>
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
                Local models (WebLLM) run entirely in your browser: neither your conversations nor the model weights leave your device. When you use your own API key, requests go to that provider under your own account.
            </p>
        </div>

        <div className="rounded-md border border-yellow-500/50 bg-yellow-950/20 p-4 space-y-1">
            <p>
                <strong className="text-yellow-400/90">Free Models (via OpenRouter)</strong>
            </p>
            <p>
                Free and paid models alike are reached directly from your browser with your own OpenRouter key. Be aware that the providers behind free models may use your prompts to improve their services. This is the trade-off for free usage.
            </p>
            <p className="font-semibold">
                By using a free model, you acknowledge and accept this condition.
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

export function OnboardingDialog({
    isOpen,
    onClose,
}: OnboardingDialogProps) {
    const [hasReadToBottom, setHasReadToBottom] = useState(false); 
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!isOpen) return;

        const viewport = scrollAreaRef.current?.querySelector<HTMLDivElement>(
            '[data-slot="scroll-area-viewport"]'
        );
        if (!viewport) return;

        const checkIfFullyVisible = () => {
            if (viewport.scrollHeight - viewport.clientHeight <= 20) {
                setHasReadToBottom(true);
            }
        };

        checkIfFullyVisible();
        window.addEventListener("resize", checkIfFullyVisible);
        return () => window.removeEventListener("resize", checkIfFullyVisible);
    }, [isOpen]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isAtBottom = distanceFromBottom <= 20;

        if (isAtBottom && !hasReadToBottom) {
            setHasReadToBottom(true);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && hasReadToBottom) {
            onClose();
        }
    };

    return (
        <Dialog modal={true} open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent showCloseButton={false} className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-lg [&>button:last-child]:top-3.5">
                <DialogHeader className="contents space-y-0 text-left">
                    <DialogTitle className="border-b border-border px-6 py-4 text-base">
                        Welcome to brokebot!
                    </DialogTitle>
                    <ScrollArea ref={scrollAreaRef} type="auto" onScrollCapture={handleScroll} className="h-[calc(90vh-203px)]">
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
} 