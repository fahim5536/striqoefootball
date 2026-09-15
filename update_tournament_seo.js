import fs from 'fs';
let code = fs.readFileSync('src/components/Tournament.tsx', 'utf8');

const importSeo = "import { SEO } from './SEO';\\n";
if (!code.includes('import { SEO }')) {
  code = code.replace("import React", importSeo + "import React");
  
  const seoTag = `
      <SEO 
        title="Esports Tournaments | STRIQO" 
        description="Browse and join upcoming esports tournaments. Compete for prizes and glory."
        url="https://striqo.com/tournaments"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Esports Tournaments",
          "url": "https://striqo.com/tournaments"
        }}
      />
  `;
  
  code = code.replace("return (", "return (\\n" + seoTag);
  
  // also replace any existing <Helmet> inside return
  code = code.replace(/<Helmet>[\s\S]*?<\/Helmet>/, "");
  
  fs.writeFileSync('src/components/Tournament.tsx', code);
}
