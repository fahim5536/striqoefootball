import fs from 'fs';
let code = fs.readFileSync('src/components/TournamentDetails.tsx', 'utf8');

const importSeo = "import { SEO } from './SEO';\\n";
if (!code.includes('import { SEO }')) {
  code = code.replace("import { useParams, Link } from 'react-router-dom';", importSeo + "import { useParams, Link } from 'react-router-dom';");
  
  const seoTag = `
      <SEO 
        title={\`Tournament \${id} | STRIQO\`} 
        description={\`View details, brackets, and standings for tournament \${id} on STRIQO.\`}
        url={\`https://striqo.com/tournaments/\${id}\`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          "name": \`Tournament \${id}\`,
          "url": \`https://striqo.com/tournaments/\${id}\`
        }}
      />
  `;
  
  code = code.replace("return (\\n    <div", "return (\\n    <div\\n" + seoTag);
  fs.writeFileSync('src/components/TournamentDetails.tsx', code);
}
