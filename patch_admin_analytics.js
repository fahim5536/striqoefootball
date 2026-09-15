import fs from 'fs';

let code = fs.readFileSync('src/components/AdminAnalytics.tsx', 'utf8');

const betaMetrics = `
        <div className="admin-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>Open Feedback</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.openFeedbacks || 0}</div>
          <div style={{ fontSize: '14px', color: '#6b6b7a', marginTop: '8px' }}>Out of {data.metrics.totalFeedbacks || 0} total</div>
        </div>
        <div className="admin-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>System Issues (30d)</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>{data.metrics.recentErrors || 0}</div>
          <div style={{ fontSize: '14px', color: '#f87171', marginTop: '8px' }}>{data.metrics.authFailures || 0} Auth Failures</div>
        </div>
`;

code = code.replace(
  `        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>AI Feature Usage</h4>`,
  `${betaMetrics}
        <div className="admin-card" style={{ padding: '24px' }}>
          <h4 style={{ color: '#8b8b99', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>AI Feature Usage</h4>`
);

fs.writeFileSync('src/components/AdminAnalytics.tsx', code);
