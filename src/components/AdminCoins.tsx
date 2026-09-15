import { Plus, Minus, Zap } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment } from '../firebase';
import { db } from '../firebase';

export default function AdminCoins() {
  const [players, setPlayers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  
  const [coinPlayer, setCoinPlayer] = useState('');
  const [coinType, setCoinType] = useState('blue');
  const [coinAmount, setCoinAmount] = useState('');
  const [coinAction, setCoinAction] = useState('add');
  const [coinReason, setCoinReason] = useState('');

  const [bulkTour, setBulkTour] = useState('');
  const [bulkAmount, setBulkAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pQs = await getDocs(collection(db, 'users'));
      setPlayers(pQs.docs.map(d => ({ id: d.id, ...d.data() })));
      const tQs = await getDocs(collection(db, 'tournaments'));
      setTournaments(tQs.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const processTransaction = async () => {
    if (!coinPlayer || !coinAmount) return alert('Select player and amount');
    const amt = parseInt(coinAmount);
    if (isNaN(amt) || amt <= 0) return alert('Invalid amount');

    try {
      const field = coinType === 'blue' ? 'blueCoins' : 'silverCoins';
      const val = coinAction === 'add' ? amt : -amt;
      await updateDoc(doc(db, 'users', coinPlayer), {
        [field]: increment(val)
      });
      alert(`Successfully ${coinAction === 'add' ? 'added' : 'deducted'} ${amt} ${coinType} coins!`);
      setCoinAmount('');
      setCoinReason('');
    } catch (e) {
      console.error(e);
      alert('Transaction failed');
    }
  };

  const processBulk = async () => {
    if (!bulkTour || !bulkAmount) return alert('Select tournament and amount');
    const amt = parseInt(bulkAmount);
    if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
    
    // In a real app, you would batch update all players in this tournament
    alert(`Bulk awarded ${amt} blue coins to tournament players! (Simulated)`);
    setBulkAmount('');
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><CoinIcon type="blue" /> COIN MANAGER</h3>
      </div>
      <div className="admin-card-body">
        <div className="coin-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">SELECT PLAYER</label>
              <select className="form-select" value={coinPlayer} onChange={e => setCoinPlayer(e.target.value)}>
                <option value="">Choose player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.username || 'Unnamed'} ({p.efootballId})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">COIN TYPE</label>
              <div className="coin-type-toggle">
                <button className={`coin-toggle ${coinType === 'blue' ? 'active' : ''}`} onClick={() => setCoinType('blue')}><CoinIcon type="blue" /> Blue Coins</button>
                <button className={`coin-toggle ${coinType === 'silver' ? 'active' : ''}`} onClick={() => setCoinType('silver')}><CoinIcon type="silver" /> Silver Coins</button>
              </div>
            </div>
          </div>

          <div className="form-row-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">AMOUNT</label>
              <input type="number" className="form-input" placeholder="e.g. 50" min="1" value={coinAmount} onChange={e => setCoinAmount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ACTION</label>
              <div className="action-toggle">
                <button className={`action-btn ${coinAction === 'add' ? 'active' : ''}`} onClick={() => setCoinAction('add')}><Plus size={16} className="inline-block mr-2" /> Add</button>
                <button className={`action-btn ${coinAction === 'deduct' ? 'active' : ''}`} onClick={() => setCoinAction('deduct')}><Minus size={16} className="inline-block mr-2" /> Deduct</button>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">REASON (Optional)</label>
            <input type="text" className="form-input" placeholder="e.g. Tournament prize bonus" value={coinReason} onChange={e => setCoinReason(e.target.value)} />
          </div>

          <button className="btn-admin-primary" style={{ marginTop: '24px' }} onClick={processTransaction}>
            PROCESS TRANSACTION
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '32px 0' }}></div>

        <div className="bulk-coins-section">
          <h4 className="section-mini-title"><Zap size={16} className="inline-block mr-2" /> BULK AWARD</h4>
          <p className="section-mini-sub">Give coins to ALL players in a tournament</p>
          <div className="form-row-3">
            <select className="form-select" value={bulkTour} onChange={e => setBulkTour(e.target.value)}>
              <option value="">Select tournament...</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="number" className="form-input" placeholder="Coins amount" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} />
            <button className="btn-admin-secondary" onClick={processBulk}>
              <CoinIcon type="blue" /> Award All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
