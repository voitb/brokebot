import React from "react";

const createIcon = (svg: React.ReactNode) =>
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    (props, ref) => (
      <svg
        {...props}
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={props.className || "w-4 h-4"}
      >
        {svg}
      </svg>
    )
  );

export const OpenAIIcon = createIcon(
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
);

export const AnthropicIcon = createIcon(
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
);

export const GeminiIcon = createIcon(
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
);

export const OpenRouterIcon = createIcon(
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
);
