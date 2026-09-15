import { Save, Rocket } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from '../firebase';
import { db } from '../firebase';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const [tourName, setTourName] = useState('');
  const [tourFormat, setTourFormat] = useState('elimination');
  const [tourMaxPlayers, setTourMaxPlayers] = useState('8');
  const [tourPrize, setTourPrize] = useState('');
  const [tourStartDate, setTourStartDate] = useState('');
  const [tourDescription, setTourDescription] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTournaments(list);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (isActive: boolean) => {
    if (!tourName) return alert('Tournament Name is required');
    try {
      await addDoc(collection(db, 'tournaments'), {
        name: tourName,
        format: tourFormat,
        maxPlayers: parseInt(tourMaxPlayers),
        prizePool: parseInt(tourPrize) || 0,
        startDate: tourStartDate,
        description: tourDescription,
        status: isActive ? 'active' : 'draft',
        createdAt: Date.now()
      });
      // realtime listener will auto-update
      setTourName('');
      setTourPrize('');
      setTourStartDate('');
      setTourDescription('');
    } catch (err) {
      console.error(err);
      alert('Failed to create tournament');
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>CREATE NEW TOURNAMENT</h3>
        </div>
        <div className="admin-card-body">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">TOURNAMENT NAME *</label>
              <input type="text" className="form-input" placeholder="e.g. Striqo Cup #5" value={tourName} onChange={e => setTourName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">FORMAT</label>
              <select className="form-select" value={tourFormat} onChange={e => setTourFormat(e.target.value)}>
                <option value="elimination">3-Loss Elimination</option>
                <option value="single">Single Elimination</option>
                <option value="roundrobin">Round Robin</option>
              </select>
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">MAX PLAYERS</label>
              <select className="form-select" value={tourMaxPlayers} onChange={e => setTourMaxPlayers(e.target.value)}>
                <option value="4">4 Players</option>
                <option value="8">8 Players</option>
                <option value="16">16 Players</option>
                <option value="32">32 Players</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PRIZE (BLUE COINS)</label>
              <input type="number" className="form-input" placeholder="500" min="0" value={tourPrize} onChange={e => setTourPrize(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">START DATE</label>
              <input type="date" className="form-input" value={tourStartDate} onChange={e => setTourStartDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">DESCRIPTION (Optional)</label>
            <textarea className="form-textarea" rows={3} placeholder="Tournament rules and info..." value={tourDescription} onChange={e => setTourDescription(e.target.value)}></textarea>
          </div>
          <div className="form-actions" style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <button className="btn-admin-secondary" onClick={() => handleCreate(false)}><Save size={16} className="inline-block mr-2" /> Save Draft</button>
            <button className="btn-admin-primary" onClick={() => handleCreate(true)}><Rocket size={16} className="inline-block mr-2" /> Create & Activate</button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>ALL TOURNAMENTS</h3>
          <div className="filter-tabs">
            {['all', 'active', 'upcoming', 'ended', 'draft'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="tournaments-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>STATUS</th>
                <th>FORMAT</th>
                <th>PLAYERS</th>
                <th>PRIZE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.filter(t => filter === 'all' || t.status === filter).length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No tournaments found</td>
                </tr>
              ) : (
                tournaments.filter(t => filter === 'all' || t.status === filter).map(t => (
                  <tr key={t.id} className="row-updated">
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>{t.name}</td>
                    <td>
                      <span className={`nav-badge ${t.status === 'active' ? 'cyan' : t.status === 'ended' ? 'red' : 'yellow'}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{t.format === 'elimination' ? '3-Loss Elim' : t.format}</td>
                    <td>{t.players?.length || 0} / {t.maxPlayers}</td>
                    <td>{t.prizePool} <CoinIcon type="blue" /></td>
                    <td>
                      <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                        EDIT
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
  );
}
