import { BarChart2, Ticket, Key, Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function AdminBetaManagement() {
  const [invites, setInvites] = useState<any[]>([]);
  const [betaUsers, setBetaUsers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [maxUses, setMaxUses] = useState(1);

  const fetchBetaData = async () => {
    try {
      const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
      const [invitesRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/beta/invitations', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/beta/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/beta/dashboard-stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (statsRes.ok) setDashboardStats(await statsRes.json());
      if (invitesRes.ok) setInvites(await invitesRes.json());
      if (usersRes.ok) setBetaUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetaData();
  }, []);

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
      await fetch('/api/admin/beta/invitations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode, maxUses })
      });
      setNewCode('');
      setMaxUses(1);
      fetchBetaData();
    } catch (e) {
      console.error(e);
    }
  };

  const revokeInvite = async (id: string) => {
    try {
      const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
      await fetch(`/api/admin/beta/invitations/${id}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBetaData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBetaAccess = async (id: string) => {
    try {
      const token = localStorage.getItem('striqo_admin_token') || localStorage.getItem('striqo_token');
      await fetch(`/api/admin/beta/users/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBetaData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#8b8b99' }}>Loading Beta Management...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><BarChart2 size={24} className="inline-block mr-2" /> Beta Dashboard</h3>
        </div>
        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>BETA USERS</h4>
              <div style={{ color: '#00e5ff', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.betaUsers || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>ACTIVE INVITES</h4>
              <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.invites || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>OPEN BUGS</h4>
              <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.bugsOpen || 0}</div>
            </div>
            <div style={{ background: '#12122a', padding: '16px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.1)' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '8px' }}>CRITICAL ERRORS</h4>
              <div style={{ color: '#f87171', fontSize: '24px', fontWeight: 'bold' }}>{dashboardStats?.criticalErrors || 0}</div>
            </div>
          </div>
          
          {dashboardStats?.recentErrors?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase' }}>Recent System Errors</h4>
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

      <div className="admin-card">
        <div className="admin-card-header">
          <h3><Ticket size={24} className="inline-block mr-2" /> Generate Beta Invitation</h3>
        </div>
        <div className="admin-card-body">
          <form onSubmit={generateInvite} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#8b8b99', marginBottom: '8px' }}>Custom Code (Optional)</label>
              <input 
                type="text" 
                className="modal-input" 
                value={newCode} 
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="Leave blank for random code"
              />
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#8b8b99', marginBottom: '8px' }}>Max Uses</label>
              <input 
                type="number" 
                className="modal-input" 
                value={maxUses} 
                onChange={e => setMaxUses(parseInt(e.target.value))}
                min="1"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>Generate Code</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><Key size={24} className="inline-block mr-2" /> Active Invitations</h3>
          </div>
          <div className="admin-card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#8b8b99' }}>No invites found.</td></tr>
                ) : (
                  invites.map(invite => (
                    <tr key={invite.id}>
                      <td style={{ fontWeight: 'bold', letterSpacing: '2px', color: '#00e5ff' }}>{invite.code}</td>
                      <td>{invite.uses} / {invite.maxUses}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '14px',
                          background: invite.status === 'ACTIVE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                          color: invite.status === 'ACTIVE' ? '#4ade80' : '#f87171'
                        }}>
                          {invite.status}
                        </span>
                      </td>
                      <td>{new Date(invite.createdAt).toLocaleDateString()}</td>
                      <td>
                        {invite.status === 'ACTIVE' && (
                          <button onClick={() => revokeInvite(invite.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '14px' }}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3><Users size={24} className="inline-block mr-2" /> Beta Users</h3>
          </div>
          <div className="admin-card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Code Used</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {betaUsers.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#8b8b99' }}>No beta users yet.</td></tr>
                ) : (
                  betaUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td style={{ color: '#00e5ff' }}>{u.betaCodeUsed || 'N/A'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => toggleBetaAccess(u.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '14px' }}>
                          Revoke Beta Access
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
