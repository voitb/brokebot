import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_TITLE = 'brokebot - Your Private AI Assistant';
const DEFAULT_DESCRIPTION = 'Run a powerful AI assistant 100% locally in your browser. No data leaves your device. Free, private, and works offline.';
const DEFAULT_URL = 'https://your-domain.com/'; // Replace with your actual domain
const DEFAULT_IMAGE = `${DEFAULT_URL}brokebot_dark.png`;

export function Seo({ title, description, image, url }: SeoProps) {
  const pageTitle = title ? `${title} | brokebot` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageUrl = url ? `${DEFAULT_URL}${url}` : DEFAULT_URL;
  const pageImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />
    </Helmet>
  );
} 