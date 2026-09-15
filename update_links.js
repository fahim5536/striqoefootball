import fs from 'fs';

let utilsImport = "import { getTournamentUrl } from '../lib/seo';\\n";

// Update RecommendationsSection.tsx
let rec = fs.readFileSync('src/components/RecommendationsSection.tsx', 'utf8');
if (!rec.includes('getTournamentUrl')) {
  rec = rec.replace("import { Link }", utilsImport + "import { Link }");
  rec = rec.replace(/to=\{\`\/tournaments\/\$\{t\.id\}\`\}/g, "to={getTournamentUrl(t.id, t.name)}");
  fs.writeFileSync('src/components/RecommendationsSection.tsx', rec);
}

// Update Tournament.tsx
let tour = fs.readFileSync('src/components/Tournament.tsx', 'utf8');
if (!tour.includes('getTournamentUrl')) {
  tour = tour.replace("import React from", utilsImport + "import React from");
  tour = tour.replace(/href=\{\`\/tournaments\/\$\{item\.id\}\`\}/g, "href={getTournamentUrl(item.id, item.name)}");
  tour = tour.replace(/handleAuthNavigation\(e, \`\/tournaments\/\$\{item\.id\}\`\)/g, "handleAuthNavigation(e, getTournamentUrl(item.id, item.name))");
  fs.writeFileSync('src/components/Tournament.tsx', tour);
}

