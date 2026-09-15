import fs from 'fs';
let code = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const importSeo = "import { SEO } from './SEO';\\n";
if (!code.includes('import { SEO }')) {
  code = code.replace("import React", importSeo + "import React");
  
  const seoTag = `
      <SEO 
        title={profileData ? \`\${profileData.username || 'Player'} | STRIQO Profile\` : 'Player Profile | STRIQO'} 
        description={profileData ? \`Check out \${profileData.username}'s esports profile, stats, and match history on STRIQO.\` : 'Player Profile'}
        url={viewingUid ? \`https://striqo.com/profile?uid=\${viewingUid}\` : 'https://striqo.com/profile'}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": profileData?.username || 'Player',
          "url": viewingUid ? \`https://striqo.com/profile?uid=\${viewingUid}\` : 'https://striqo.com/profile'
        }}
      />
  `;
  
  code = code.replace("return (", "return (\\n" + seoTag);
  
  fs.writeFileSync('src/components/Profile.tsx', code);
}
