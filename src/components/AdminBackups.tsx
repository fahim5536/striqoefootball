import { Save, CheckCircle2, XCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';


export default function AdminBackups() {
  const [backups, setBackups] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const fetchApi = async (url: string, options?: RequestInit) => { const token = localStorage.getItem('striqo_admin_token'); const res = await fetch(url, { ...options, headers: { ...options?.headers, 'Authorization': `Bearer ${token}` } }); if (!res.ok) throw new Error('API Error'); return res.json(); };

  const loadBackups = () => {
    fetchApi('/api/admin/backups')
      .then(res => setBackups(res || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadBackups();
    const interval = setInterval(loadBackups, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await fetchApi('/api/admin/backups/create', { method: 'POST', body: JSON.stringify({ type: 'FULL' }) });
      loadBackups();
    } catch (e) {
      console.error(e);
      alert('Failed to start backup');
    }
    setCreating(false);
  };

  const formatBytes = (bytes?: string | number) => {
    if (!bytes) return 'N/A';
    const b = Number(bytes);
    return (b / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3><Save size={24} className="inline-block mr-2" /> Backup & Disaster Recovery</h3>
        <button className="btn-primary" onClick={handleCreate} disabled={creating} style={{ padding: '6px 16px' }}>
          {creating ? 'Starting...' : 'Run Backup Now'}
        </button>
      </div>
      <div className="admin-card-body">
        <p style={{ color: '#8b8b99', fontSize: '14px', marginBottom: '16px' }}>
          Manage database snapshots, configuration backups, and restoration workflows.
        </p>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Started At</th>
              <th>Type</th>
              <th>Status</th>
              <th>Size</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#8b8b99' }}>No backups found</td>
              </tr>
            )}
            {backups.map((b, i) => (
              <tr key={b.id || i}>
                <td>{new Date(b.startedAt).toLocaleString()}</td>
                <td><span className="badge gray">{b.type}</span></td>
                <td>
                  <span className={`badge ${b.status === 'COMPLETED' ? 'green' : b.status === 'IN_PROGRESS' ? 'blue' : 'red'}`}>
                    {b.status}
                  </span>
                </td>
                <td>{formatBytes(b.sizeBytes)}</td>
                <td>{b.isVerified ? <CheckCircle2 size={16} color="#22c55e" /> : <XCircle size={16} color="#ff2d55" />}</td>
                <td>
                  <button className="btn-admin-secondary" disabled={b.status !== 'COMPLETED'} style={{ padding: '4px 8px', fontSize: '14px' }}>
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
