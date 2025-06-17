import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOMetadataProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export const SEOMetadata: React.FC<SEOMetadataProps> = ({
  title,
  description,
  imageUrl,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords = [],
  noIndex = false,
}) => {
  const siteName = "brokebot";
  const siteUrl = "https://brokebot.voitz.dev";
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = `${siteUrl}/brokebot_dark.png`;
  const pageImage = imageUrl || defaultImage;
  const pageUrl = url || siteUrl;
  const defaultKeywords = ['AI Assistant', 'ChatGPT Clone', 'Local AI', 'Private AI', 'brokebot'];
  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  // Generate JSON-LD structured data for shared content
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebPage',
    "headline": title,
    "description": description,
    "url": pageUrl,
    "image": pageImage,
    "author": author ? {
      "@type": "Person",
      "name": author
    } : {
      "@type": "Organization", 
      "name": "brokebot"
    },
    "publisher": {
      "@type": "Organization",
      "name": "brokebot",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/brokebot_light_square.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "isPartOf": {
      "@type": "WebSite",
      "@id": siteUrl,
      "name": siteName
    }
  };

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author || "brokebot"} />
      {url && <link rel="canonical" href={url} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta name="twitter:url" content={url} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:creator" content="@voitec" />
      <meta name="twitter:site" content="@voitec" />

      {/* Additional Meta */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#000000" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
}; 