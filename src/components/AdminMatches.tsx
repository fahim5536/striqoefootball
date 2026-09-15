import { Swords, ClipboardList, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, onSnapshot, query, orderBy, limit } from '../firebase';
import { db } from '../firebase';
import { EmptyState } from './ui/EmptyState';

export default function AdminMatches() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');

  const [selTourId, setSelTourId] = useState('');
  const [selRound, setSelRound] = useState('1');
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');

  useEffect(() => {
    // We only load these once or we can subscribe
    const loadStaticData = async () => {
      try {
        const qsTour = await getDocs(collection(db, 'tournaments'));
        setTournaments(qsTour.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const qsPlay = await getDocs(collection(db, 'users'));
        setPlayers(qsPlay.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
    };
    loadStaticData();

    // Listen to matches real-time
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMatches(list);
    });

    return () => unsubscribe();
  }, []);

  const handleAssign = async () => {
    if (!selTourId || !playerA || !playerB) return alert("Select all fields");
    if (playerA === playerB) return alert("Select different players");
    try {
      await addDoc(collection(db, 'matches'), {
        tournamentId: selTourId,
        round: selRound,
        playerA,
        playerB,
        status: 'pending',
        createdAt: Date.now()
      });
      alert('Match assigned successfully!');
      setPlayerA('');
      setPlayerB('');
    } catch (e) {
      console.error(e);
      alert('Failed to assign match');
    }
  };

  const pAObj = players.find(p => p.id === playerA);
  const pBObj = players.find(p => p.id === playerB);

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><Swords size={24} className="inline-block mr-2" /> ASSIGN NEW MATCH</h3>
        </div>
        <div className="admin-card-body">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">SELECT TOURNAMENT</label>
              <select className="form-select" value={selTourId} onChange={e => setSelTourId(e.target.value)}>
                <option value="">Choose tournament...</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ROUND</label>
              <select className="form-select" value={selRound} onChange={e => setSelRound(e.target.value)}>
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                <option value="3">Semi Final</option>
                <option value="4">Final</option>
              </select>
            </div>
          </div>

          <div className="vs-selector">
            <div className="vs-player-select">
              <label className="form-label">PLAYER A</label>
              <select className="form-select" value={playerA} onChange={e => setPlayerA(e.target.value)}>
                <option value="">Select player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.username || 'Unnamed'} ({p.efootballId})</option>)}
              </select>
              <div className="player-preview" style={{ marginTop: '10px', fontSize: '14px', color: '#00e5ff' }}>
                {pAObj && `Selected: ${pAObj.username}`}
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="vs-player-select">
              <label className="form-label">PLAYER B</label>
              <select className="form-select" value={playerB} onChange={e => setPlayerB(e.target.value)}>
                <option value="">Select player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.username || 'Unnamed'} ({p.efootballId})</option>)}
              </select>
              <div className="player-preview" style={{ marginTop: '10px', fontSize: '14px', color: '#00e5ff' }}>
                {pBObj && `Selected: ${pBObj.username}`}
              </div>
            </div>
          </div>
          <button className="btn-admin-primary full-width" onClick={handleAssign}>
            <Swords size={18} className="inline-block mr-2" /> ASSIGN MATCH & NOTIFY PLAYERS
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3><ClipboardList size={24} className="inline-block mr-2" /> ALL MATCHES</h3>
          <div className="filter-tabs">
            {['pending', 'submitted', 'verified', 'disputed'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'pending' ? <><AlertCircle size={16} className="inline-block mr-1 text-yellow-500" /></> : f === 'submitted' ? '<CoinIcon type="blue" />' : f === 'verified' ? <><CheckCircle2 size={16} className="inline-block mr-1 text-green-500" /></> : <><XCircle size={16} className="inline-block mr-1 text-red-500" /></>} {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="tournaments-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>TOURNAMENT</th>
                <th>ROUND</th>
                <th>PLAYER A</th>
                <th>PLAYER B</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {matches.filter(m => m.status === filter).length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No matches found</td></tr>
              ) : (
                matches.filter(m => m.status === filter).map(m => {
                  const t = tournaments.find(x => x.id === m.tournamentId);
                  const pa = players.find(x => x.id === m.playerA);
                  const pb = players.find(x => x.id === m.playerB);
                  return (
                    <tr key={m.id} className="row-updated">
                      <td>{t?.name || 'Unknown'}</td>
                      <td>Round {m.round}</td>
                      <td>{pa?.username || m.playerA}</td>
                      <td>{pb?.username || m.playerB}</td>
                      <td>
                        <span className={`nav-badge ${m.status === 'verified' ? 'cyan' : m.status === 'disputed' ? 'red' : 'yellow'}`}>
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                          VIEW
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
