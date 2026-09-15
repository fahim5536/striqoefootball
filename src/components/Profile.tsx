import { CoinIcon } from "./CoinIcon";
import { SEO } from './SEO';
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from '../firebase';
import { onAuthStateChanged } from '../firebase';
import { db, auth } from '../firebase';
import EditProfileModal from './EditProfileModal';
import { ProfileSkeleton } from './ui/Skeleton';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { 
  Trophy, Swords, History, Image as ImageIcon, Users, 
  Medal, Star, Crown, Handshake, Gem, Camera, Copy, 
  Gamepad2, Pencil, MessageSquare, BarChart2, Award, 
  Target, CheckCircle2, XCircle, MinusCircle, Check, Lock, Bird 
} from 'lucide-react';
import '../Profile.css';

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const viewingUid = queryParams.get('uid');

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [matchFilter, setMatchFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [globalRank, setGlobalRank] = useState<{ rank: number | string, points: number }>({ rank: '—', points: 0 });
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const isOwn = !viewingUid || viewingUid === user?.uid;
        const targetUid = isOwn ? user?.uid : viewingUid;
        
        setIsOwnProfile(isOwn);

        if (!targetUid) {
          navigate('/');
          return;
        }

        await loadProfileData(targetUid, isOwn);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [viewingUid, navigate]);

  const loadProfileData = async (uid: string, isOwn: boolean) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        setProfileData(null);
        return;
      }
      const data = userDoc.data();
      setProfileData(data);
      
      document.title = isOwn ? 'My Profile — Striqo' : `${data.username || data.name || 'Player'} — Striqo`;

      await loadGlobalRank(uid);
      await loadTournamentHistory(uid);
      await loadMatchHistory(uid);
      loadAchievementsData(data);

    } catch (error) {
      console.error('Error loading profile data', error);
    }
  };

  const loadGlobalRank = async (uid: string) => {
    try {
      const allSnap = await getDocs(query(collection(db, 'globalRankings'), orderBy('friendMatchPoints', 'desc')));
      let rank = 1;
      let userPoints = 0;
      
      allSnap.forEach(d => {
        if (d.id === uid) {
          userPoints = d.data().friendMatchPoints || 0;
        }
      });

      let exactRank = 1;
      allSnap.forEach(d => {
        if (d.id !== uid && (d.data().friendMatchPoints || 0) > userPoints) {
          exactRank++;
        }
      });

      setGlobalRank({ rank: exactRank, points: userPoints });
    } catch (err) {
      console.error('Rank load failed:', err);
    }
  };

  const loadTournamentHistory = async (uid: string) => {
    try {
      const snap = await getDocs(query(collection(db, 'tournaments'), orderBy('createdAt', 'desc')));
      const userTournaments = [];

      for (const tourDoc of snap.docs) {
        const participantDoc = await getDoc(doc(db, 'tournaments', tourDoc.id, 'participants', uid));
        if (participantDoc.exists()) {
          const lbDoc = await getDoc(doc(db, 'tournaments', tourDoc.id, 'leaderboard', uid));
          userTournaments.push({
            id: tourDoc.id,
            tournament: tourDoc.data(),
            participant: participantDoc.data(),
            lb: lbDoc.exists() ? lbDoc.data() : null
          });
        }
      }
      setTournaments(userTournaments);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMatchHistory = async (uid: string) => {
    try {
      const snap = await getDocs(query(collection(db, 'matches'), where('status', 'in', ['auto_verified', 'completed']), orderBy('completedAt', 'desc'), limit(30)));
      let loadedMatches: any[] = [];
      snap.forEach(d => {
        const m = d.data();
        if (m.playerA?.uid === uid || m.playerB?.uid === uid) {
          const isPlayerA = m.playerA?.uid === uid;
          const opponent = isPlayerA ? m.playerB : m.playerA;
          const myScore = isPlayerA ? m.scoreA : m.scoreB;
          const oppScore = isPlayerA ? m.scoreB : m.scoreA;
          
          let result = 'draw';
          if (m.winner?.uid === uid) result = 'win';
          else if (m.winner?.uid && m.winner.uid !== uid) result = 'loss';

          loadedMatches.push({
            id: d.id,
            ...m,
            opponent,
            myScore,
            oppScore,
            result,
            isPlayerA
          });
        }
      });
      setMatches(loadedMatches);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAchievementsData = (userData: any) => {
    const ts = userData.stats?.tournament || {};
    const fs = userData.stats?.friendMatch || {};
    const totalMatches = (ts.wins||0)+(ts.draws||0)+(ts.losses||0)+(fs.wins||0)+(fs.draws||0)+(fs.losses||0);
    const badges = userData.badges || [];

    setAchievements([
      { id: 'first_match', icon: <Swords size={20} className="inline" />, title: 'FIRST BLOOD', desc: 'Play your first match', unlocked: totalMatches >= 1 },
      { id: 'win_5', icon: <Medal size={20} className="inline" />, title: 'RISING STAR', desc: 'Win 5 matches total', unlocked: (ts.wins||0)+(fs.wins||0) >= 5 },
      { id: 'win_10', icon: '⭐', title: 'VETERAN', desc: 'Win 10 matches total', unlocked: (ts.wins||0)+(fs.wins||0) >= 10 },
      { id: 'win_25', icon: <Star size={20} className="inline" />, title: 'LEGEND', desc: 'Win 25 matches total', unlocked: (ts.wins||0)+(fs.wins||0) >= 25 },
      { id: 'tournament_win', icon: <Trophy size={20} className="inline" />, title: 'CHAMPION', desc: 'Win a tournament', unlocked: badges.length >= 1 },
      { id: 'tournament_3', icon: <Crown size={20} className="inline" />, title: 'DYNASTY', desc: 'Win 3 tournaments', unlocked: badges.length >= 3 },
      { id: 'friend_10', icon: <Handshake size={20} className="inline" />, title: 'SOCIAL BUTTERFLY', desc: 'Play 10 friend matches', unlocked: (fs.wins||0)+(fs.draws||0)+(fs.losses||0) >= 10 }
    ]);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '100vh', background: '#08081a' }}>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{ paddingTop: '72px', minHeight: '100vh', background: '#08081a' }}>
        <ErrorState fullPage title="Profile Not Found" message="The user you are looking for does not exist or has been removed." />
      </div>
    );
  }

  const ts = profileData.stats?.tournament || {};
  const fs = profileData.stats?.friendMatch || {};
  
  const tPlayed = (ts.wins||0) + (ts.draws||0) + (ts.losses||0);
  const tWinRate = tPlayed > 0 ? Math.round((ts.wins / tPlayed) * 100) : 0;
  
  const fPlayed = (fs.wins||0) + (fs.draws||0) + (fs.losses||0);
  const fWinRate = fPlayed > 0 ? Math.round((fs.wins / fPlayed) * 100) : 0;

  const totalMatches = tPlayed + fPlayed;
  const totalWins = (ts.wins||0) + (fs.wins||0);
  const overallWinRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  const badges = profileData.badges || [];

  let division = '<CoinIcon type="silver" /> BRONZE DIV';
  let divColor = '#cd7f32';
  if (globalRank.points >= 301) { division = 'DIAMOND DIV'; divColor = '#00e5ff'; }
  else if (globalRank.points >= 151) { division = 'GOLD DIV'; divColor = '#ffd700'; }
  else if (globalRank.points >= 51) { division = 'SILVER DIV'; divColor = '#c0c0c0'; }

  const filteredMatches = matches.filter(m => {
    if (matchFilter === 'win') return m.result === 'win';
    if (matchFilter === 'loss') return m.result === 'loss';
    if (matchFilter === 'draw') return m.result === 'draw';
    if (matchFilter === 'tournament') return m.tournamentId;
    if (matchFilter === 'friend') return !m.tournamentId;
    return true;
  });

  const getRankColor = (rank: number | string) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#00e5ff';
  };

  const renderBadgeSlots = () => {
    const slots = [];
    for (let i = 0; i < 5; i++) {
      if (badges[i]) {
        slots.push(
          <div key={i} className="badge-slot filled" title={badges[i].tournamentName || 'Tournament Champion'}><Trophy size={24} color="#ffd700" /></div>
        );
      } else {
        slots.push(
          <div key={i} className="badge-slot empty" title="Empty badge slot">○</div>
        );
      }
    }
    return slots;
  };

  return (
    <div className="profile-page" style={{ paddingTop: '72px' }}>
      <SEO 
        title={profileData ? `${profileData.username || 'Player'} | STRIQO Profile` : 'Player Profile | STRIQO'} 
        description={profileData ? `Check out ${profileData.username}'s esports profile, stats, and match history on STRIQO.` : 'Player Profile'}
        url={viewingUid ? `https://striqo.com/profile?uid=${viewingUid}` : 'https://striqo.com/profile'}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": profileData?.username || 'Player',
          "url": viewingUid ? `https://striqo.com/profile?uid=${viewingUid}` : 'https://striqo.com/profile'
        }}
      />
      {/* HERO SECTION */}
      <div className="profile-hero">
        <div className="profile-hero-bg" id="profileHeroBg"></div>
        <div className="container-max">
          <div className="profile-hero-inner">
            
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring">
                <img 
                  id="profileAvatar"
                  src={profileData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profileData.uid} 
                  alt="Avatar"
                  className="profile-avatar-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profileData.uid; }}
                />
              </div>
              <div className="profile-online-dot" id="profileOnlineDot"></div>
              {isOwnProfile && (
                <button className="change-avatar-btn" id="changeAvatarBtn" onClick={() => setIsEditing(true)}><Camera size={16} /></button>
              )}
            </div>

            <div className="profile-basic-info">
              <div className="profile-name-row">
                <h1 className="profile-name" id="profileName" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {profileData.username || profileData.name || 'Unknown'}
                  {profileData.isBetaUser && (
                    <span style={{ fontSize: '14px', padding: '2px 6px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BETA</span>
                  )}
                </h1>
                {profileData.discordUsername && (
                  <div style={{ marginLeft: '12px', color: '#5865F2', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', background: 'rgba(88,101,242,0.1)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                    {profileData.discordUsername}
                  </div>
                )}

                <div className="profile-badges-row" id="profileBadgesRow">
                  {renderBadgeSlots()}
                </div>
              </div>

              <div className="profile-division-row">
                <span className="division-badge" id="profileDivision" style={{ borderColor: divColor, color: divColor }}>
                  {division}
                </span>
                <span className="profile-join-date" id="profileJoinDate">
                  {profileData.createdAt ? `Joined ${profileData.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}
                </span>
              </div>

              <div className="profile-efootball-id">
                <span className="id-label"><Target size={16} className="inline-block mr-1" /> eFOOTBALL ID:</span>
                <span className="id-value" id="profileEfootballId">{profileData.efootballId || '—'}</span>
                {profileData.efootballId && (
                  <button className="copy-id-btn" onClick={() => navigator.clipboard.writeText(profileData.efootballId)}><Copy size={14} /></button>
                )}
              </div>

              {profileData.currentTeam && (
                <div className="profile-current-team" id="profileCurrentTeam">
                  <span className="team-label"><Users size={16} className="inline-block mr-1" /> CURRENT TEAM: </span>
                  <span className="team-value" id="profileTeamName">{profileData.currentTeam}</span>
                </div>
              )}

              <div className="profile-action-btns">
                {isOwnProfile ? (
                  <button className="btn-igx-outline" id="editProfileBtn" onClick={() => setIsEditing(true)}>
                    <Pencil size={14} className="inline-block mr-2" /> EDIT PROFILE
                  </button>
                ) : (
                  <>
                    <button className="btn-igx-outline" id="challengeBtn">
                      <Swords size={14} className="inline-block mr-2" /> CHALLENGE TO MATCH
                    </button>
                    <button className="btn-secondary-outline" id="messageBtn">
                      <MessageSquare size={14} className="inline-block mr-2" /> MESSAGE
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="profile-quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-value" id="qStatPoints">{globalRank.points}</div>
                <div className="quick-stat-label">GLOBAL PTS</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value cyan" id="qStatWinRate">{overallWinRate}%</div>
                <div className="quick-stat-label">WIN RATE</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value gold" id="qStatTrophies">{badges.length}</div>
                <div className="quick-stat-label">TROPHIES <Trophy size={16} className="inline-block ml-1" /></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="profile-tabs-bar">
        <div className="container-max">
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><BarChart2 size={16} className="inline-block mr-2" /> OVERVIEW</button>
            <button className={`profile-tab ${activeTab === 'tournament' ? 'active' : ''}`} onClick={() => setActiveTab('tournament')}><Trophy size={16} className="inline-block mr-2" /> TOURNAMENTS</button>
            <button className={`profile-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}><History size={16} className="inline-block mr-2" /> MATCH HISTORY</button>
            <button className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}><Award size={16} className="inline-block mr-2" /> ACHIEVEMENTS</button>
            {isOwnProfile && (
              <button className={`profile-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}><CoinIcon type="blue" /> INVENTORY</button>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="container-max profile-content">
        
        {activeTab === 'overview' && (
          <div className="tab-content active" id="tab-overview">
            <div className="overview-grid">
              
              <div className="overview-left">
                <div className="profile-card">
                  <div className="profile-card-title"><Gamepad2 size={16} className="inline-block mr-2" /> GAMEPLAY STYLE</div>
                  <div className="gameplay-image-wrap" id="gameplayImageWrap">
                    {profileData.gameplayStyleImageUrl ? (
                      <img id="gameplayStyleImg" src={profileData.gameplayStyleImageUrl} alt="Gameplay Style" className="gameplay-style-img" />
                    ) : (
                      <div className="gameplay-placeholder" id="gameplayPlaceholder">
                        <span><Gamepad2 size={24} /></span>
                        <p>No gameplay style uploaded</p>
                        {isOwnProfile && (
                          <button className="btn-upload-gameplay own-only" id="uploadGameplayBtn" onClick={() => setIsEditing(true)}>+ Upload Screenshot</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="profile-card own-only" id="coinBalanceCard">
                    <div className="profile-card-title"><CoinIcon type="blue" size={16} /> COIN BALANCE</div>
                    <div className="coin-balance-rows">
                      <div className="coin-row">
                        <div className="coin-icon blue-coin"><CoinIcon type="blue" size={24} /></div>
                        <div className="coin-info">
                          <div className="coin-name">BLUE COINS</div>
                          <div className="coin-sub">Tournaments & Prizes</div>
                        </div>
                        <div className="coin-amount blue" id="blueCoinsBalance">{profileData.blueCoins || 0}</div>
                      </div>
                      <div className="coin-divider"></div>
                      <div className="coin-row">
                        <div className="coin-icon silver-coin"><CoinIcon type="silver" size={24} /></div>
                        <div className="coin-info">
                          <div className="coin-name">SILVER COINS</div>
                          <div className="coin-sub">Friend Matches</div>
                        </div>
                        <div className="coin-amount silver" id="silverCoinsBalance">{profileData.silverCoins || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="profile-card">
                  <div className="profile-card-title-row">
                    <span className="profile-card-title"><MessageSquare size={16} className="inline-block mr-2" /> ABOUT</span>
                    {isOwnProfile && (
                      <button className="card-edit-btn own-only" id="editBioBtn" onClick={() => setIsEditing(true)}><Pencil size={14} /></button>
                    )}
                  </div>
                  <p className="profile-bio" id="profileBio">{profileData.bio || 'No bio yet.'}</p>
                </div>
              </div>

              <div className="overview-right">
                
                <div className="profile-card">
                  <div className="profile-card-title"><Trophy size={16} className="inline-block mr-2" /> TOURNAMENT STATS</div>
                  <div className="stats-grid-2">
                    <div className="stat-box">
                      <div className="stat-box-value" id="tourPlayed">{tPlayed}</div>
                      <div className="stat-box-label">PLAYED</div>
                    </div>
                    <div className="stat-box green">
                      <div className="stat-box-value green" id="tourWins">{ts.wins || 0}</div>
                      <div className="stat-box-label">WINS</div>
                    </div>
                    <div className="stat-box yellow">
                      <div className="stat-box-value yellow" id="tourDraws">{ts.draws || 0}</div>
                      <div className="stat-box-label">DRAWS</div>
                    </div>
                    <div className="stat-box red">
                      <div className="stat-box-value red" id="tourLosses">{ts.losses || 0}</div>
                      <div className="stat-box-label">LOSSES</div>
                    </div>
                  </div>
                  <div className="win-rate-bar-wrap">
                    <div className="win-rate-bar-label">
                      <span>WIN RATE</span>
                      <span className="win-rate-pct" id="tourWinRatePct">{tWinRate}%</span>
                    </div>
                    <div className="win-rate-bar-track">
                      <div className="win-rate-bar-fill" id="tourWinRateBar" style={{ width: `${tWinRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card-title"><Handshake size={16} className="inline-block mr-2" /> FRIEND MATCH STATS</div>
                  <div className="stats-grid-2">
                    <div className="stat-box">
                      <div className="stat-box-value" id="friendPlayed">{fPlayed}</div>
                      <div className="stat-box-label">PLAYED</div>
                    </div>
                    <div className="stat-box green">
                      <div className="stat-box-value green" id="friendWins">{fs.wins || 0}</div>
                      <div className="stat-box-label">WINS</div>
                    </div>
                    <div className="stat-box yellow">
                      <div className="stat-box-value yellow" id="friendDraws">{fs.draws || 0}</div>
                      <div className="stat-box-label">DRAWS</div>
                    </div>
                    <div className="stat-box red">
                      <div className="stat-box-value red" id="friendLosses">{fs.losses || 0}</div>
                      <div className="stat-box-label">LOSSES</div>
                    </div>
                  </div>
                  <div className="win-rate-bar-wrap">
                    <div className="win-rate-bar-label">
                      <span>WIN RATE</span>
                      <span className="win-rate-pct" id="friendWinRatePct">{fWinRate}%</span>
                    </div>
                    <div className="win-rate-bar-track">
                      <div className="win-rate-bar-fill silver-bar" id="friendWinRateBar" style={{ width: `${fWinRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card-title"><BarChart2 size={16} className="inline-block mr-2" /> GLOBAL RANKING</div>
                  <div className="global-rank-display">
                    <div className="global-rank-number" id="globalRankNumber" style={{ color: getRankColor(globalRank.rank) }}>
                      #{globalRank.rank}
                    </div>
                    <div className="global-rank-info">
                      <div className="global-rank-label">WORLD RANKING</div>
                      <div className="global-rank-points" id="globalRankPoints">{globalRank.points} pts</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'tournament' && (
          <div className="tab-content active" id="tab-tournament">
            <div className="profile-card">
              <div className="profile-card-title"><Trophy size={16} className="inline-block mr-2" /> TOURNAMENT HISTORY</div>
              <div className="tournament-history-list" id="tournamentHistoryList">
                {tournaments.length === 0 ? (
                  <div className="empty-state">
                    <span><Users size={20} /></span>
                    <p>No tournaments played yet</p>
                  </div>
                ) : (
                  tournaments.map((t, idx) => {
                    const isChampion = t.tournament?.champion?.uid === profileData.uid;
                    return (
                      <div key={idx} className="tour-history-item">
                        <div className="tour-hist-left">
                          <div className="tour-hist-name">
                            {isChampion ? <Trophy size={14} className="inline-block mr-1" color="#ffd700" />  : ''}{t.tournament?.name}
                          </div>
                          <div className="tour-hist-meta">
                            <span className="tour-hist-team">{t.participant?.teamSelected || '—'}</span>
                            <span className="tour-hist-date">{t.tournament?.createdAt?.toDate()?.toLocaleDateString() || ''}</span>
                          </div>
                        </div>
                        <div className="tour-hist-right">
                          {t.lb ? (
                            <>
                              <div className="tour-hist-record">
                                <span className="green-text">W:{t.lb.wins||0}</span>
                                <span className="yellow-text">D:{t.lb.draws||0}</span>
                                <span className="red-text">L:{t.lb.losses||0}</span>
                              </div>
                              <div className="tour-hist-pts">{t.lb.points || 0} pts</div>
                            </>
                          ) : '—'}
                          {isChampion && <div className="champion-tag"><Crown size={14} className="inline-block mr-1" /> CHAMPION</div>}
                          <span className={`tour-status-badge ${t.tournament?.status === 'ended' ? 'ended' : 'active'}`}>
                            {t.tournament?.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="tab-content active" id="tab-matches">
            <div className="match-history-filters">
              {['all', 'tournament', 'friend', 'win', 'loss', 'draw'].map((f) => (
                <button key={f} className={`mh-filter ${matchFilter === f ? 'active' : ''}`} onClick={() => setMatchFilter(f)}>
                  {f === 'win' ? <><CheckCircle2 size={14} className="inline-block mr-1" color="#22c55e" /> Win</> : f === 'loss' ? <><XCircle size={14} className="inline-block mr-1" color="#ff2d55" /> Loss</> : f === 'draw' ? <><MinusCircle size={14} className="inline-block mr-1" color="#eab308" /> Draw</> : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="match-history-list" id="matchHistoryList">
              {filteredMatches.length === 0 ? (
                <div className="empty-state">
                  <span><Swords size={20} /></span>
                  <p>No matches found</p>
                </div>
              ) : (
                filteredMatches.map(match => {
                  const resultConfig: any = {
                    win: { label: 'WIN', color: '#22c55e', icon: <CheckCircle2 size={18} /> },
                    loss: { label: 'LOSS', color: '#ff2d55', icon: <XCircle size={18} /> },
                    draw: { label: 'DRAW', color: '#eab308', icon: <Handshake size={20} className="inline" /> }
                  };
                  const rc = resultConfig[match.result] || resultConfig.draw;

                  return (
                    <div key={match.id} className={`match-history-card result-${match.result}`}>
                      <div className="mh-result-bar" style={{ background: rc.color }}></div>
                      <div className="mh-content">
                        <div className="mh-top-row">
                          <span className="mh-type-badge">{match.tournamentId ? <><Trophy size={14} className="inline-block mr-1"/> TOURNAMENT</> : <><Handshake size={14} className="inline-block mr-1"/> FRIENDLY</>}</span>
                          <span className="mh-date">{match.completedAt?.toDate()?.toLocaleDateString() || ''}</span>
                        </div>
                        <div className="mh-match-row">
                          <div className="mh-player-side you">
                            <div className="mh-player-name">YOU</div>
                            <div className="mh-score-big" style={{ color: rc.color }}>{match.myScore ?? '—'}</div>
                          </div>
                          <div className="mh-vs-center">
                            <div className="mh-result-badge" style={{ color: rc.color, borderColor: rc.color }}>
                              {rc.icon} {rc.label}
                            </div>
                          </div>
                          <div className="mh-player-side opp">
                            <div className="mh-score-big" style={{ color: '#E2E8F0' }}>{match.oppScore ?? '—'}</div>
                            <div className="mh-player-name">
                              <Link to={`/profile?uid=${match.opponent?.uid}`} className="opp-name-link">
                                {match.opponent?.username || match.opponent?.name || 'Unknown'}
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="mh-bottom-row">
                          {match.tournamentName && <span className="mh-tour-name">{match.tournamentName}</span>}
                          <span className="mh-match-code">#{match.uniqueCode || match.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="tab-content active" id="tab-achievements">
            <div className="profile-card">
              <div className="profile-card-title"><Trophy size={16} className="inline-block mr-2" /> TROPHY BADGES</div>
              <div className="profile-badges-row" style={{ gap: '12px' }}>
                {renderBadgeSlots()}
              </div>
            </div>
            
            <div className="profile-card" style={{ marginTop: '20px' }}>
              <div className="profile-card-title"><Award size={16} className="inline-block mr-2" /> ACHIEVEMENTS</div>
              <div className="achievements-grid" id="achievementsGrid">
                {achievements.map((ach, idx) => (
                  <div key={idx} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="ach-icon">{ach.icon}</div>
                    <div className="ach-title">{ach.title}</div>
                    <div className="ach-desc">{ach.desc}</div>
                    {!ach.unlocked ? <div className="ach-lock"><Lock size={24} color="#475569" /></div> : <div className="ach-check"><Check size={24} color="#22c55e" /></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && isOwnProfile && (
          <div className="tab-content active" id="tab-inventory">
            <div className="profile-card">
              <div className="profile-card-title-row">
                <span className="profile-card-title"><ImageIcon size={16} className="inline-block mr-2" /> AVATAR COLLECTION</span>
                <span className="blue-coin-balance-mini" style={{ color: '#00e5ff', fontSize: '14px', fontWeight: 'bold' }}>
                  <CoinIcon type="blue" /> <span id="shopBlueCoinBalance">{profileData.blueCoins || 0}</span>
                </span>
              </div>
              <div className="avatar-shop-grid" id="avatarShopGrid">
                {/* Simulated Shop List */}
                {[
                  { id: 'av1', emoji: <Target size={24} />, name: 'Football', cost: 0, isPremium: false },
                  { id: 'av9', emoji: <Bird size={24} />, name: 'Eagle', cost: 50, isPremium: true }
                ].map(av => {
                  const unlockedAvatars = profileData.unlockedAvatars || [];
                  const isUnlocked = !av.isPremium || unlockedAvatars.includes(av.id);
                  const canAfford = (profileData.blueCoins || 0) >= av.cost;
                  return (
                    <div key={av.id} className={`avatar-shop-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      <div className="av-emoji">{av.emoji}</div>
                      <div className="av-name">{av.name}</div>
                      {av.isPremium && !isUnlocked ? (
                        <button className={`av-buy-btn ${!canAfford ? 'cant-afford' : ''}`} disabled={!canAfford}>
                          <CoinIcon type="blue" /> {av.cost}
                        </button>
                      ) : av.isPremium ? (
                        <div className="av-owned"><Check size={14} className="inline-block mr-1" /> OWNED</div>
                      ) : (
                        <div className="av-free">FREE</div>
                      )}
                      <button className="av-select-btn" disabled={!isUnlocked}>USE</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      <EditProfileModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
        user={profileData}
        onSuccess={(updatedUser) => {
          setProfileData(updatedUser);
          setIsEditing(false);
        }}
      />
    </div>
  );
}
