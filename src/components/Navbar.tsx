import { CoinIcon } from "./CoinIcon";
import { Link, useLocation } from 'react-router-dom';
import { useFeatureFlag } from '../contexts/ClientConfigContext';
import { Bell, CircleUserRound, Menu, X, Trophy, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { EmptyState } from './ui/EmptyState';
import { BellRing, Search } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { socket } from '../lib/api';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);
  const [betaCode, setBetaCode] = useState('');
  const [googleSignupStep, setGoogleSignupStep] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('striqo_notifications');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        type: 'alert',
        text: 'Server maintenance scheduled for tomorrow at 2:00 AM UTC.',
        time: '2 HOURS AGO',
        unread: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('striqo_notifications', JSON.stringify(notifications));
  }, [notifications]);



  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const handleNotificationClick = (notif: any) => {
    setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setSelectedNotification(notif);
    setShowNotifications(false);
  };

  const [currentUser, setCurrentUser] = useState<{ username: string, balance: number, avatarUrl?: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  useEffect(() => {
    if (!currentUser) return;
    
    // Listen for personal notifications
    const handleNotification = (data: any) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: data.type || 'alert',
          text: data.message,
          time: 'JUST NOW',
          unread: true
        },
        ...prev
      ].slice(0, 50));
      
      // Play sound or show toast in a real app
    };

    socket.on('notification:new', handleNotification);
    
    // Join a general announcements room
    socket.emit('join:room', { room: 'announcements' });
    
    return () => {
      socket.off('notification:new', handleNotification);
      socket.emit('leave:room', { room: 'announcements' });
    };
  }, [currentUser]);

  useEffect(() => {
    const handleOpenLogin = () => setActiveModal('login');
    window.addEventListener('openLoginModal', handleOpenLogin);
    return () => window.removeEventListener('openLoginModal', handleOpenLogin);
  }, []);

  useEffect(() => {
    const fetchUser = () => {
      const saved = localStorage.getItem('striqo_user');
      const token = localStorage.getItem('striqo_token');
      if (saved && token) {
        setCurrentUser(JSON.parse(saved));
      }
    };
    fetchUser();
    window.addEventListener('userLogin', fetchUser);
    return () => window.removeEventListener('userLogin', fetchUser);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const user = { username: 'Player1', balance: 500 }; // Mock actual balance
    localStorage.setItem('striqo_user', JSON.stringify(user));
    setCurrentUser(user);
    window.dispatchEvent(new Event('userLogin'));
    setActiveModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('striqo_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('userLogout'));
  };

  const handleSignUp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const user = { username: 'NewPlayer', balance: 0, efootballId: '123456789' }; // Mock actual balance for new user
    localStorage.setItem('striqo_user', JSON.stringify(user));
    setCurrentUser(user);
    window.dispatchEvent(new Event('userLogin'));
    
    setNotifications([
      {
        id: Date.now(),
        type: 'welcome',
        text: 'Welcome to Striqo! Your account has been successfully created. Get ready for the next tournament.',
        time: 'JUST NOW',
        unread: true
      },
      ...notifications
    ]);
    setActiveModal(null);
    setGoogleSignupStep(false);
  };

  const handleGoogleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = { username: 'GooglePlayer', balance: 0, efootballId: (document.getElementById('googleEfootballId') as HTMLInputElement)?.value || '987654321' };
    localStorage.setItem('striqo_user', JSON.stringify(user));
    setCurrentUser(user);
    window.dispatchEvent(new Event('userLogin'));
    
    setNotifications([
      {
        id: Date.now(),
        type: 'welcome',
        text: 'Welcome to Striqo! Your Google account has been linked successfully.',
        time: 'JUST NOW',
        unread: true
      },
      ...notifications
    ]);
    setActiveModal(null);
    setGoogleSignupStep(false);
  };

  return (
    <>
      <nav className="premium-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-wordmark premium-logo">STRIQO</div>
        </div>

        <div className="desktop-nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>HOME</Link>
          <Link to="/tournaments" className={`nav-link ${isActive('/tournaments')}`}>TOURNAMENTS</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>LEADERBOARD</Link>
          <Link to="/match" className={`nav-link ${isActive('/match')}`}>MATCH</Link>
          {currentUser ? (
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>PROFILE</Link>
          ) : (
            <span onClick={() => setActiveModal('login')} className={`nav-link ${isActive('/profile')}`} style={{ cursor: 'pointer' }}>PROFILE</span>
          )}
        </div>

        <div className="nav-actions">
          <div className="nav-balance">
            {currentUser ? <>{currentUser.balance.toLocaleString()} <CoinIcon type="blue" size={16} /></> : <>1,250 <CoinIcon type="blue" size={16} /></>}
          </div>
          
          <div className="nav-search premium-search" onClick={() => setSearchOpen(true)}>
            <div className="search-icon-wrapper"><Search size={16} color="#00e5ff" /></div>
            <span className="search-placeholder">Search...</span>
            <span className="search-shortcut">⌘K</span>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="premium-notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} className="bell-icon" />
              {notifications.filter(n => n.unread).length > 0 && (
                <div className="premium-notification-badge">
                  {notifications.filter(n => n.unread).length}
                </div>
              )}
            </div>

            <div className={`notifications-dropdown ${showNotifications ? 'open' : ''}`}>
              <div className="notifications-header">
                <div className="notifications-title">NOTIFICATIONS</div>
                <button className="notifications-clear" onClick={() => setNotifications(notifications.map(n => ({...n, unread: false})))}>Mark all read</button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <EmptyState icon={BellRing} title="All Caught Up" description="You have no new notifications right now." />
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.type} ${notif.unread ? 'unread' : ''}`} onClick={() => handleNotificationClick(notif)}>
                      <div className="notification-icon">
                        {notif.type === 'welcome' ? <Trophy size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="notification-content">
                        <div className="notification-text">{notif.text}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="desktop-auth-container">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <CircleUserRound size={24} color="#00e5ff" />
                  )}
                  <span style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 600 }}>{currentUser.username}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'transparent', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.4)',
                    padding: '8px 16px', fontFamily: '"Inter", sans-serif', fontSize: '14px',
                    fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,45,85,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <>
                <div className="premium-profile-icon" onClick={() => setActiveModal('login')}><CircleUserRound size={22} className="user-icon" /></div>
                <button className="premium-cta-btn" onClick={() => setActiveModal('signup')}>JOIN NOW</button>
              </>
            )}
          </div>
          <button className="mobile-menu-btn" aria-label="Open menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={32} />
        </button>
        <div className="mobile-nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
          <Link to="/tournaments" className={`nav-link ${isActive('/tournaments')}`} onClick={() => setIsMobileMenuOpen(false)}>TOURNAMENTS</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`} onClick={() => setIsMobileMenuOpen(false)}>LEADERBOARD</Link>
          <Link to="/match" className={`nav-link ${isActive('/match')}`} onClick={() => setIsMobileMenuOpen(false)}>MATCH</Link>
          {currentUser ? (
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`} onClick={() => setIsMobileMenuOpen(false)}>PROFILE</Link>
          ) : (
            <span onClick={() => { setActiveModal('login'); setIsMobileMenuOpen(false); }} className={`nav-link ${isActive('/profile')}`} style={{ cursor: 'pointer' }}>PROFILE</span>
          )}
          
          <div style={{ marginTop: '24px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {currentUser ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', textDecoration: 'none' }}>
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <CircleUserRound size={32} color="#00e5ff" />
                  )}
                  <span style={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', fontSize: '18px', fontWeight: 600 }}>{currentUser.username}</span>
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  style={{
                    background: 'transparent', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.4)',
                    padding: '12px 32px', fontFamily: '"Inter", sans-serif', fontSize: '16px',
                    fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease',
                    width: '100%', maxWidth: '280px'
                  }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setActiveModal('login'); setIsMobileMenuOpen(false); }}
                  style={{
                    background: 'transparent', color: '#00e5ff', border: '1px solid #00e5ff',
                    padding: '12px 32px', fontFamily: '"Inter", sans-serif', fontSize: '16px',
                    fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease',
                    width: '100%', maxWidth: '280px'
                  }}
                >
                  LOGIN
                </button>
                <button 
                  onClick={() => { setActiveModal('signup'); setIsMobileMenuOpen(false); }}
                  style={{
                    background: '#ffffff', color: '#7c3aed', border: 'none',
                    padding: '12px 32px', fontFamily: '"Inter", sans-serif', fontSize: '16px',
                    fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    width: '100%', maxWidth: '280px'
                  }}
                >
                  JOIN NOW
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog.Root open={activeModal === 'login'} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay open" />
          <Dialog.Content className="modal-content" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001 }}>
            <Dialog.Close asChild>
              <button className="modal-close"><X size={24} /></button>
            </Dialog.Close>
            <Dialog.Title className="modal-title">WELCOME BACK</Dialog.Title>
            <Dialog.Description className="modal-subtitle">LOGIN TO YOUR ACCOUNT</Dialog.Description>
            <form onSubmit={handleLogin}>
              <div className="modal-input-group">
                <input type="email" className="modal-input" placeholder="Email Address" required />
              </div>
              <div className="modal-input-group">
                <input type="password" className="modal-input" placeholder="Password" required />
              </div>
              <button type="submit" className="btn-igx-outline" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                SIGN IN ——&gt;
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 600, letterSpacing: '0.1em' }}>OR</div>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
              </div>

              <button 
                type="button"
                onClick={handleLogin}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff',
                  fontSize: '15px', fontFamily: '"Inter", sans-serif', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '20px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ textAlign: 'center', fontSize: '14px', color: '#F8FAFC', fontFamily: '"Inter", sans-serif' }}>
                Don't have an account? <span style={{ color: '#00e5ff', cursor: 'pointer' }} onClick={() => setActiveModal('signup')}>Sign Up</span>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Sign Up Modal */}
      <Dialog.Root open={activeModal === 'signup'} onOpenChange={(open) => { if (!open) { setActiveModal(null); setGoogleSignupStep(false); }}}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay open" />
          <Dialog.Content className="modal-content" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001 }}>
            <Dialog.Close asChild>
              <button className="modal-close" onClick={() => setGoogleSignupStep(false)}><X size={24} /></button>
            </Dialog.Close>
            <Dialog.Title className="modal-title">BECOME A LEGEND</Dialog.Title>
            
            {googleSignupStep ? (
              <form onSubmit={handleGoogleSignUpSubmit}>
                <Dialog.Description className="modal-subtitle" style={{ color: '#00e5ff' }}>ALMOST THERE!</Dialog.Description>
                <p style={{ color: '#F8FAFC', fontSize: '15px', marginBottom: '20px', textAlign: 'center' }}>
                  Please link your eFootball User ID to complete your registration.
                </p>
                <div className="modal-input-group">
                  <input type="text" className="modal-input" placeholder="eFootball User ID" required id="googleEfootballId" />
                </div>
                
                <button type="submit" className="btn-igx-parallelogram" style={{ width: '100%', justifyContent: 'center' }}>
                  COMPLETE SIGN UP
                </button>
              </form>
            ) : (
              <>
                <Dialog.Description className="modal-subtitle">CREATE YOUR STRIQO ACCOUNT</Dialog.Description>
                <form onSubmit={handleSignUp}>
                  <div className="modal-input-group">
                    <input type="text" className="modal-input" placeholder="Username" required />
                  </div>
                  <div className="modal-input-group">
                    <input type="text" className="modal-input" placeholder="eFootball User ID" required />
                  </div>
                  <div className="modal-input-group">
                    <input type="email" className="modal-input" placeholder="Email Address" required />
                  </div>
                  <div className="modal-input-group">
                    <input type="password" className="modal-input" placeholder="Password" required />
                  </div>
                  
                  <button type="submit" className="btn-igx-parallelogram" style={{ width: '100%', justifyContent: 'center' }}>
                    JOIN NOW
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 600, letterSpacing: '0.1em' }}>OR</div>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setGoogleSignupStep(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff',
                      fontSize: '15px', fontFamily: '"Inter", sans-serif', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '20px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '14px', color: '#F8FAFC', fontFamily: '"Inter", sans-serif' }}>
                    Already have an account? <span style={{ color: '#00e5ff', cursor: 'pointer' }} onClick={() => setActiveModal('login')}>Sign In</span>
                  </div>
                </form>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Notification Details Modal */}
      <Dialog.Root open={!!selectedNotification} onOpenChange={(open) => { if (!open) setSelectedNotification(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay open" />
          <Dialog.Content className="modal-content" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001 }}>
            <Dialog.Close asChild>
              <button className="modal-close"><X size={24} /></button>
            </Dialog.Close>
            <Dialog.Title className="modal-title">
              <span style={{ marginRight: '12px' }}>{selectedNotification?.type === 'welcome' ? <Trophy size={16} /> : <AlertTriangle size={16} />}</span>
              NOTIFICATION
            </Dialog.Title>
            <Dialog.Description className="modal-subtitle">{selectedNotification?.time}</Dialog.Description>
            
            <div style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '15px',
              color: '#e0e0e0',
              lineHeight: 1.6,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '24px',
              marginTop: '24px'
            }}>
              {selectedNotification?.text}
            </div>

            <Dialog.Close asChild>
              <button className="btn-igx-outline" style={{ width: '100%', marginTop: '32px' }}>
                CLOSE
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
}
