import fs from 'fs';

let code = fs.readFileSync('src/components/AdminBetaManagement.tsx', 'utf8');

code = code.replace(
  `const [invites, setInvites] = useState<any[]>([]);
  const [betaUsers, setBetaUsers] = useState<any[]>([]);`,
  `const [invites, setInvites] = useState<any[]>([]);
  const [betaUsers, setBetaUsers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);`
);

code = code.replace(
  `const [invitesRes, usersRes] = await Promise.all([
        fetch('/api/admin/beta/invitations', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/beta/users', { headers: { 'Authorization': \`Bearer \${token}\` } })
      ]);`,
  `const [invitesRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/beta/invitations', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/beta/users', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/beta/dashboard-stats', { headers: { 'Authorization': \`Bearer \${token}\` } })
      ]);
      if (statsRes.ok) setDashboardStats(await statsRes.json());`
);

const dashCodeReplacement = `
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>📊 Beta Dashboard</h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>BETA USERS</h4>
              <div style={{ color: '#00e5ff', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.betaUsers || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>ACTIVE INVITES</h4>
              <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.invites || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>OPEN BUGS</h4>
              <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.bugsOpen || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>CRITICAL ERRORS</h4>
              <div style={{ color: '#f87171', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.criticalErrors || 0}</div>
            </div>
          </div>
          
          {dashboardStats?.recentErrors?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase' }}>Recent System Errors</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Route</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.recentErrors.map((err: any) => (
                    <tr key={err.id}>
                      <td style={{ color: '#8b8b99' }}>{new Date(err.createdAt).toLocaleTimeString()}</td>
                      <td style={{ color: '#00e5ff', fontFamily: 'monospace' }}>{err.method} {err.route}</td>
                      <td style={{ color: '#f87171' }}>{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
`;

code = code.replace(
  /<div className="admin-card">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="admin-card">/m,
  dashCodeReplacement + '\n      <div className="admin-card">'
);

fs.writeFileSync('src/components/AdminBetaManagement.tsx', code);
