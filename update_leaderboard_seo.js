import fs from 'fs';
let code = fs.readFileSync('src/components/Leaderboard.tsx', 'utf8');

const importSeo = "import { SEO } from './SEO';\\n";
if (!code.includes('import { SEO }')) {
  code = code.replace("import React", importSeo + "import React");
  
  const seoTag = `
      <SEO 
        title="Global Leaderboard | STRIQO" 
        description="Check out the top-ranked players and teams on STRIQO. Climb the ladder and prove your skills."
        url="https://striqo.com/leaderboard"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Global Leaderboard",
          "url": "https://striqo.com/leaderboard"
        }}
      />
  `;
  
  code = code.replace("return (", "return (\\n" + seoTag);
  
  // also replace any existing <Helmet> inside return
  code = code.replace(/<Helmet>[\s\S]*?<\/Helmet>/, "");
  
  fs.writeFileSync('src/components/Leaderboard.tsx', code);
}
