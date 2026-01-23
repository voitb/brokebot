import { useRef, useState, useLayoutEffect, type ReactNode } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

interface TruncatedTextProps {
    children: ReactNode;
    maxLines?: number;
    tooltipContent?: ReactNode;
    classNames?: {
        base?: string;
        tooltip?: string;
    };
    as?: "span" | "p" | "div";
}

export function TruncatedText({
    children,
    maxLines = 1,
    tooltipContent,
    classNames,
    as: Component = "span",
}: TruncatedTextProps) {
    const textRef = useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => {
            const isOverflowing = maxLines === 1
                ? el.scrollWidth > el.clientWidth
                : el.scrollHeight > el.clientHeight;
            setIsTruncated(isOverflowing);
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(el);

        return () => observer.disconnect();
    }, [maxLines, children]);

    const textElement = (
        <Component
            ref={textRef as React.RefObject<HTMLSpanElement & HTMLParagraphElement & HTMLDivElement>}
            className={cn(maxLines === 1 ? "truncate" : `line-clamp-${maxLines}`, "block", classNames?.base)}
        >
            {children}
        </Component>
    );

    if (!isTruncated) {
        return textElement;
    }

    return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {textElement}
                </TooltipTrigger>
                <TooltipContent className={cn("max-w-xs", classNames?.tooltip)}>
                    <p>{tooltipContent ?? children}</p>
                </TooltipContent>
            </Tooltip>
    );
}
