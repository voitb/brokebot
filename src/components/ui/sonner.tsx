import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useRootTheme } from "@/hooks/use-root-theme";

const Toaster = ({ theme, ...props }: ToasterProps) => {
  const rootTheme = useRootTheme();

  return (
    <Sonner
      theme={theme ?? rootTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--text-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
