import { Bell, Megaphone, Users, Trophy, User, AlertTriangle, CheckCircle2, Siren, Swords } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from '../firebase';
import { db } from '../firebase';

export default function AdminNotifications() {
  const [target, setTarget] = useState('all');
  const [notifTour, setNotifTour] = useState('');
  const [notifPlayer, setNotifPlayer] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [message, setMessage] = useState('');
  
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);

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

  const useTemplate = (t: string) => {
    if (t === 'match') setMessage("Your next match has been assigned! Please check the bracket.");
    if (t === 'tournament') setMessage("A new tournament is starting soon. Make sure you are ready!");
    if (t === 'reminder') setMessage("⏰ Reminder: Please submit your match result as soon as you finish.");
  };

  const sendNotification = async () => {
    if (!message) return alert("Message is empty");
    try {
      await addDoc(collection(db, 'notifications'), {
        target,
        tournamentId: target === 'tournament' ? notifTour : null,
        userId: target === 'single' ? notifPlayer : null,
        type: notifType,
        message,
        createdAt: Date.now()
      });
      alert('Notification sent!');
      setMessage('');
    } catch (e) {
      console.error(e);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3><Bell size={16} className="inline-block mr-2" /> SEND NOTIFICATION</h3>
      </div>
      <div className="admin-card-body">
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">SEND TO</label>
          <div className="target-toggles">
            <button className={`target-toggle ${target === 'all' ? 'active' : ''}`} onClick={() => setTarget('all')}><Users size={16} className="inline-block mr-2" /> All Players</button>
            <button className={`target-toggle ${target === 'tournament' ? 'active' : ''}`} onClick={() => setTarget('tournament')}><Trophy size={16} className="inline-block mr-2" /> Tournament Players</button>
            <button className={`target-toggle ${target === 'single' ? 'active' : ''}`} onClick={() => setTarget('single')}><User size={16} className="inline-block mr-2" /> Single Player</button>
          </div>
        </div>

        {target === 'tournament' && (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">SELECT TOURNAMENT</label>
            <select className="form-select" value={notifTour} onChange={e => setNotifTour(e.target.value)}>
              <option value="">Choose tournament...</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        {target === 'single' && (
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">SELECT PLAYER</label>
            <select className="form-select" value={notifPlayer} onChange={e => setNotifPlayer(e.target.value)}>
              <option value="">Choose player...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.username || 'Unnamed'} ({p.efootballId})</option>)}
            </select>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">TYPE</label>
          <div className="notif-type-grid">
            <button className={`notif-type-btn ${notifType === 'info' ? 'active' : ''}`} onClick={() => setNotifType('info')}>ℹ️ Info</button>
            <button className={`notif-type-btn ${notifType === 'warning' ? 'active' : ''}`} onClick={() => setNotifType('warning')}><AlertTriangle size={16} className="inline-block mr-2" /> Warning</button>
            <button className={`notif-type-btn ${notifType === 'success' ? 'active' : ''}`} onClick={() => setNotifType('success')}><CheckCircle2 size={16} className="inline-block mr-2" /> Good News</button>
            <button className={`notif-type-btn ${notifType === 'urgent' ? 'active' : ''}`} onClick={() => setNotifType('urgent')}><Siren size={16} className="inline-block mr-2" /> Urgent</button>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">MESSAGE *</label>
          <textarea 
            className="form-textarea" 
            rows={3} 
            placeholder="Your notification message..." 
            maxLength={300}
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></textarea>
          <span className="char-count" style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '4px', display: 'block', textAlign: 'right' }}>
            {message.length}/300
          </span>
        </div>

        <div className="notif-templates" style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="template-label" style={{ fontSize: '14px', color: '#F8FAFC' }}>Quick:</span>
          <button className="template-btn" onClick={() => useTemplate('match')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}><Swords size={16} className="inline-block mr-2" /> Match Assigned</button>
          <button className="template-btn" onClick={() => useTemplate('tournament')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}><Trophy size={16} className="inline-block mr-2" /> Tournament Starting</button>
          <button className="template-btn" onClick={() => useTemplate('reminder')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>⏰ Submit Result</button>
        </div>

        <button className="btn-admin-primary" onClick={sendNotification}>
          <Bell size={16} className="inline-block mr-2" /> SEND NOTIFICATION
        </button>
      </div>
    </div>
  );
}
