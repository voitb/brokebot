import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface PerformanceSEOProps {
  pageLoadTime?: number;
  enableWebVitals?: boolean;
}

export function PerformanceSEO({
  pageLoadTime,
  enableWebVitals = true
}: PerformanceSEOProps) {
  useEffect(() => {
    if (!enableWebVitals) return;

    const observer = new PerformanceObserver(() => {});

    observer.observe({ entryTypes: ["navigation"] });

    return () => observer.disconnect();
  }, [enableWebVitals]);

  const performanceData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "mainEntity": {
      "@type": "WebApplication",
      "name": "brokebot",
      "applicationCategory": "Productivity",
      ...(pageLoadTime && {
        "loadTime": `PT${pageLoadTime}S`
      })
    }
  };

  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://brokebot.voitz.dev" />

      <link rel="preload" href="/brokebot_light_square.png" as="image" />
      <link rel="preload" href="/brokebot_dark.png" as="image" />
      
      {pageLoadTime && (
        <script type="application/ld+json">
          {JSON.stringify(performanceData, null, 2)}
        </script>
      )}
    </Helmet>
  );
} 