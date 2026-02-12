import { Helmet } from 'react-helmet-async';

const TITLE = 'brokebot - Your Private AI Assistant';
const DESCRIPTION = 'Run a powerful AI assistant 100% locally in your browser. No data leaves your device. Free, private, and works offline.';
const URL = 'https://brokebot.voitz.dev/';
const IMAGE = `${URL}brokebot_dark.png`;
const SITE_NAME = 'brokebot';
const KEYWORDS = 'AI Assistant, ChatGPT Clone, WebLLM, Local AI, Offline AI, Private AI, IndexedDB, React, Vite, brokebot';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": SITE_NAME,
  "applicationCategory": "Productivity",
  "operatingSystem": "Web Browser",
  "description": DESCRIPTION,
  "url": URL,
  "image": IMAGE,
  "author": {
    "@type": "Organization",
    "name": "voitz"
  },
  "publisher": {
    "@type": "Organization",
    "name": "voitz",
    "logo": {
      "@type": "ImageObject",
      "url": `${URL}brokebot_light_square.png`
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": URL
  },
  "potentialAction": {
    "@type": "UseAction",
    "target": URL
  }
};

export function Seo() {
  return (
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta name="keywords" content={KEYWORDS} />
      <meta name="author" content="voitz" />
      <link rel="canonical" href={URL} />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="theme-color" content="#000000" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:image" content={IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={TITLE} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={URL} />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={IMAGE} />
      <meta name="twitter:image:alt" content={TITLE} />
      <meta name="twitter:creator" content="@voitz__" />
      <meta name="twitter:site" content="@voitz__" />

      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content={SITE_NAME} />

      <link rel="apple-touch-icon" sizes="180x180" href="/brokebot_light_square.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/brokebot_light_square.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/brokebot_light_square.png" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://brokebot.voitz.dev" />
      <link rel="preload" href="/brokebot_light_square.png" as="image" />
      <link rel="preload" href="/brokebot_dark.png" as="image" />

      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
}
