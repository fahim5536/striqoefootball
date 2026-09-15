const fs = require('fs');
const content = `import React, { useState, useEffect } from "react";
import { User, Upload, Check, AlertCircle, Camera, Search, Users } from "lucide-react";
import { socket } from "../lib/api";
import { onAuthStateChanged, auth, getDownloadURL, ref, uploadBytesResumable, storage, addDoc, collection, db } from "../firebase";

export default function Match() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // MATCH STATES: 'select' -> 'finding' -> 'active' -> 'finish' -> 'submitted'
  const [matchState, setMatchState] = useState<'select' | 'finding' | 'active' | 'finish' | 'submitted'>('select');
  const [matchMode, setMatchMode] = useState<'friend' | 'random' | null>(null);
  const [friendUiId, setFriendUiId] = useState('');
  
  const [opponent, setOpponent] = useState<any>(null);
  const [timer, setTimer] = useState(5400); // 90 min

  // Finish match states
  const [teamMe, setTeamMe] = useState('');
  const [teamOpponent, setTeamOpponent] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  const handleStartSearch = (mode: 'friend' | 'random') => {
    if (!currentUser) return alert("Please log in to play a match.");
    if (mode === 'friend' && friendUiId.length !== 4) return alert("Please enter a valid 4-digit ID.");
    
    setMatchMode(mode);
    setMatchState('finding');

    // Simulate finding an opponent (normally done via websockets)
    setTimeout(() => {
      setOpponent({
        uiId: mode === 'friend' ? friendUiId : Math.floor(1000 + Math.random() * 9000).toString(),
        username: mode === 'friend' ? 'Rival_' + friendUiId : 'RandomChallenger',
        avatarUrl: \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${Math.random()}\`
      });
      setMatchState('active');
    }, 3000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchState === 'active') {
      interval = setInterval(() => {
        setTimer(prev => prev > 0 ? prev - 60 : 0);
      }, 1000); // Fast mock timer
    }
    return () => clearInterval(interval);
  }, [matchState]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const submitMatchResult = async () => {
    if (!teamMe || !teamOpponent || !screenshot) return alert("Please fill all details and upload a screenshot of the final score.");
    setUploading(true);

    try {
      // Record match (mocked upload for demo)
      await new Promise(r => setTimeout(r, 1500));
      const url = "https://placehold.co/600x400/0a0a1f/00e5ff?text=Match+Result"; 

      await addDoc(collection(db, 'matches'), {
        playerA: { uid: currentUser?.id || currentUser?.uid, username: currentUser?.username, team: teamMe },
        playerB: { uid: opponent.uiId, username: opponent.username, team: teamOpponent },
        status: 'pending_verification',
        screenshot: url,
        mode: matchMode,
        createdAt: new Date().toISOString()
      });

      setMatchState('submitted');
    } catch (err) {
      console.error(err);
      alert("Failed to submit result");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ paddingTop: '72px' }}>
      <section style={{ background: '#08081a', padding: "40px 20px", minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
          <h1 className="hero-heading" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>FRIENDLY MATCH</h1>
          <div className="section-subtitle" style={{ marginTop: '10px' }}>
            {matchState === 'select' && "CHOOSE YOUR MATCHMAKING MODE"}
            {matchState === 'finding' && (matchMode === 'friend' ? "CONNECTING TO FRIEND..." : "SEARCHING FOR OPPONENT...")}
            {matchState === 'active' && \`LIVE MATCH - \${Math.floor((5400 - timer) / 60)}'\`}
            {matchState === 'finish' && "SUBMIT MATCH RESULT"}
            {matchState === 'submitted' && "RESULT SUBMITTED"}
          </div>
        </div>

        {matchState === 'select' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', width: '100%', maxWidth: '800px' }}>
            {/* Friend Match Card */}
            <div style={{ background: '#0a0a1f', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users size={30} color="#00e5ff" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>PLAY WITH FRIEND</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>Enter your friend's 4-digit UI ID to play a private match against them.</p>
              
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="e.g. 1234" 
                  value={friendUiId}
                  onChange={(e) => setFriendUiId(e.target.value.replace(/\\D/g, ''))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '20px', textAlign: 'center', letterSpacing: '4px', outline: 'none' }}
                />
              </div>
              
              <button 
                className="btn-igx" 
                style={{ width: '100%' }}
                onClick={() => handleStartSearch('friend')}
                disabled={friendUiId.length !== 4}
              >
                CONNECT
              </button>
            </div>

            {/* Random Match Card */}
            <div style={{ background: '#0a0a1f', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Search size={30} color="#7c3aed" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>RANDOM MATCH</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>Find a random opponent based on your game stats and current division.</p>
              
              <div style={{ flex: 1 }}></div>
              
              <button 
                className="btn-igx" 
                style={{ width: '100%', background: 'linear-gradient(45deg, #7c3aed, #4f46e5)' }}
                onClick={() => handleStartSearch('random')}
              >
                FIND OPPONENT
              </button>
            </div>
          </div>
        )}

        {matchState === 'finding' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ marginTop: '20px', fontSize: '20px', color: '#fff' }}>{matchMode === 'friend' ? 'Waiting for friend to connect...' : 'Searching for random opponent...'}</h3>
          </div>
        )}

        {matchState === 'active' && (
          <div style={{ width: '100%', maxWidth: '1000px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '40px', alignItems: 'center', background: '#0a0a1f', border: '1px solid rgba(255,255,255,0.06)', padding: '60px', position: 'relative', borderRadius: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', background: 'rgba(0,229,255,0.1)', border: '2px solid rgba(0,229,255,0.4)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', color: '#ffffff' }}>
                  YOU (P1)
                </div>
                <div style={{ color: '#00e5ff', fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '15px', marginTop: '8px' }}>
                  {currentUser?.uiId ? \`#\${currentUser.uiId}\` : '---'}
                </div>
              </div>

              <div style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 900, fontSize: '48px', color: '#7c3aed', textShadow: '0 0 20px rgba(124,58,237,0.4)', textAlign: 'center' }}>
                VS
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', background: 'rgba(124,58,237,0.1)', border: '2px solid rgba(124,58,237,0.6)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                   {opponent?.avatarUrl ? <img src={opponent.avatarUrl} alt="Opponent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                </div>
                <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', color: '#ffffff' }}>
                  {opponent?.username}
                </div>
                <div style={{ color: '#7c3aed', fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '15px', marginTop: '8px' }}>
                  #{opponent?.uiId}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
              <button className="btn-igx" onClick={() => setMatchState('finish')}>
                FINISH MATCH
              </button>
            </div>
          </div>
        )}

        {matchState === 'finish' && (
          <div style={{ background: '#0a0a1f', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '20px', textAlign: 'center' }}>MATCH COMPLETED</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
              Please enter the teams both players used in eFootball and upload a screenshot of the final score screen to verify the result.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', color: '#00e5ff', fontSize: '12px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>YOUR TEAM (YOU)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Real Madrid, FC Barcelona" 
                  value={teamMe}
                  onChange={(e) => setTeamMe(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#7c3aed', fontSize: '12px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>OPPONENT TEAM ({opponent?.username})</label>
                <input 
                  type="text" 
                  placeholder="e.g. Manchester City, Bayern Munich" 
                  value={teamOpponent}
                  onChange={(e) => setTeamOpponent(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 16px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>RESULT SCREENSHOT</label>
                <div style={{ position: 'relative', width: '100%', height: '120px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', overflow: 'hidden' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleScreenshotChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                  />
                  {screenshot ? (
                    <div style={{ color: '#00e5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Check size={30} style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{screenshot.name}</span>
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                      <Camera size={30} style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>Click to upload screenshot</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              className="btn-igx" 
              style={{ width: '100%', opacity: (!teamMe || !teamOpponent || !screenshot || uploading) ? 0.5 : 1 }}
              onClick={submitMatchResult}
              disabled={!teamMe || !teamOpponent || !screenshot || uploading}
            >
              {uploading ? 'UPLOADING...' : 'SUBMIT RESULT'}
            </button>
          </div>
        )}

        {matchState === 'submitted' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', background: 'rgba(0,229,255,0.1)', border: '1px solid #00e5ff', borderRadius: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Check size={30} color="#0a0a1f" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>RESULT PENDING VERIFICATION</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px', textAlign: 'center', maxWidth: '400px' }}>
              Your match result has been submitted. Our AI and admin team will verify the screenshot shortly.
            </p>
            <button className="btn-igx-outline" onClick={() => { setMatchState('select'); setScreenshot(null); setTeamMe(''); setTeamOpponent(''); }}>
              BACK TO MATCHMAKING
            </button>
          </div>
        )}

      </section>
      
      <style>{\`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      \`}</style>
    </div>
  );
}
`;

fs.writeFileSync('src/components/Match.tsx', content);
console.log('Match patched');
