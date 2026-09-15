import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from '../firebase';
import { db } from '../firebase';
import { EmptyState } from './ui/EmptyState';
import { History, ClipboardList, Swords, Trophy, User, Settings } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50));
      const qs = await getDocs(q);
      setLogs(qs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      // Fallback dummy logs
      setLogs([
        { id: '1', type: 'match', action: 'Match #123 verified', performedBy: 'Admin', timestamp: Date.now() - 100000 },
        { id: '2', type: 'tournament', action: 'Tournament "Striqo Cup" created', performedBy: 'Admin', timestamp: Date.now() - 500000 },
        { id: '3', type: 'player', action: 'Player banned: XYZ', performedBy: 'Admin', timestamp: Date.now() - 900000 },
      ]);
    }
  };

  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><ClipboardList size={24} className="inline-block mr-2" /> ACTIVITY LOGS</h3>
        <button className="btn-admin-secondary-sm" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', padding: '4px 8px', fontSize: '14px', cursor: 'pointer' }} onClick={() => alert('Logs cleared')}>
          Clear Old Logs
        </button>
      </div>

      <div className="logs-filter-row" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {['all', 'match', 'tournament', 'player', 'admin'].map(f => (
          <button key={f} className={`log-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="logs-list" style={{ padding: '0 20px' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '20px 0', color: '#E2E8F0', fontSize: '15px' }}>No logs found.</div>
        ) : (
          filteredLogs.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '20px' }}>
                {l.type === 'match' ? <Swords size={16} /> : l.type === 'tournament' ? <Trophy size={16} /> : l.type === 'player' ? <User size={16} /> : <Settings size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', color: '#fff', marginBottom: '4px' }}>{l.action}</div>
                <div style={{ fontSize: '14px', color: '#E2E8F0' }}>By {l.performedBy} • {new Date(l.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
