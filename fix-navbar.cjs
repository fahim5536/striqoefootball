const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Navbar.tsx');
let content = fs.readFileSync(file, 'utf8');

// The <nav> tag replacement
const navTarget = `<nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '72px',
        background: 'rgba(8,8,26,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', zIndex: 1000
      }}>`;

const navReplacement = `<nav className="premium-navbar">`;

content = content.replace(navTarget, navReplacement);

// STRIQO Logo wrapping
content = content.replace(/<div className="logo-wordmark">STRIQO<\/div>/g, '<div className="logo-wordmark premium-logo">STRIQO</div>');

// Nav search
const searchTarget = `<div className="nav-search" onClick={() => setSearchOpen(true)}>
            <Search size={16} color="#CBD5E1" />
            <span style={{ color: '#F8FAFC', fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Search...</span>
            <span style={{ color: '#475569', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>⌘K</span>
          </div>`;

const searchReplacement = `<div className="nav-search premium-search" onClick={() => setSearchOpen(true)}>
            <div className="search-icon-wrapper"><Search size={16} color="#00e5ff" /></div>
            <span className="search-placeholder">Search...</span>
            <span className="search-shortcut">⌘K</span>
          </div>`;

content = content.replace(searchTarget, searchReplacement);

// Notifications 
const notifTarget = `<div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} color="#ffffff" />
              {notifications.filter(n => n.unread).length > 0 && (
                <div style={{ 
                  position: 'absolute', top: '-6px', right: '-8px', 
                  background: '#00e5ff', color: '#08081a', 
                  fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 800,
                  padding: '0 4px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '16px', height: '16px'
                }}>
                  {notifications.filter(n => n.unread).length}
                </div>
              )}
            </div>`;

const notifReplacement = `<div className="premium-notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} className="bell-icon" />
              {notifications.filter(n => n.unread).length > 0 && (
                <div className="premium-notification-badge">
                  {notifications.filter(n => n.unread).length}
                </div>
              )}
            </div>`;

content = content.replace(notifTarget, notifReplacement);

// Login CTA
const authTarget = `<button style={{
                  background: '#ffffff', color: '#7c3aed', fontFamily: '"Inter", sans-serif',
                  fontSize: '15px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '14px 24px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  borderRadius: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(0)' }}
                onClick={() => setActiveModal('signup')}
                >
                  JOIN NOW
                </button>`;

const authReplacement = `<button className="premium-cta-btn" onClick={() => setActiveModal('signup')}>
                  JOIN NOW
                </button>`;

content = content.replace(authTarget, authReplacement);

const iconTarget = `<CircleUserRound size={24} color="#ffffff" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('login')} />`;
const iconReplacement = `<div className="premium-profile-icon" onClick={() => setActiveModal('login')}><CircleUserRound size={22} className="user-icon" /></div>`;
content = content.replace(iconTarget, iconReplacement);

fs.writeFileSync(file, content);
