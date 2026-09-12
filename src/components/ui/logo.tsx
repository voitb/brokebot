import { useRootTheme } from '@/hooks/use-root-theme';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
}

export function Logo({ className = '', size = 'md', theme }: LogoProps) {
  const rootTheme = useRootTheme();

  const resolvedTheme = theme ?? rootTheme;

  const logoSrc =
    resolvedTheme === 'dark'
      ? '/brokebot_light_square.png'
      : '/brokebot_dark_square.png';

  const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <img
      src={logoSrc}
      alt="brokebot Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}
