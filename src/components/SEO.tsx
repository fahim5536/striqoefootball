import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

export const SEO: React.FC<SEOProps> = ({ 
  title = 'STRIQO | Premium Esports Platform', 
  description = 'Compete in top-tier esports tournaments, join teams, and climb the leaderboard on STRIQO.',
  image = 'https://striqo.com/og-image.jpg',
  url = 'https://striqo.com',
  type = 'website',
  structuredData
}) => {
  const fullTitle = title === 'STRIQO | Premium Esports Platform' ? title : `${title} | STRIQO`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
