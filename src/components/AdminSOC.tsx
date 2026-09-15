import { ShieldAlert } from 'lucide-react';
import React, { useState, useEffect } from 'react';


export default function AdminSOC() {
  const [events, setEvents] = useState<any[]>([]);
  const fetchApi = async (url: string, options?: RequestInit) => { const token = localStorage.getItem('striqo_admin_token'); const res = await fetch(url, { ...options, headers: { ...options?.headers, 'Authorization': `Bearer ${token}` } }); if (!res.ok) throw new Error('API Error'); return res.json(); };

  useEffect(() => {
    fetchApi('/api/admin/soc/events')
      .then(res => setEvents(res || []))
      .catch(console.error);
  }, []);

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3><ShieldAlert size={24} className="inline-block mr-2" /> Security Operations Center (SOC)</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span className="badge" style={{ background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>LIVE</span><button className="btn-admin-secondary" onClick={() => { const t = localStorage.getItem('striqo_admin_token'); window.open('/api/admin/soc/export?token=' + t, '_blank'); }} style={{ padding: '4px 12px', fontSize: '14px' }}>Export CSV</button></div>
      </div>
      <div className="admin-card-body">
        <p style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '16px' }}>Monitoring for suspicious activities, brute-force attempts, and access violations.</p>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Severity</th>
              <th>Event Type</th>
              <th>User</th>
              <th>IP Address</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#8b8b99' }}>No security events logged</td>
              </tr>
            )}
            {events.map((ev, i) => (
              <tr key={ev.id || i}>
                <td>{new Date(ev.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`badge ${ev.severity === 'CRITICAL' ? 'red' : ev.severity === 'HIGH' ? 'orange' : ev.severity === 'MEDIUM' ? 'yellow' : 'gray'}`}>
                    {ev.severity}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{ev.eventType}</td>
                <td>{ev.user ? ev.user.username : 'Unknown'}</td>
                <td style={{ fontFamily: 'monospace', color: '#00e5ff' }}>{ev.ipAddress || 'N/A'}</td>
                <td>{ev.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
