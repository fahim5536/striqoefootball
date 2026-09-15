import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldUserExport = `app.get("/api/reports/export/users", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { format = 'csv' } = req.query;
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, status: true, createdAt: true }
    });
    
    if (format === 'csv') {
      const header = 'id,username,email,role,status,createdAt\\n';
      const rows = users.map(u => \`\${u.id},\${u.username},\${u.email},\${u.role},\${u.status},\${u.createdAt.toISOString()}\`).join('\\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
      return res.send(header + rows);
    } else {
      // For JSON format fallback or future expansion (e.g. PDF generation would go here)
      res.json(users);
    }
  } catch (e: any) {
    logger.error("Export Users Error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const newUserExport = `app.get("/api/reports/export/users", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { format = 'csv' } = req.query;
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
      res.write('id,username,email,role,status,createdAt\\n');
      
      const batchSize = 1000;
      let lastId = undefined;
      let hasMore = true;
      
      while (hasMore) {
        const users = await prisma.user.findMany({
          take: batchSize,
          skip: lastId ? 1 : 0,
          cursor: lastId ? { id: lastId } : undefined,
          select: { id: true, username: true, email: true, role: true, status: true, createdAt: true },
          orderBy: { id: 'asc' }
        });
        
        if (users.length === 0) {
          hasMore = false;
        } else {
          const rows = users.map(u => \`\${u.id},\${u.username},\${u.email},\${u.role},\${u.status},\${u.createdAt.toISOString()}\`).join('\\n') + '\\n';
          res.write(rows);
          lastId = users[users.length - 1].id;
        }
      }
      return res.end();
    } else {
      const users = await prisma.user.findMany({ take: 5000 }); // limit JSON export
      res.json(users);
    }
  } catch (e: any) {
    logger.error("Export Users Error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const oldAuditExport = `app.get("/api/reports/export/audit", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const logs = await prisma.adminActionLog.findMany({
      include: { admin: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const header = 'id,admin,action,targetType,targetId,details,ip,timestamp\\n';
    const rows = logs.map(l => {
      // Escape commas in details
      const details = l.details ? \`"\${l.details.replace(/"/g, '""')}"\` : '';
      return \`\${l.id},\${l.admin.username},\${l.action},\${l.targetType || ''},\${l.targetId || ''},\${details},\${l.ipAddress || ''},\${l.createdAt.toISOString()}\`;
    }).join('\\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    return res.send(header + rows);
  } catch (e: any) {
    logger.error("Export Audit Error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const newAuditExport = `app.get("/api/reports/export/audit", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.write('id,admin,action,targetType,targetId,details,ip,timestamp\\n');
    
    const batchSize = 1000;
    let lastId = undefined;
    let hasMore = true;
    
    while (hasMore) {
      const logs = await prisma.adminActionLog.findMany({
        take: batchSize,
        skip: lastId ? 1 : 0,
        cursor: lastId ? { id: lastId } : undefined,
        include: { admin: { select: { username: true } } },
        orderBy: { id: 'desc' }
      });
      
      if (logs.length === 0) {
        hasMore = false;
      } else {
        const rows = logs.map(l => {
          const details = l.details ? \`"\${l.details.replace(/"/g, '""')}"\` : '';
          return \`\${l.id},\${l.admin.username},\${l.action},\${l.targetType || ''},\${l.targetId || ''},\${details},\${l.ipAddress || ''},\${l.createdAt.toISOString()}\`;
        }).join('\\n') + '\\n';
        res.write(rows);
        lastId = logs[logs.length - 1].id;
      }
    }
    return res.end();
  } catch (e: any) {
    logger.error("Export Audit Error:", e);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});`;

code = code.replace(oldUserExport, newUserExport);
code = code.replace(oldAuditExport, newAuditExport);
fs.writeFileSync('server.ts', code);
console.log('Fixed export endpoints with cursor streaming');
