import { Helmet } from 'react-helmet-async';

export function PerformanceSEO() {
  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://brokebot.voitz.dev" />

      <link rel="preload" href="/brokebot_light_square.png" as="image" />
      <link rel="preload" href="/brokebot_dark.png" as="image" />
    </Helmet>
  );
} 