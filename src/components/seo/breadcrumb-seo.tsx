import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSEOProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSEO({ items }: BreadcrumbSEOProps) {
  const baseUrl = 'https://brokebot.voitz.dev';

  const allItems = items[0]?.name !== 'Home' ? [
    { name: 'Home', url: baseUrl },
    ...items
  ] : items;

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData, null, 2)}
      </script>
    </Helmet>
  );
} 