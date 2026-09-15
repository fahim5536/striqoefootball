import { Unlock, Lock, EyeOff, Eye, XCircle, AlertTriangle, Crown, BarChart2, Trophy, Swords, GitBranch, Users, Ban, Newspaper, Image as ImageIcon, Handshake, Bell, Settings, ClipboardList, Flag, Sliders, MessageSquare, FlaskConical, LogOut } from 'lucide-react';
import { CoinIcon } from "./CoinIcon";
import AdminNewsManager from "./AdminNewsManager";
import AdminPartners from "./AdminPartners";
import React, { useState, useEffect, useRef } from 'react';
import { getDoc, doc, collection, query, where, onSnapshot } from '../firebase';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from "./AdminDashboard";
import AdminTournaments from "./AdminTournaments";
import AdminMatches from "./AdminMatches";
import AdminDisputes from "./AdminDisputes";
import AdminPlayers from "./AdminPlayers";
import AdminCoins from "./AdminCoins";
import AdminNotifications from "./AdminNotifications";

import AdminSettings from "./AdminSettings";
import AdminSOC from "./AdminSOC";
import AdminMetrics from "./AdminMetrics";
import AdminBackups from "./AdminBackups";

import AdminLogs from "./AdminLogs";
import AdminBracket from "./AdminBracket";
import AdminBans from "./AdminBans";
import AdminGallery from "./AdminGallery";

const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // admin
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 1000;

const SESSION_KEY = btoa('_striqo_admin_auth_');
const ATTEMPT_KEY = btoa('_striqo_admin_attempts_');
const LOCKOUT_KEY = btoa('_striqo_admin_lockout_');

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

import AdminFeatureFlags from './AdminFeatureFlags';
import AdminRemoteConfig from './AdminRemoteConfig';
import AdminFeedback from './AdminFeedback';
import AdminExperiments from './AdminExperiments';
import AdminBetaManagement from './AdminBetaManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminReports from './AdminReports';

export default function Admin() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gateError, setGateError] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [verifying, setVerifying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState({
    tournaments: 0,
    matches: 0,
    disputes: 0,
    players: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubs: any[] = [];

    // Active Tournaments
    unsubs.push(onSnapshot(query(collection(db, 'tournaments'), where('status', '==', 'active')), (snap) => {
      setStats(s => ({ ...s, tournaments: snap.size }));
    }));

    // Pending Matches
    unsubs.push(onSnapshot(query(collection(db, 'matches'), where('status', '==', 'pending')), (snap) => {
      setStats(s => ({ ...s, matches: snap.size }));
    }));

    // Disputed Matches
    unsubs.push(onSnapshot(query(collection(db, 'matches'), where('status', '==', 'disputed')), (snap) => {
      setStats(s => ({ ...s, disputes: snap.size }));
    }));

    // Players
    unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
      setStats(s => ({ ...s, players: snap.size }));
    }));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [isAuthenticated]);

  useEffect(() => {
    checkSession();
    
    // Anti-Tamper Security
    const handleContextMenu = (e: MouseEvent) => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        e.preventDefault();
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearSession();
    };
  }, []);

  useEffect(() => {
    let lockoutInterval: any;
    if (lockoutRemaining > 0) {
      lockoutInterval = setInterval(() => {
        setLockoutRemaining(prev => {
          if (prev <= 1) {
            sessionStorage.removeItem(LOCKOUT_KEY);
            sessionStorage.removeItem(ATTEMPT_KEY);
            setAttemptsLeft(MAX_ATTEMPTS);
            setGateError(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(lockoutInterval);
  }, [lockoutRemaining]);

  const checkSession = async () => {
    try {
      const token = sessionStorage.getItem(SESSION_KEY);
      
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        checkLockout();
        return;
      }
      
      if (token !== btoa(ADMIN_PASSWORD_HASH.slice(0,16))) {
        clearSession();
        return;
      }

      // Verify Firebase Admin
      const user = auth.currentUser;
      if (!user) {
        clearSession();
        return;
      }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists() || !snap.data().isAdmin) {
        clearSession();
        return;
      }
      
      setIsAuthenticated(true);
    } catch {
      clearSession();
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const checkLockout = () => {
    const lockoutTime = sessionStorage.getItem(LOCKOUT_KEY);
    if (lockoutTime) {
      const elapsed = Date.now() - parseInt(lockoutTime);
      if (elapsed < LOCKOUT_DURATION) {
        setLockoutRemaining(Math.ceil((LOCKOUT_DURATION - elapsed) / 1000));
      } else {
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.removeItem(ATTEMPT_KEY);
      }
    }
    const attempts = parseInt(sessionStorage.getItem(ATTEMPT_KEY) || '0');
    setAttemptsLeft(MAX_ATTEMPTS - attempts);
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  const adminLogout = () => {
    clearSession();
    navigate('/');
  };

  const verifyPassword = async () => {
    if (lockoutRemaining > 0 || !passwordInput.trim()) return;

    setVerifying(true);
    try {
      const hash = await sha256(passwordInput.trim());
      
      if (hash === ADMIN_PASSWORD_HASH) {
        sessionStorage.removeItem(ATTEMPT_KEY);
        sessionStorage.setItem(SESSION_KEY, btoa(ADMIN_PASSWORD_HASH.slice(0,16)));
        
        setIsUnlocked(true);
        setTimeout(() => {
          setIsAuthenticated(true);
          setPasswordInput('');
        }, 600);
      } else {
        const attempts = parseInt(sessionStorage.getItem(ATTEMPT_KEY) || '0') + 1;
        sessionStorage.setItem(ATTEMPT_KEY, attempts.toString());
        const remaining = MAX_ATTEMPTS - attempts;
        
        setGateError(true);
        setPasswordInput('');
        
        if (remaining <= 0) {
          sessionStorage.setItem(LOCKOUT_KEY, Date.now().toString());
          setLockoutRemaining(LOCKOUT_DURATION / 1000);
          setGateError(false);
        } else {
          setAttemptsLeft(remaining);
        }
      }
    } finally {
      setVerifying(false);
    }
  };

  if (isCheckingAuth) return <div style={{ background: '#050814', height: '100vh' }} />;

  if (!isAuthenticated) {
    return (
      <div className="admin-gate" id="adminGate">
        <div className="gate-bg"></div>
        <div className="gate-modal" style={{ borderColor: gateError ? 'rgba(255,45,85,0.5)' : 'rgba(0,229,255,0.15)' }}>
          <div className="gate-logo">
            <span className="gate-logo-text">STRIQO</span>
          </div>
          
          <div className="gate-title-block">
            <h2 className="gate-title">ADMIN ACCESS</h2>
            <p className="gate-subtitle">RESTRICTED AREA • AUTHORIZED ONLY</p>
          </div>
          
          <div className="gate-lock-icon" id="gateLockIcon" style={{ color: isUnlocked ? '#00e5ff' : 'inherit' }}>
            {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
          </div>
          
          <div className="gate-input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="adminPasswordInput"
              className={`gate-input ${gateError ? 'shake' : ''}`}
              placeholder="Enter admin password"
              maxLength={50}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
              disabled={lockoutRemaining > 0 || verifying}
            />
            <button 
              className="gate-toggle-pw" 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          {gateError && (
            <div className="gate-error" id="gateError">
              <XCircle size={16} className="inline-block mr-2" /> Incorrect password
            </div>
          )}
          
          {lockoutRemaining > 0 && (
            <div className="gate-lockout" id="gateLockout">
              <Lock size={16} className="inline-block mr-2" /> Too many attempts. Wait <span>{lockoutRemaining}</span>s
            </div>
          )}
          
          {gateError && attemptsLeft > 0 && attemptsLeft < MAX_ATTEMPTS && (
            <div className="gate-attempts" id="gateAttempts">
              <AlertTriangle size={16} className="inline-block mr-2 text-yellow-500" /> <span>{attemptsLeft}</span> attempt(s) remaining
            </div>
          )}
          
          <button 
            className="gate-submit-btn"
            id="gateSubmitBtn"
            type="button"
            onClick={verifyPassword}
            disabled={lockoutRemaining > 0 || verifying || !passwordInput.trim()}
          >
            {verifying ? 'VERIFYING...' : 'ENTER ADMIN PANEL'}
          </button>
          
          <a href="/" className="gate-back-link">
            ← Back to Striqo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" id="adminContent">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" height="26" alt="Logo" />
          <div className="sidebar-brand-text">
            <span className="brand-name">STRIQO</span>
            <span className="brand-role">ADMIN PANEL</span>
          </div>
        </div>

        <div className="sidebar-admin-info">
          <div className="admin-avatar"><Crown size={32} /></div>
          <div>
            <div className="admin-name">Administrator</div>
            <div className="admin-status">
              <span className="status-dot"></span>
              Active Session
            </div>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <nav className="sidebar-nav" style={{ overflowY: 'auto', flex: 1, paddingBottom: '10px' }}>
          <div className="nav-group-label">OVERVIEW</div>
          <a className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon"><BarChart2 size={18} /></span> Dashboard
          </a>

          <div className="nav-group-label">TOURNAMENT</div>
          <a className={`sidebar-link ${activeTab === 'tournaments' ? 'active' : ''}`} onClick={() => setActiveTab('tournaments')}>
            <span className="nav-icon"><Trophy size={18} /></span> Tournaments
            {stats.tournaments > 0 && <span className="nav-badge cyan" id="badge-tournaments">{stats.tournaments}</span>}
          </a>
          <a className={`sidebar-link ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            <span className="nav-icon"><Swords size={18} /></span> Match Manager
            {stats.matches > 0 && <span className="nav-badge yellow" id="badge-matches">{stats.matches}</span>}
          </a>
          <a className={`sidebar-link ${activeTab === 'disputes' ? 'active' : ''}`} onClick={() => setActiveTab('disputes')}>
            <span className="nav-icon"><AlertTriangle size={18} /></span> Disputes
            {stats.disputes > 0 && <span className="nav-badge red" id="badge-disputes">{stats.disputes}</span>}
          </a>
          <a className={`sidebar-link ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
            <span className="nav-icon"><GitBranch size={18} /></span> Bracket Manager
          </a>

          <div className="nav-group-label">PLAYERS</div>
          <a className={`sidebar-link ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
            <span className="nav-icon"><Users size={18} /></span> All Players
            {stats.players > 0 && <span className="nav-badge cyan" id="badge-players">{stats.players}</span>}
          </a>
          <a className={`sidebar-link ${activeTab === 'coins' ? 'active' : ''}`} onClick={() => setActiveTab('coins')}>
            <span className="nav-icon"><CoinIcon type="blue" /></span> Coin Manager
          </a>
          <a className={`sidebar-link ${activeTab === 'bans' ? 'active' : ''}`} onClick={() => setActiveTab('bans')}>
            <span className="nav-icon"><Ban size={18} /></span> Banned Players
          </a>

          <div className="nav-group-label">CONTENT</div>
          <a className={`sidebar-link ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>
            <span className="nav-icon"><Newspaper size={18} /></span> News Manager
          </a>
          <a className={`sidebar-link ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
            <span className="nav-icon"><ImageIcon size={18} /></span> Gallery Manager
          </a>
          <a className={`sidebar-link ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
            <span className="nav-icon"><Handshake size={18} /></span> Partners
          </a>

          <div className="nav-group-label">SYSTEM</div>
          <a className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <span className="nav-icon"><Bell size={18} /></span> Send Notification
          </a>
          <a className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span className="nav-icon"><Settings size={18} /></span> Site Settings
          </a>
          <a className={`sidebar-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <span className="nav-icon"><ClipboardList size={18} /></span> Activity Logs
          </a>
          <div className="nav-group-label">OPERATIONS</div>
          <a className={`sidebar-link ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
            <span className="nav-icon"><Flag size={18} /></span> Feature Flags
          </a>
          <a className={`sidebar-link ${activeTab === 'remoteConfig' ? 'active' : ''}`} onClick={() => setActiveTab('remoteConfig')}>
            <span className="nav-icon"><Sliders size={18} /></span> Remote Config
          </a>
          <a className={`sidebar-link ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
            <span className="nav-icon"><MessageSquare size={18} /></span> Beta Feedback
          </a>
          <a className={`sidebar-link ${activeTab === 'experiments' ? 'active' : ''}`} onClick={() => setActiveTab('experiments')}>
            <span className="nav-icon"><FlaskConical size={18} /></span> Experiments
          </a>
        </nav>

        <div className="sidebar-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '16px' }}>
          <button className="logout-btn" onClick={adminLogout} style={{ width: '100%', padding: '10px', background: 'rgba(255,45,85,0.1)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.3)', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' }}>
            <LogOut size={16} className="inline-block mr-2" /> LOGOUT
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="topbar-left">
            <h1 className="admin-page-title" style={{ margin: 0 }}>
              {activeTab.toUpperCase()}
            </h1>
          </div>
          <div className="topbar-right" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="admin-badge-secure" style={{ fontSize: '14px', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
              <Lock size={16} className="inline-block mr-2" /> SECURE SESSION
            </span>
          </div>
        </div>

        <div className="admin-sections" style={{ padding: '24px' }}>
          {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} globalStats={stats} />}
          {activeTab === 'tournaments' && <AdminTournaments />}
          {activeTab === 'matches' && <AdminMatches />}
          {activeTab === 'disputes' && <AdminDisputes />}
          {activeTab === 'bracket' && <AdminBracket />}
          {activeTab === 'players' && <AdminPlayers />}
          {activeTab === 'coins' && <AdminCoins />}
          {activeTab === 'bans' && <AdminBans />}
          {activeTab === 'news' && <AdminNewsManager />}
          {activeTab === 'gallery' && <AdminGallery />}
          {activeTab === 'partners' && <AdminPartners />}
          {activeTab === 'notifications' && <AdminNotifications />}
          
            {activeTab === 'settings' && <AdminSettings />}
            {activeTab === 'soc' && <AdminSOC />}
            {activeTab === 'metrics' && <AdminMetrics />}
            {activeTab === 'backups' && <AdminBackups />}

          {activeTab === 'logs' && <AdminLogs />}
          {activeTab === 'features' && <AdminFeatureFlags />}
          {activeTab === 'remoteConfig' && <AdminRemoteConfig />}
          {activeTab === 'feedback' && <AdminFeedback />}
          {activeTab === 'experiments' && <AdminExperiments />}
          {activeTab === 'beta' && <AdminBetaManagement />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'reports' && <AdminReports />}
        </div>
      </main>
    </div>
  );
}
