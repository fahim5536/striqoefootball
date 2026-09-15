import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from '../firebase';
import { db } from '../firebase';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'matches'), where('status', '==', 'disputed'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDisputes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleResolve = async (matchId: string, winnerId: string) => {
    if (!window.confirm('Are you sure you want to resolve this match?')) return;
    setResolving(matchId);
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'verified',
        winner: winnerId,
        resolvedAt: Date.now()
      });
      alert('Dispute resolved!');
    } catch (e) {
      console.error(e);
      alert('Failed to resolve dispute');
    }
    setResolving(null);
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header" style={{ borderBottomColor: 'rgba(255, 68, 68, 0.2)' }}>
          <h3 style={{ color: '#ff4444' }}><AlertTriangle size={24} className="inline-block mr-2" /> ACTIVE DISPUTES ({disputes.length})</h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {disputes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              No active disputes requiring attention.
            </div>
          ) : (
            <div className="disputes-list">
              {disputes.map(d => (
                <div key={d.id} className="dispute-item row-updated" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#ff4444', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        MATCH ID: {d.id}
                      </div>
                      <div style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>
                        {d.playerA} <span style={{ color: '#888', margin: '0 8px' }}>vs</span> {d.playerB}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>Player A Evidence</div>
                          <img src={d.evidenceA || "https://placehold.co/400x225/222/555?text=No+Evidence"} alt="Evidence A" style={{ width: '200px', height: 'auto', borderRadius: '4px', cursor: 'pointer' }} onClick={() => window.open(d.evidenceA, '_blank')} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>Player B Evidence</div>
                          <img src={d.evidenceB || "https://placehold.co/400x225/222/555?text=No+Evidence"} alt="Evidence B" style={{ width: '200px', height: 'auto', borderRadius: '4px', cursor: 'pointer' }} onClick={() => window.open(d.evidenceB, '_blank')} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,68,68,0.2)', width: '250px' }}>
                      <h4 style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '14px' }}>Resolve Dispute</h4>
                      <button 
                        className="btn-admin-primary full-width" 
                        style={{ marginBottom: '10px' }}
                        onClick={() => handleResolve(d.id, d.playerA)}
                        disabled={resolving === d.id}
                      >
                        <CheckCircle2 size={16} className="inline-block mr-2" /> Award Win to Player A
                      </button>
                      <button 
                        className="btn-admin-primary full-width" 
                        style={{ marginBottom: '10px' }}
                        onClick={() => handleResolve(d.id, d.playerB)}
                        disabled={resolving === d.id}
                      >
                        <CheckCircle2 size={16} className="inline-block mr-2" /> Award Win to Player B
                      </button>
                      <button 
                        className="btn-admin-secondary full-width"
                        style={{ borderColor: '#ff4444', color: '#ff4444' }}
                        disabled={resolving === d.id}
                      >
                        <XCircle size={16} className="inline-block mr-2" /> Cancel Match (Refund)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
