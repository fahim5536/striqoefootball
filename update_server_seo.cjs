const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sitemapCode = `
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(\`User-agent: *\\nAllow: /\\nSitemap: https://striqo.com/sitemap.xml\`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const [tournaments, users] = await Promise.all([
      prisma.tournament.findMany({ select: { id: true, createdAt: true }, take: 1000 }),
      prisma.user.findMany({ select: { id: true }, take: 1000 })
    ]);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
    
    const addUrl = (loc, lastmod = new Date().toISOString(), priority = '0.8') => {
      xml += \`  <url>\\n    <loc>\${loc}</loc>\\n    <lastmod>\${lastmod}</lastmod>\\n    <priority>\${priority}</priority>\\n  </url>\\n\`;
    };

    // Static pages
    addUrl('https://striqo.com/', new Date().toISOString(), '1.0');
    addUrl('https://striqo.com/tournaments', new Date().toISOString(), '0.9');
    addUrl('https://striqo.com/leaderboard', new Date().toISOString(), '0.9');

    // Dynamic pages
    tournaments.forEach(t => addUrl(\`https://striqo.com/tournaments/\${t.id}\`, t.createdAt.toISOString(), '0.7'));
    users.forEach(u => addUrl(\`https://striqo.com/profile?uid=\${u.id}\`, new Date().toISOString(), '0.6'));

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});
`;

if (!code.includes('app.get(\'/sitemap.xml\'')) {
  // Insert before the generic API routes or at a safe place
  const target = 'app.get("/api/:collection", async (req, res) => {';
  code = code.replace(target, sitemapCode + '\\n' + target);
}

const htmlInjectionCode = `
    const indexTemplatePath = path.join(distPath, 'index.html');
    app.get('*', async (req, res) => {
      try {
        let html = fs.readFileSync(indexTemplatePath, 'utf8');
        let title = 'STRIQO | Premium Esports Platform';
        let description = 'Compete in top-tier esports tournaments, join teams, and climb the leaderboard on STRIQO.';
        let image = 'https://striqo.com/og-image.jpg';

        if (req.path.startsWith('/tournaments/') && req.path.split('/').length === 3) {
          const id = req.path.split('/')[2];
          const t = await prisma.tournament.findUnique({ where: { id } }).catch(()=>null);
          if (t) {
            title = \`\${t.name || 'Tournament'} | STRIQO\`;
            description = t.description || \`Join the \${t.name} tournament on STRIQO.\`;
          }
        } else if (req.path === '/profile' && req.query.uid) {
          const u = await prisma.user.findUnique({ where: { id: req.query.uid as string } }).catch(()=>null);
          if (u) {
            title = \`\${u.username}'s Profile | STRIQO\`;
            description = \`Check out \${u.username}'s esports profile, stats, and match history.\`;
          }
        } else if (req.path === '/leaderboard') {
          title = 'Global Leaderboard | STRIQO';
          description = 'Check out the top-ranked players and teams on STRIQO. Climb the ladder and prove your skills.';
        }

        const metaTags = \`
          <title>\${title}</title>
          <meta name="description" content="\${description}" />
          <meta property="og:title" content="\${title}" />
          <meta property="og:description" content="\${description}" />
          <meta property="og:image" content="\${image}" />
          <meta property="og:url" content="\${'https://striqo.com' + req.originalUrl}" />
          <meta name="twitter:card" content="summary_large_image" />
        \`;
        
        html = html.replace(/<title>.*<\\/title>/, '');
        html = html.replace('</head>', metaTags + '</head>');
        
        res.send(html);
      } catch (err) {
        res.sendFile(indexTemplatePath);
      }
    });
`;

if (code.includes("app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));")) {
  code = code.replace("app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));", htmlInjectionCode);
  fs.writeFileSync('server.ts', code);
} else {
  console.log("Could not find the wildcard route to replace.");
}
