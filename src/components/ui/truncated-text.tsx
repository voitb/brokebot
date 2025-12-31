import { useRef, useState, useLayoutEffect, type ReactNode } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

interface TruncatedTextProps {
    children: ReactNode;
    lines?: number;
    className?: string;
    tooltipContent?: ReactNode;
    tooltipMaxWidth?: string;
    as?: "span" | "p" | "div";
}

export function TruncatedText({
    children,
    lines = 1,
    className,
    tooltipContent,
    tooltipMaxWidth = "max-w-xs",
    as: Component = "span",
}: TruncatedTextProps) {
    const textRef = useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => {
            const isOverflowing = lines === 1
                ? el.scrollWidth > el.clientWidth
                : el.scrollHeight > el.clientHeight;
            setIsTruncated(isOverflowing);
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(el);

        return () => observer.disconnect();
    }, [lines, children]);

    const textElement = (
        <Component
            ref={textRef as React.RefObject<HTMLSpanElement & HTMLParagraphElement & HTMLDivElement>}
            className={cn(lines === 1 ? "truncate" : `line-clamp-${lines}`, "block", className)}
        >
            {children}
        </Component>
    );

    if (!isTruncated) {
        return textElement;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {textElement}
                </TooltipTrigger>
                <TooltipContent className={tooltipMaxWidth}>
                    <p>{tooltipContent ?? children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
