import fs from 'fs';
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const importSeo = "import { SEO } from './SEO';\\n";
if (!code.includes('import { SEO }')) {
  code = code.replace("import { Link }", importSeo + "import { Link }");
  
  const seoTag = `
      <SEO 
        title="STRIQO | Premium Esports Platform" 
        description="Join the ultimate esports platform. Compete in tournaments, build teams, and track your stats."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "STRIQO",
          "url": "https://striqo.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://striqo.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
  `;
  
  code = code.replace("return (", "return (\\n" + seoTag);
  fs.writeFileSync('src/components/Dashboard.tsx', code);
}
