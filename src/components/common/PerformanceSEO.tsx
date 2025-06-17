import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface PerformanceSEOProps {
  pageLoadTime?: number;
  enableWebVitals?: boolean;
}

export const PerformanceSEO: React.FC<PerformanceSEOProps> = ({ 
  pageLoadTime,
  enableWebVitals = true 
}) => {
  useEffect(() => {
    if (!enableWebVitals) return;

    // Web Vitals monitoring for SEO
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Log important metrics for SEO
          console.log('SEO Performance Metrics:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
            firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, [enableWebVitals]);

  // Structured data for performance metrics
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
      {/* Performance hints for SEO */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://brokebot.voitz.dev" />
      
      {/* Resource hints */}
      <link rel="preload" href="/brokebot_light_square.png" as="image" />
      <link rel="preload" href="/brokebot_dark.png" as="image" />
      
      {pageLoadTime && (
        <script type="application/ld+json">
          {JSON.stringify(performanceData, null, 2)}
        </script>
      )}
    </Helmet>
  );
}; 