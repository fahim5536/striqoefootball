import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldSocExport = `app.get("/api/admin/soc/export", requireAuth, requireAdmin, async (req, res) => {
  try {
    const events = await prisma.securityEvent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const csvRows = [
      ['ID', 'Timestamp', 'Type', 'Severity', 'User ID', 'IP', 'Description'],
      ...events.map(e => [
        e.id, 
        e.createdAt.toISOString(),
        e.eventType,
        e.severity,
        e.userId || 'N/A',
        e.ipAddress || 'N/A',
        \`"\${(e.description || '').replace(/"/g, '""')}"\`
      ])
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security_audit_log.csv"');
    res.send(csvRows.map(row => row.join(',')).join('\\n'));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});`;

const newSocExport = `app.get("/api/admin/soc/export", requireAuth, requireAdmin, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security_audit_log.csv"');
    res.write('ID,Timestamp,Type,Severity,User ID,IP,Description\\n');
    
    const batchSize = 1000;
    let lastId = undefined;
    let hasMore = true;
    
    while (hasMore) {
      const events = await prisma.securityEvent.findMany({
        take: batchSize,
        skip: lastId ? 1 : 0,
        cursor: lastId ? { id: lastId } : undefined,
        orderBy: { id: 'desc' }
      });
      
      if (events.length === 0) {
        hasMore = false;
      } else {
        const rows = events.map(e => {
          const desc = \`"\${(e.description || '').replace(/"/g, '""')}"\`;
          return \`\${e.id},\${e.createdAt.toISOString()},\${e.eventType},\${e.severity},\${e.userId || 'N/A'},\${e.ipAddress || 'N/A'},\${desc}\`;
        }).join('\\n') + '\\n';
        res.write(rows);
        lastId = events[events.length - 1].id;
      }
    }
    return res.end();
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});`;

if(code.includes('api/admin/soc/export')) {
    code = code.replace(oldSocExport, newSocExport);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed soc export');
}
