import React from 'react';
import { useTheme } from '../../providers/ThemeProvider';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'square' | 'wide';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  variant = 'square',
}) => {
  const { theme } = useTheme();

  // sprawdzamy preferencję systemu tylko raz – bez nasłuchiwania zmian
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  /**  
   * showLightLogo = true  →  wybieramy jasne assety  
   * showLightLogo = false →  wybieramy ciemne assety  
   * (czyli odwrotność klasycznego podejścia)  
   */
  const showLightLogo =
    theme === 'dark' ||
    (theme === 'system' && systemPrefersDark);

  const logoSrc =
    variant === 'square'
      ? showLightLogo
        ? '/brokebot_light_square.png'
        : '/brokebot_dark_square.png'
      : showLightLogo
        ? '/brokebot_light.png'
        : '/brokebot_dark.png';

  // Tailwind-owe klasy rozmiarów
  const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  if (showText) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src={logoSrc}
          alt="BrokeBot Logo"
          className={`${sizeClasses[size]} object-contain`}
        />
        <span className={`font-semibold ${textSizeClasses[size]}`}>BrokeBot</span>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="BrokeBot Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};
