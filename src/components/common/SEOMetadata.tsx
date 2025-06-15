import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOMetadataProps {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
}

export const SEOMetadata: React.FC<SEOMetadataProps> = ({
  title,
  description,
  imageUrl,
  url,
}) => {
  const siteName = "BrokeBot by Voitec";
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta name="twitter:url" content={url} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}; 