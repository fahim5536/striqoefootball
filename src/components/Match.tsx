import React, { useState, useEffect } from "react";
import { User, Upload, Check, AlertCircle, Camera, Search, Users, ShieldAlert, Trophy } from "lucide-react";
import { onAuthStateChanged, auth } from "../firebase";
import { motion, AnimatePresence } from "motion/react";

type MatchState = 
  | 'select' 
  | 'friend_confirm'
  | 'finding' 
  | 'team_select' 
  | 'active' 
  | 'verification' 
  | 'summary' 
  | 'conflict';

export default function Match() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [matchState, setMatchState] = useState<MatchState>('select');
  const [matchMode, setMatchMode] = useState<'friend' | 'random' | null>(null);
  const [friendUiId, setFriendUiId] = useState('');
  
  const [opponent, setOpponent] = useState<any>(null);
  const [timer, setTimer] = useState(5400); // 90 min in seconds

  const [teamMe, setTeamMe] = useState('');
  const [teamOpponent, setTeamOpponent] = useState('');
  
  const [p1Screenshot, setP1Screenshot] = useState<File | null>(null);
  const [p2Screenshot, setP2Screenshot] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [simulateConflict, setSimulateConflict] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: any) => {
      // In a real app, you would fetch from DB, but we assume uiId exists from the auth flow
      setCurrentUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFriendSearch = () => {
    if (!currentUser) return alert("Please log in to play a match.");
    if (friendUiId.length !== 4) return alert("Please enter a valid 4-digit ID.");
    if (currentUser.uiId === friendUiId) return alert("You cannot match with yourself.");
    
    setMatchMode('friend');
    // Simulate finding opponent profile
    setOpponent({
      uiId: friendUiId,
      username: 'Player_' + friendUiId,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendUiId}`
    });
    setMatchState('friend_confirm');
  };

  const handleStartSearch = (mode: 'friend' | 'random') => {
    if (!currentUser) return alert("Please log in to play a match.");
    setMatchMode(mode);
    setMatchState('finding');

    if (mode === 'random') {
      // Simulate random opponent
      setTimeout(() => {
        const randId = Math.floor(1000 + Math.random() * 9000).toString();
        setOpponent({
          uiId: randId,
          username: 'Challenger_' + randId,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randId}`
        });
        setMatchState('team_select');
      }, 3000);
    } else {
      // Friend request accept simulation
      setTimeout(() => {
        setMatchState('team_select');
      }, 2500);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchState === 'active') {
      interval = setInterval(() => {
        setTimer(prev => prev > 0 ? prev - 60 : 0); // Fast mock timer
      }, 1000); 
    }
    return () => clearInterval(interval);
  }, [matchState]);

  const submitMatchResult = async () => {
    if (!p1Screenshot || !p2Screenshot) return;
    
    setVerifying(true);
    // Simulate AI OCR verification delay
    setTimeout(() => {
      setVerifying(false);
      if (simulateConflict) {
        setMatchState('conflict');
      } else {
        setMatchState('summary');
      }
    }, 2500);
  };

  const resetMatch = () => {
    setMatchState('select');
    setMatchMode(null);
    setFriendUiId('');
    setOpponent(null);
    setTeamMe('');
    setTeamOpponent('');
    setP1Screenshot(null);
    setP2Screenshot(null);
    setTimer(5400);
  };

  return (
    <div className="pt-[72px]">
      <section className="bg-[#08081a] px-4 py-10 min-h-[calc(100vh-72px)] flex flex-col items-center justify-center">
        
        <div className="text-center mb-10 mt-5">
          <h1 className="hero-heading text-[clamp(32px,5vw,56px)]">FRIENDLY MATCH</h1>
          <div className="section-subtitle mt-2">
            {!currentUser ? "LOGIN REQUIRED" : (
              <>
                {matchState === 'select' && "CHOOSE YOUR MATCHMAKING MODE"}
                {matchState === 'friend_confirm' && "CONFIRM OPPONENT"}
                {matchState === 'finding' && (matchMode === 'friend' ? "WAITING FOR OPPONENT TO ACCEPT..." : "SEARCHING FOR OPPONENT...")}
                {matchState === 'team_select' && "TEAM SELECTION"}
                {matchState === 'active' && `LIVE MATCH - ${Math.floor((5400 - timer) / 60)}'`}
                {matchState === 'verification' && "MATCH RESULT VERIFICATION"}
                {matchState === 'summary' && "VERIFICATION COMPLETE"}
                {matchState === 'conflict' && "VERIFICATION REQUIRED"}
              </>
            )}
          </div>
        </div>

        {authLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-transparent border-t-[#00e5ff] rounded-full animate-spin"></div>
          </div>
        ) : !currentUser ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a1f] border border-[#00e5ff]/30 rounded-2xl p-10 max-w-md w-full text-center flex flex-col items-center shadow-[0_0_30px_rgba(0,229,255,0.1)]"
          >
            <div className="w-20 h-20 bg-[#00e5ff]/10 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert size={40} className="text-[#00e5ff]" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-4 uppercase tracking-wide">Access Restricted</h2>
            <p className="text-[#94a3b8] mb-8 leading-relaxed">
              You must be logged in to participate in friendly matches, earn stats, and climb the leaderboard.
            </p>
            <button 
              className="btn-igx w-full"
              onClick={() => window.dispatchEvent(new Event('openLoginModal'))}
            >
              LOGIN TO PLAY
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
          {matchState === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl"
            >
              {/* Friend Match Card */}
              <div className="bg-[#0a0a1f] border border-[#00e5ff]/20 rounded-2xl p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#00e5ff]/10 flex items-center justify-center mb-6">
                  <Users size={32} className="text-[#00e5ff]" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">PLAY WITH FRIEND</h3>
                <p className="text-[#94a3b8] text-sm mb-6 leading-relaxed">Enter your friend's 4-digit UI ID to play a private match against them.</p>
                
                <div className="w-full mb-6">
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="e.g. 1234" 
                    value={friendUiId}
                    onChange={(e) => setFriendUiId(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-[#00e5ff]/30 rounded-xl px-4 py-3 text-white text-xl text-center tracking-[0.5em] outline-none focus:border-[#00e5ff]"
                  />
                </div>
                
                <button 
                  className="btn-igx w-full" 
                  onClick={handleFriendSearch}
                  disabled={friendUiId.length !== 4}
                >
                  SEARCH OPPONENT
                </button>
              </div>

              {/* Random Match Card */}
              <div className="bg-[#0a0a1f] border border-[#7c3aed]/20 rounded-2xl p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mb-6">
                  <Search size={32} className="text-[#7c3aed]" />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">RANDOM MATCH</h3>
                <p className="text-[#94a3b8] text-sm mb-6 leading-relaxed">Find a random opponent based on your game stats and current division.</p>
                
                <div className="flex-1"></div>
                
                <button 
                  className="btn-igx w-full" 
                  style={{ background: 'linear-gradient(45deg, #7c3aed, #4f46e5)' }}
                  onClick={() => handleStartSearch('random')}
                >
                  FIND OPPONENT
                </button>
              </div>
            </motion.div>
          )}

          {matchState === 'friend_confirm' && opponent && (
            <motion.div 
              key="friend_confirm"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a1f] border border-[#00e5ff]/20 rounded-2xl p-8 w-full max-w-md text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#00e5ff]/50 mb-4 bg-[#00e5ff]/10">
                <img src={opponent.avatarUrl} alt="Opponent" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-extrabold text-white uppercase">{opponent.username}</h3>
              <p className="text-[#00e5ff] font-bold mt-1 mb-8">#{opponent.uiId}</p>
              
              <div className="flex gap-4 w-full">
                <button className="btn-igx-outline flex-1" onClick={() => setMatchState('select')}>CANCEL</button>
                <button className="btn-igx flex-1" onClick={() => handleStartSearch('friend')}>SEND REQUEST</button>
              </div>
            </motion.div>
          )}

          {matchState === 'finding' && (
            <motion.div 
              key="finding"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16"
            >
              <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-[#00e5ff] border-r-[#7c3aed] animate-spin mb-6" />
              <h3 className="text-xl text-white font-semibold">
                {matchMode === 'friend' ? `Waiting for ${opponent?.username} to accept...` : 'Searching for active STRIQO user...'}
              </h3>
            </motion.div>
          )}

          {matchState === 'team_select' && (
            <motion.div 
              key="team_select"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl"
            >
              {/* Player headers */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-[#0a0a1f] border border-white/10 rounded-2xl p-6 mb-8 gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 overflow-hidden shrink-0">
                    {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-[#00e5ff]" />}
                  </div>
                  <div>
                    <div className="text-[#00e5ff] text-xs font-bold mb-1">PLAYER 1 (YOU)</div>
                    <div className="text-white font-bold text-lg uppercase">{currentUser?.username || 'Player'} <span className="text-white/50 text-sm">#{currentUser?.uiId || '----'}</span></div>
                  </div>
                </div>

                <div className="font-orbitron font-black text-2xl text-[#7c3aed] opacity-50 shrink-0">VS</div>

                <div className="flex items-center gap-4 w-full md:w-auto md:flex-row-reverse text-left md:text-right">
                  <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 overflow-hidden shrink-0">
                    <img src={opponent?.avatarUrl} alt="Opponent" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[#7c3aed] text-xs font-bold mb-1">PLAYER 2</div>
                    <div className="text-white font-bold text-lg uppercase">{opponent?.username} <span className="text-white/50 text-sm">#{opponent?.uiId}</span></div>
                  </div>
                </div>
              </div>

              <h2 className="text-center text-xl font-bold text-white mb-6">ENTER EFOOTBALL TEAMS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#0a0a1f] border border-[#00e5ff]/30 rounded-xl p-6">
                  <label className="block text-[#00e5ff] text-xs font-bold mb-3 tracking-wider">YOUR TEAM</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Real Madrid, FC Barcelona" 
                    value={teamMe}
                    onChange={(e) => setTeamMe(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>
                <div className="bg-[#0a0a1f] border border-[#7c3aed]/30 rounded-xl p-6">
                  <label className="block text-[#7c3aed] text-xs font-bold mb-3 tracking-wider">OPPONENT'S TEAM</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Manchester City, Bayern Munich" 
                    value={teamOpponent}
                    onChange={(e) => setTeamOpponent(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#7c3aed]"
                  />
                  <p className="text-xs text-white/40 mt-2 italic">* For testing, enter opponent's team manually</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  className="btn-igx w-full max-w-sm" 
                  disabled={!teamMe || !teamOpponent}
                  style={{ opacity: (!teamMe || !teamOpponent) ? 0.5 : 1 }}
                  onClick={() => setMatchState('active')}
                >
                  START MATCH
                </button>
              </div>
            </motion.div>
          )}

          {matchState === 'active' && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center bg-[#0a0a1f] border border-white/10 p-8 md:p-12 relative rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00e5ff] rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#7c3aed] rounded-br-2xl" />

                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 bg-[#00e5ff]/10 border-2 border-[#00e5ff]/40 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                    {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="Me" className="w-full h-full object-cover" /> : <User size={40} className="text-[#00e5ff]" />}
                  </div>
                  <div className="font-inter font-extrabold text-2xl text-white uppercase truncate w-full px-2">
                    {currentUser?.username || 'YOU (P1)'}
                  </div>
                  <div className="text-[#00e5ff] font-semibold text-sm mt-1">#{currentUser?.uiId || '----'}</div>
                  <div className="mt-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-white/80 text-sm font-medium truncate max-w-[200px]">
                    {teamMe}
                  </div>
                </div>

                <div className="font-orbitron font-black text-5xl text-[#7c3aed] drop-shadow-[0_0_20px_rgba(124,58,237,0.4)] text-center py-6 md:py-0">
                  VS
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-28 h-28 bg-[#7c3aed]/10 border-2 border-[#7c3aed]/60 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                     {opponent?.avatarUrl ? <img src={opponent.avatarUrl} alt="Opponent" className="w-full h-full object-cover" /> : <User size={40} className="text-[#7c3aed]" />}
                  </div>
                  <div className="font-inter font-extrabold text-2xl text-white uppercase truncate w-full px-2">
                    {opponent?.username}
                  </div>
                  <div className="text-[#7c3aed] font-semibold text-sm mt-1">#{opponent?.uiId}</div>
                  <div className="mt-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-white/80 text-sm font-medium truncate max-w-[200px]">
                    {teamOpponent}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-12">
                <button className="btn-igx w-full max-w-sm" onClick={() => setMatchState('verification')}>
                  FINISH MATCH
                </button>
              </div>
            </motion.div>
          )}

          {matchState === 'verification' && (
            <motion.div 
              key="verification"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a1f] border border-white/10 rounded-2xl p-6 md:p-10 w-full max-w-4xl"
            >
              <h2 className="text-2xl font-extrabold text-white mb-2 text-center uppercase tracking-wide">Match Result Verification</h2>
              <p className="text-[#94a3b8] text-sm mb-10 text-center max-w-xl mx-auto leading-relaxed">
                Both players must upload a screenshot of the final score screen to verify the result. The match will not conclude until both images are validated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Player 1 Screenshot */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[#00e5ff] text-xs font-bold tracking-wider">PLAYER 1 SCREENSHOT</label>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${p1Screenshot ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-white/10 text-white/50'}`}>
                      {p1Screenshot ? 'UPLOADED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="relative w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors overflow-hidden group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => e.target.files && setP1Screenshot(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {p1Screenshot ? (
                      <div className="text-[#00e5ff] flex flex-col items-center">
                        <Check size={28} className="mb-2" />
                        <span className="text-sm font-semibold truncate max-w-[200px]">{p1Screenshot.name}</span>
                      </div>
                    ) : (
                      <div className="text-[#94a3b8] flex flex-col items-center group-hover:text-white transition-colors">
                        <Upload size={28} className="mb-2" />
                        <span className="text-sm font-medium">Upload Result Screenshot</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player 2 Screenshot */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[#7c3aed] text-xs font-bold tracking-wider">PLAYER 2 SCREENSHOT</label>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${p2Screenshot ? 'bg-[#7c3aed]/20 text-[#7c3aed]' : 'bg-white/10 text-white/50'}`}>
                      {p2Screenshot ? 'UPLOADED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="relative w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors overflow-hidden group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => e.target.files && setP2Screenshot(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {p2Screenshot ? (
                      <div className="text-[#7c3aed] flex flex-col items-center">
                        <Check size={28} className="mb-2" />
                        <span className="text-sm font-semibold truncate max-w-[200px]">{p2Screenshot.name}</span>
                      </div>
                    ) : (
                      <div className="text-[#94a3b8] flex flex-col items-center group-hover:text-white transition-colors">
                        <Camera size={28} className="mb-2" />
                        <span className="text-sm font-medium text-center">Opponent Screenshot<br/><span className="text-xs text-white/30 italic">(Upload here for testing)</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mb-6 gap-2">
                <input 
                  type="checkbox" 
                  id="simulateConflict" 
                  checked={simulateConflict} 
                  onChange={(e) => setSimulateConflict(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-[#00e5ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="simulateConflict" className="text-xs text-white/50 cursor-pointer select-none">
                  Simulate Conflicting Results (Debug)
                </label>
              </div>

              <button 
                className="btn-igx w-full flex justify-center items-center gap-3" 
                style={{ opacity: (!p1Screenshot || !p2Screenshot || verifying) ? 0.5 : 1 }}
                onClick={submitMatchResult}
                disabled={!p1Screenshot || !p2Screenshot || verifying}
              >
                {verifying ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> VERIFYING...</>
                ) : (
                  'FINISH MATCH'
                )}
              </button>
            </motion.div>
          )}

          {matchState === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a0a1f] border border-[#00e5ff]/30 rounded-2xl p-8 w-full max-w-2xl text-center shadow-[0_0_30px_rgba(0,229,255,0.15)]"
            >
              <div className="w-20 h-20 bg-[#00e5ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-[#00e5ff]" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-8 uppercase tracking-wide">MATCH VERIFIED</h2>
              
              <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10 text-left">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div>
                    <div className="text-sm text-white/50 mb-1">PLAYER 1</div>
                    <div className="font-bold text-white uppercase">{currentUser?.username || 'YOU'}</div>
                    <div className="text-xs text-[#00e5ff] mt-1">{teamMe}</div>
                  </div>
                  <div className="text-4xl font-black text-white">3</div>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div>
                    <div className="text-sm text-white/50 mb-1">PLAYER 2</div>
                    <div className="font-bold text-white uppercase">{opponent?.username}</div>
                    <div className="text-xs text-[#7c3aed] mt-1">{teamOpponent}</div>
                  </div>
                  <div className="text-4xl font-black text-white/50">1</div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <div className="text-[10px] font-bold text-[#00e5ff] tracking-wider mb-1">DETECTED WINNER</div>
                    <div className="font-bold text-white uppercase">{currentUser?.username || 'YOU'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-red-400 tracking-wider mb-1">DETECTED LOSER</div>
                    <div className="font-bold text-white/70 uppercase">{opponent?.username}</div>
                  </div>
                </div>
              </div>

              <button className="btn-igx w-full" onClick={resetMatch}>RETURN TO MATCHMAKING</button>
            </motion.div>
          )}

          {matchState === 'conflict' && (
            <motion.div 
              key="conflict"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a0a1f] border border-red-500/30 rounded-2xl p-8 w-full max-w-xl text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-4 uppercase tracking-wide">RESULT VERIFICATION REQUIRED</h2>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                The screenshots provided by both players show conflicting match results. An administrator will review the evidence manually.
              </p>
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-8 text-left text-sm text-red-200">
                <p className="mb-2">• Ensure screenshots are clear and uncropped.</p>
                <p>• Submitting false results may lead to an account ban.</p>
              </div>

              <button className="btn-igx-outline w-full text-white border-white/20 hover:bg-white/5" onClick={resetMatch}>
                RETURN TO MATCHMAKING
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </section>
    </div>
  );
}

