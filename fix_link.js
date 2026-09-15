import fs from 'fs';
let rec = fs.readFileSync('src/components/RecommendationsSection.tsx', 'utf8');
rec = rec.replace(/getTournamentUrl\(t.id, t.title\)/g, "getTournamentUrl(t.id, t.name)");
rec = rec.replace(/getTournamentUrl\(t.id, t.name\)/g, "getTournamentUrl(t.id, t.title)");
fs.writeFileSync('src/components/RecommendationsSection.tsx', rec);

let tour = fs.readFileSync('src/components/Tournament.tsx', 'utf8');
tour = tour.replace(/getTournamentUrl\(item.id, item.name\)/g, "getTournamentUrl(item.id, item.title)");
fs.writeFileSync('src/components/Tournament.tsx', tour);
