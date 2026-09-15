import { Users, X, Award, Bell, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot } from '../firebase';
import { db } from '../firebase';
import { EmptyState } from './ui/EmptyState';
import { Search } from 'lucide-react';

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filtered = players.filter(p => 
    (p.username || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.efootballId || '').toLowerCase().includes(search.toLowerCase())
  );

  const banPlayer = async (id: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? 'Unban this player?' : 'Ban this player?')) return;
    try {
      await updateDoc(doc(db, 'users', id), { isBanned: !currentStatus });
      if (selectedPlayer && selectedPlayer.id === id) {
        setSelectedPlayer({ ...selectedPlayer, isBanned: !currentStatus });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><Users size={24} className="inline-block mr-2" /> ALL PLAYERS</h3>
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              placeholder="Search by name or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="players-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PLAYER</th>
                <th>EFOOTBALL ID</th>
                <th><CoinIcon type="blue" /> COINS</th>
                <th><CoinIcon type="silver" /> COINS</th>
                <th>MATCHES</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Search} title="No Players Found" description="Try adjusting your search criteria." />
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="row-updated">
                  <td style={{ color: '#fff', fontWeight: 'bold' }}>{p.username || 'No Name'}</td>
                  <td>{p.efootballId || 'N/A'}</td>
                  <td><span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{p.blueCoins || 0}</span></td>
                  <td><span style={{ color: '#F8FAFC', fontWeight: 'bold' }}>{p.silverCoins || 0}</span></td>
                  <td>{p.matchesPlayed || 0}</td>
                  <td>
                    {p.isBanned ? (
                      <span className="nav-badge red">BANNED</span>
                    ) : (
                      <span className="nav-badge cyan">ACTIVE</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedPlayer(p)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                    >
                      MANAGE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPlayer && (
        <div className="modal-overlay open" style={{ zIndex: 9999 }} onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content player-detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPlayer(null)}><X size={20} /></button>
            <div className="player-detail-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="player-modal-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#333' }}></div>
              <div>
                <h3 className="player-modal-name" style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{selectedPlayer.username}</h3>
                <p className="player-modal-id" style={{ margin: 0, color: '#F8FAFC', fontSize: '14px' }}>ID: {selectedPlayer.efootballId}</p>
              </div>
            </div>
            
            <div className="player-detail-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button className="btn-admin-secondary" onClick={() => alert('Feature coming soon')}><CoinIcon type="blue" /> Give Blue Coins</button>
              <button className="btn-admin-secondary" onClick={() => alert('Feature coming soon')}><CoinIcon type="silver" /> Give Silver Coins</button>
              <button className="btn-admin-secondary" onClick={() => alert('Feature coming soon')}><Award size={16} className="inline-block mr-2" /> Award Badge</button>
              <button className="btn-admin-secondary" onClick={() => alert('Feature coming soon')}><Bell size={16} className="inline-block mr-2" /> Send Notification</button>
              <button className="btn-warn" onClick={() => alert('Feature coming soon')}><AlertTriangle size={16} className="inline-block mr-2" /> Issue Warning</button>
              <button className="btn-ban" onClick={() => banPlayer(selectedPlayer.id, selectedPlayer.isBanned)}>
                {selectedPlayer.isBanned ? '<CheckCircle2 size={16} className="inline-block mr-2" /> Unban Player' : '<Ban size={16} className="inline-block mr-2" /> Ban Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
