import fs from 'fs';

let code = fs.readFileSync('src/components/AdminBetaManagement.tsx', 'utf8');

code = code.replace(
  `import React, { useState, useEffect } from 'react';`,
  `import React, { useState, useEffect } from 'react';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';`
);

const dashCode = `
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>📊 Beta Dashboard</h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>BETA USERS</h4>
              <div style={{ color: '#00e5ff', fontSize: '24px', fontWeight: 'bold' }}>{betaUsers.length}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>ACTIVE INVITES</h4>
              <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }}>{invites.filter(i => i.status === 'ACTIVE').length}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '12px', marginBottom: '8px' }}>TOTAL INVITE USES</h4>
              <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>{invites.reduce((acc, curr) => acc + curr.uses, 0)}</div>
            </div>
          </div>
        </div>
      </div>
`;

code = code.replace(
  `return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-card">`,
  `return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
${dashCode}
      <div className="admin-card">`
);

fs.writeFileSync('src/components/AdminBetaManagement.tsx', code);
