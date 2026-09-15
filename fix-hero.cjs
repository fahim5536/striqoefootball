const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="container-max" style={{ zIndex: 1, position: 'relative', width: '100%' }}>
          <div style={{ display: 'inline-block', border: '1px solid #ffffff', padding: '10px 20px', fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '32px', borderRadius: 0 }}>
            E-SPORTS
          </div>
          
          {showBanner && (
            <div style={{ background: '#00e5ff', color: '#000', padding: '12px 24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block' }}>
              Special Event Active
            </div>
          )}
          <h1 className="hero-heading" style={{ marginBottom: '32px', maxWidth: '700px' }}>
            {heroTitle}
          </h1>
        </div>

        {/* Hero Right Side Labels */}
        <div className="hero-right-labels" style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "24px", alignItems: "flex-end", zIndex: 1 }}>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC' }}>
            FRIENDLIES <span style={{ color: '#F8FAFC' }}>•</span>
          </div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
            TOURNAMENTS <span style={{ display: 'inline-block', width: '24px', height: '1px', background: '#ffffff' }} />
          </div>
          <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC' }}>
            LEADERBOARD <span style={{ color: '#F8FAFC' }}>•</span>
          </div>
        </div>`;

const replacement = `<div className="container-max" style={{ zIndex: 1, position: 'relative', width: '100%' }}>
          <div className="hero-layout">
            <div className="hero-text">
              <div style={{ display: 'inline-block', border: '1px solid #ffffff', padding: '10px 20px', fontFamily: '"Inter", sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '32px', borderRadius: 0 }}>
                E-SPORTS
              </div>
              
              {showBanner && (
                <div style={{ background: '#00e5ff', color: '#000', padding: '12px 24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block' }}>
                  Special Event Active
                </div>
              )}
              <h1 className="hero-heading" style={{ marginBottom: '32px' }}>
                {heroTitle}
              </h1>
            </div>

            <div className="hero-image-wrapper">
              <img 
                src="/striqohome.png" 
                alt="STRIQO eFootball Championship" 
                className="hero-image"
              />
            </div>
          </div>
        </div>`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
