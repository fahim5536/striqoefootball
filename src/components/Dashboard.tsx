import { Trophy, Medal, Star, Target, Activity, Users, Gamepad2, Camera, X, User, Swords, CheckCircle2, MinusCircle, XCircle, ArrowRight } from "lucide-react";
import { CoinIcon } from "./CoinIcon";
import { SEO } from './SEO';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PremiumGallery from "./PremiumGallery";
import NewsSection from './NewsSection';
import RecommendationsSection from './RecommendationsSection';
import { useRemoteConfig, useFeatureFlag } from '../contexts/ClientConfigContext';

export default function Dashboard() {
    const heroTitle = useRemoteConfig('hero_title', 'GLOBAL CHAMPIONSHIP WEEKEND');
  const showBanner = useFeatureFlag('SHOW_PROMO_BANNER');
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const target = parseInt(htmlEl.dataset.target || '0', 10);
              let count = 0;
              const step = target / 60;
              const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                  count = target;
                  clearInterval(timer);
                }
                htmlEl.textContent = Math.floor(count).toLocaleString();
              }, 16);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('striqo_gallery');
    if (saved) {
      const parsed = JSON.parse(saved)
        .filter((img: any) => img.isVisible)
        .sort((a: any, b: any) => b.uploadedAt - a.uploadedAt)
        .slice(0, 7);
      setGalleryImages(parsed);
    }
  }, []);

  const communityLegends = [
    { rank: 1, name: 'STR_Alex', id: 'EF-9283-4412', points: 75, badge: 'gold', trophies: [<Trophy key="1" size={16} color="#ffd700"/>, <Medal key="2" size={16} color="#ffd700"/>, <Star key="3" size={16} color="#ffd700"/>] },
    { rank: 2, name: 'FC_Pro_Gamer', id: 'EF-1102-8834', points: 65, badge: 'silver', trophies: [<Medal key="1" size={16} color="#c0c0c0"/>, <Star key="2" size={16} color="#c0c0c0"/>] },
    { rank: 3, name: 'Tiki_Taka_Master', id: 'EF-5541-2290', points: 58, badge: 'bronze', trophies: [<Medal key="1" size={16} color="#cd7f32"/>, <Target key="2" size={16} color="#cd7f32"/>] }
  ];

  return (
    <div style={{ paddingTop: '72px' }}>
      {/* Optional Announcement Banner */}
      <div style={{ background: '#00e5ff', color: '#08081a', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        <Trophy size={16} className="inline-block mr-2" /> STRIQO CUP #5 Registration Now Open!
      </div>

      {/* Hero Section */}
      <section className="hero-section px-4 md:px-10 py-20 md:py-24" style={{
        minHeight: 'calc(100vh - 72px)', background: 'var(--bg-main)', position: 'relative', display: 'flex',
        alignItems: 'center', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(124,58,237,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,229,255,0.05) 0%, transparent 60%)',
          zIndex: 0
        }} />

        <div className="container-max" style={{ zIndex: 1, position: 'relative', width: '100%' }}>
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
        </div>

        {/* Hero Right Side Labels */}
        <div className="hero-right-labels">
          <div className="hero-label-item">
            FRIENDLIES <span className="hero-label-dot">•</span>
          </div>
          <div className="hero-label-item active">
            TOURNAMENTS <span className="hero-label-line" />
          </div>
          <div className="hero-label-item">
            LEADERBOARD <span className="hero-label-dot">•</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar" id="premium-stats-section" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon"><Trophy size={24} strokeWidth={1.5} /></span>
            <span className="stat-number" data-target="24">0</span>
            <span className="stat-label">Total Tournaments</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><Swords size={24} strokeWidth={1.5} /></span>
            <span className="stat-number" data-target="1842">0</span>
            <span className="stat-label">Total Matches</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><Users size={24} strokeWidth={1.5} /></span>
            <span className="stat-number" data-target="156">0</span>
            <span className="stat-label">Active Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><Gamepad2 size={24} strokeWidth={1.5} /></span>
            <span className="stat-number" data-target="3204">0</span>
            <span className="stat-label">Friend Matches</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon"><CoinIcon type="blue" size={24} /></span>
            <span className="stat-number" data-target="48500">0</span>
            <span className="stat-label">Coins Awarded</span>
          </div>
        </div>
      </section>

      {/* Official Partners */}
      <section className="partners-section">
        <div className="container-max" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
          <h2 className="section-heading-premium" style={{ marginBottom: '40px', fontSize: '24px', letterSpacing: '0.15em', color: '#ffffff' }}>
            OFFICIAL PARTNERS
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '40px', opacity: 0.7 }}>
            <a href="https://www.konami.com/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '28px', fontWeight: 900, color: '#E2E8F0', letterSpacing: '0.1em', textDecoration: 'none', transition: 'color 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#E2E8F0'}>
              KONAMI
            </a>
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      <section className="featured-banner">
        <div className="featured-banner-placeholder">
           <div className="featured-banner-text">
             <span className="featured-tag">FEATURED EVENT</span>
             <h2 className="featured-title">STRIQO WINTER SERIES IS COMING</h2>
             <Link to="/tournaments" className="featured-cta">VIEW TOURNAMENT DETAILS</Link>
           </div>
        </div>
      </section>

      {/* Blog / News Section */}
      <NewsSection />

      {/* Community Highlights */}
      <RecommendationsSection />

      <section className="community-section">
        <div className="container-max" style={{ textAlign: 'center' }}>
          <h2 className="community-title">TOP PLAYERS</h2>
          <div className="community-subtitle">COMMUNITY LEGENDS</div>
          
          <div className="community-grid">
            {communityLegends.map((player) => (
              <div key={player.rank} className="player-spotlight">
                <div className={`spotlight-rank ${player.badge}`}>#{player.rank}</div>
                <div className="spotlight-avatar placeholder" style={{ background: '#333' }}></div>
                <div className="spotlight-name">{player.name}</div>
                <div className="spotlight-efootball-id">ID: {player.id}</div>
                <div className="spotlight-points">{player.points}</div>
                <div className="spotlight-points-label">Total Points</div>
                <div className="spotlight-badges">
                  {player.trophies.map((trophy, i) => (
                    <span key={i} className="spotlight-badge">{trophy}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="gallery-section">
        <div className="container-max">
          <h2 className="gallery-title">GALLERY</h2>
          <div className="gallery-subtitle">THE MOMENTS THAT DEFINE THE COMPETITION</div>
          
          <PremiumGallery images={galleryImages} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container-max">

          {/* Section Header */}
          <div className="hiw-header">
            <span className="hiw-label">GETTING STARTED</span>
            <h2 className="hiw-title">HOW IT WORKS</h2>
            <p className="hiw-subtitle">
              JOIN A TOURNAMENT IN 4 SIMPLE STEPS
            </p>
          </div>

          {/* Steps Grid */}
          <div className="hiw-steps">

            {/* Step 1 */}
            <div className="hiw-step reveal">
              <div className="step-number">01</div>
              <div className="step-icon"><User size={28} /></div>
              <div className="step-connector"></div>
              <h3 className="step-title">CREATE ACCOUNT</h3>
              <p className="step-desc">
                Sign up with your email and add your 
                eFootball User ID. Upload your gameplay 
                style screenshot to complete your profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="hiw-step reveal">
              <div className="step-number">02</div>
              <div className="step-icon"><Gamepad2 size={28} /></div>
              <div className="step-connector"></div>
              <h3 className="step-title">JOIN TOURNAMENT</h3>
              <p className="step-desc">
                Browse active tournaments and register. 
                Select your country or club team — 
                each team can only be picked by one player.
              </p>
            </div>

            {/* Step 3 */}
            <div className="hiw-step reveal">
              <div className="step-number">03</div>
              <div className="step-icon"><Swords size={28} /></div>
              <div className="step-connector"></div>
              <h3 className="step-title">PLAY YOUR MATCH</h3>
              <p className="step-desc">
                Admin assigns your opponent. 
                Message them in-app to schedule. 
                Play on eFootball using your unique 
                match code for verification.
              </p>
            </div>

            {/* Step 4 */}
            <div className="hiw-step reveal">
              <div className="step-number">04</div>
              <div className="step-icon"><Trophy size={28} /></div>
              <div className="step-connector last"></div>
              <h3 className="step-title">SUBMIT & WIN</h3>
              <p className="step-desc">
                Upload your result screenshot after 
                the match. Win coins, climb the 
                leaderboard, and earn trophy badges 
                by becoming champion.
              </p>
            </div>

          </div>

          {/* Rules Summary */}
          <div className="hiw-rules">

            <div className="rule-item">
              <span className="rule-icon"><CheckCircle2 size={20} color="#22c55e" /></span>
              <span className="rule-text">
                Win = <strong>3 Points <Target size={16} className="inline-block" style={{color: "#fff"}} /></strong> + 
                <strong>20 <CoinIcon type="blue" size={16} /></strong>
              </span>
            </div>

            <div className="rule-divider"></div>

            <div className="rule-item">
              <span className="rule-icon"><MinusCircle size={20} color="#eab308" /></span>
              <span className="rule-text">
                Draw = <strong>1 Point <Target size={16} className="inline-block" style={{color: "#fff"}} /></strong> + 
                <strong>10 <CoinIcon type="blue" size={16} /></strong>
              </span>
            </div>

            <div className="rule-divider"></div>

            <div className="rule-item">
              <span className="rule-icon"><XCircle size={20} color="#ff2d55" /></span>
              <span className="rule-text">
                3 Losses = 
                <strong>Eliminated</strong> from tournament
              </span>
            </div>

            <div className="rule-divider"></div>

            <div className="rule-item">
              <span className="rule-icon"><Camera size={20} color="#00e5ff" /></span>
              <span className="rule-text">
                Screenshot required after 
                <strong>every match</strong>
              </span>
            </div>

          </div>

          {/* CTA Button */}
          <div className="hiw-cta">
            <Link to="/tournaments" className="btn-premium">
              START COMPETING <ArrowRight size={20} className="inline-block" />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
