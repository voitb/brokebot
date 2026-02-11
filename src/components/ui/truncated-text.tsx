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

const LINE_CLAMP_CLASS: Record<number, string> = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
    5: "line-clamp-5",
    6: "line-clamp-6",
};

export function TruncatedText({
    children,
    maxLines = 1,
    tooltipContent,
    classNames,
    as: Component = "span",
}: TruncatedTextProps) {
    const textRef = useRef<HTMLElement>(null);
    const isCheckingRef = useRef(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const check = () => {
            if (isCheckingRef.current) return;
            isCheckingRef.current = true;

            if (maxLines === 1) {
                setIsTruncated(el.scrollWidth > el.clientWidth);
            } else {
                // line-clamp equalizes scrollHeight/clientHeight in some browsers
                // Temporarily remove clamp to measure true content height
                const clampedHeight = el.clientHeight;
                el.style.webkitLineClamp = "unset";
                const fullHeight = el.scrollHeight;
                el.style.webkitLineClamp = "";
                setIsTruncated(fullHeight > clampedHeight);
            }

            isCheckingRef.current = false;
        };

        check();

        const observer = new ResizeObserver(check);
        observer.observe(el);
        return () => observer.disconnect();
    }, [maxLines, children]);

    const textElement = (
        <Component
            ref={textRef as React.RefObject<HTMLSpanElement & HTMLParagraphElement & HTMLDivElement>}
            className={cn(
                maxLines === 1 ? "truncate block" : LINE_CLAMP_CLASS[maxLines],
                classNames?.base,
            )}
        >
            {children}
        </Component>
    );

    return (
        <Tooltip open={isTruncated && isHovering} onOpenChange={setIsHovering}>
            <TooltipTrigger asChild>
                {textElement}
            </TooltipTrigger>
            <TooltipContent className={cn("max-w-xs", classNames?.tooltip)}>
                <p>{tooltipContent ?? children}</p>
            </TooltipContent>
        </Tooltip>
    );
}
