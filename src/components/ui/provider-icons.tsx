import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  ref?: React.Ref<SVGSVGElement>;
};

export function OpenRouterIcon({ ref, className, ...props }: IconProps) {
  return (
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
      className={className || "w-4 h-4"}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
