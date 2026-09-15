import { Trophy, Swords, Users, AlertTriangle, Zap, Bell, Newspaper, ClipboardList } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect } from 'react';
import { collection, query, limit, orderBy, onSnapshot } from '../firebase';
import { db } from '../firebase';

export default function AdminDashboard({ setActiveTab, globalStats }: { setActiveTab: (tab: string) => void, globalStats: any }) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snap) => {
      const acts: any[] = [];
      snap.forEach(doc => {
        acts.push({ id: doc.id, ...doc.data() });
      });
      setActivities(acts);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon"><Trophy size={24} /></div>
          <div className="stat-card-value">{globalStats.tournaments || 0}</div>
          <div className="stat-card-label">Active Tournaments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Swords size={24} /></div>
          <div className="stat-card-value">{globalStats.matches || 0}</div>
          <div className="stat-card-label">Pending Matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><Users size={24} /></div>
          <div className="stat-card-value">{globalStats.players || 0}</div>
          <div className="stat-card-label">Total Players</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><AlertTriangle size={24} /></div>
          <div className="stat-card-value">{globalStats.disputes || 0}</div>
          <div className="stat-card-label">Disputes</div>
        </div>
      </div>

      <div className="quick-actions-section" style={{ marginBottom: '24px' }}>
        <h3 className="section-mini-title"><Zap size={18} className="inline-block mr-2" /> QUICK ACTIONS</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => setActiveTab('tournaments')}>
            <span><Trophy size={24} /></span> Create Tournament
          </button>
          <button className="quick-action-btn" onClick={() => setActiveTab('matches')}>
            <span><Swords size={24} /></span> Assign Match
          </button>
          <button className="quick-action-btn" onClick={() => setActiveTab('disputes')}>
            <span><AlertTriangle size={24} /></span> Review Disputes
          </button>
          <button className="quick-action-btn" onClick={() => setActiveTab('notifications')}>
            <span><Bell size={16} /></span> Send Alert
          </button>
          <button className="quick-action-btn" onClick={() => setActiveTab('news')}>
            <span><Newspaper size={16} /></span> Write News
          </button>
          <button className="quick-action-btn" onClick={() => setActiveTab('coins')}>
            <span><CoinIcon type="blue" /></span> Give Coins
          </button>
        </div>
      </div>

      <div className="recent-activity-section">
        <h3 className="section-mini-title"><ClipboardList size={18} className="inline-block mr-2" /> RECENT ACTIVITY</h3>
        <div className="activity-feed">
          {activities.length === 0 ? (
            <div style={{ color: '#E2E8F0', fontSize: '15px', padding: '12px 0' }}>No recent activity to show.</div>
          ) : (
            activities.map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e5ff' }} />
                <div style={{ flex: 1, color: '#fff', fontSize: '15px' }}>{act.action}</div>
                <div style={{ color: '#E2E8F0', fontSize: '14px' }}>
                  {act.timestamp?.toDate ? new Date(act.timestamp.toDate()).toLocaleString() : 'Just now'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
