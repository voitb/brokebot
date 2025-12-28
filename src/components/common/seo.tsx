import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
  canonical?: string;
}

const DEFAULT_TITLE = 'brokebot - Your Private AI Assistant';
const DEFAULT_DESCRIPTION = 'Run a powerful AI assistant 100% locally in your browser. No data leaves your device. Free, private, and works offline.';
const DEFAULT_URL = 'https://brokebot.voitz.dev/'; // Replace with your actual domain
const DEFAULT_IMAGE = `${DEFAULT_URL}brokebot_dark.png`;
const SITE_NAME = 'brokebot';
const DEFAULT_KEYWORDS = ['AI Assistant', 'ChatGPT Clone', 'WebLLM', 'Local AI', 'Offline AI', 'Private AI', 'IndexedDB', 'React', 'Vite', 'brokebot'];

export function Seo({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords = [],
  noIndex = false,
  canonical
}: SeoProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageUrl = url ? `${DEFAULT_URL}${url.startsWith('/') ? url.slice(1) : url}` : DEFAULT_URL;
  const pageImage = image || DEFAULT_IMAGE;
  const pageKeywords = [...DEFAULT_KEYWORDS, ...keywords].join(', ');
  const canonicalUrl = canonical || pageUrl;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebApplication',
    "name": title || SITE_NAME,
    "applicationCategory": "Productivity",
    "operatingSystem": "Web Browser",
    "description": pageDescription,
    "url": pageUrl,
    "image": pageImage,
    "author": author ? {
      "@type": "Person",
      "name": author
    } : {
      "@type": "Organization",
      "name": "voitz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "voitz",
      "logo": {
        "@type": "ImageObject",
        "url": `${DEFAULT_URL}brokebot_light_square.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "offers": type === 'product' ? {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "250"
    },
    "potentialAction": {
      "@type": "UseAction",
      "target": pageUrl
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={author || "voitz"} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="theme-color" content="#000000" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={pageTitle} />
      <meta name="twitter:creator" content="@voitz__" />
      <meta name="twitter:site" content="@voitz__" />

      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content={SITE_NAME} />
      
      {/* PWA Support */}
      <link rel="apple-touch-icon" sizes="180x180" href="/brokebot_light_square.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/brokebot_light_square.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/brokebot_light_square.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
} 