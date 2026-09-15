const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// We append some heavy overrides to totally transform the look without changing class names.
const overrides = `
/* =======================================================
   STRIQO - PREMIUM UI/UX UPGRADE OVERRIDES
   ======================================================= */

:root {
  --striqo-cyan: #00e5ff;
  --striqo-cyan-glow: rgba(0, 229, 255, 0.4);
  --striqo-purple: #b026ff;
  --striqo-bg: #030308;
  --striqo-bg-card: rgba(255, 255, 255, 0.03);
  --striqo-border: rgba(255, 255, 255, 0.1);
}

body {
  background-color: var(--striqo-bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.05), transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(176, 38, 255, 0.05), transparent 30%);
  background-attachment: fixed;
  color: #fff;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.02em;
}

/* 2. HEADER / NAVIGATION */
.logo-wordmark {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 28px;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.desktop-nav-links .nav-link {
  font-family: 'Orbitron', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #94a3b8;
  padding: 10px 0;
  margin: 0 16px;
  position: relative;
  transition: color 0.2s ease;
}

.desktop-nav-links .nav-link:hover {
  color: #fff;
}

.desktop-nav-links .nav-link.active {
  color: var(--striqo-cyan);
}

.desktop-nav-links .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--striqo-cyan);
  box-shadow: 0 0 10px var(--striqo-cyan-glow);
}

/* 4. HERO SECTION */
.hero-heading {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 8vw, 84px) !important;
  line-height: 0.9 !important;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 4px 30px rgba(0,0,0,0.5);
  margin-bottom: 40px !important;
}

/* 5. ANNOUNCEMENT BAR */
/* The banner in Dashboard.tsx */
div[style*="STRIQO CUP #5"] {
  background: linear-gradient(90deg, #00e5ff 0%, #b026ff 100%) !important;
  color: #fff !important;
  padding: 12px !important;
  font-family: 'Orbitron', sans-serif !important;
  font-size: 13px !important;
  letter-spacing: 0.2em !important;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  display: flex !important;
  align-items: center;
  justify-content: center;
}

/* 6. HOW IT WORKS */
.hiw-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.hiw-step {
  background: var(--striqo-bg-card);
  border: 1px solid var(--striqo-border);
  border-radius: 16px;
  padding: 32px 24px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.hiw-step:hover {
  border-color: rgba(0,229,255,0.4);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.hiw-step::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--striqo-cyan), var(--striqo-purple));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hiw-step:hover::before {
  opacity: 1;
}

.step-number {
  font-family: 'Orbitron', sans-serif;
  font-size: 48px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.05);
  position: absolute;
  top: 10px;
  right: 16px;
}

.step-icon {
  color: var(--striqo-cyan);
  margin-bottom: 24px;
  background: rgba(0,229,255,0.1);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(0,229,255,0.2);
}

.step-connector { display: none; }

.step-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #fff;
  margin-bottom: 12px;
}

.step-desc {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .hiw-steps { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .hiw-steps { grid-template-columns: 1fr; }
}

/* 7. SCORING / RULES PANEL */
.hiw-rules {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--striqo-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rule-icon {
  background: rgba(255,255,255,0.05);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.rule-text {
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.4;
}

.rule-text strong {
  color: #fff;
  font-weight: 700;
}

.rule-divider { display: none; }

@media (max-width: 1024px) {
  .hiw-rules { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .hiw-rules { grid-template-columns: 1fr; }
}

/* 8. START COMPETING CTA */
.hiw-cta .btn-igx-parallelogram {
  background: var(--striqo-cyan);
  color: #000;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.1em;
  padding: 20px 48px;
  clip-path: polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  border: none;
}

.hiw-cta .btn-igx-parallelogram:hover {
  background: #fff;
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0,229,255,0.4);
}

/* 9. TOP PLAYERS */
.community-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.community-subtitle {
  color: var(--striqo-cyan);
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: 0.2em;
  font-size: 14px;
  margin-bottom: 40px;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.player-spotlight {
  background: var(--striqo-bg-card);
  border: 1px solid var(--striqo-border);
  border-radius: 16px;
  padding: 32px 24px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-spotlight:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 229, 255, 0.3);
  transform: translateY(-4px);
}

.spotlight-rank {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  border: 2px solid #444;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 16px;
  padding: 4px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.spotlight-rank.gold { background: linear-gradient(135deg, #FFD700, #B8860B); border-color: #FFF8DC; color: #000; }
.spotlight-rank.silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); border-color: #FFF; color: #000; }
.spotlight-rank.bronze { background: linear-gradient(135deg, #CD7F32, #A0522D); border-color: #FFDAB9; color: #000; }

.spotlight-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid var(--striqo-border);
  margin-top: 16px;
  margin-bottom: 16px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotlight-avatar.placeholder {
  background: rgba(0, 229, 255, 0.1) !important;
  border-color: rgba(0, 229, 255, 0.3);
}
.spotlight-avatar.placeholder::after {
  content: '';
  display: block;
  width: 48px;
  height: 48px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%2300e5ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
}


.spotlight-name {
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #fff;
  margin-bottom: 4px;
}

.spotlight-efootball-id {
  color: var(--striqo-cyan);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
  background: rgba(0, 229, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.spotlight-points {
  font-family: 'Orbitron', sans-serif;
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}

.spotlight-points-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.spotlight-badges {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--striqo-border);
  width: 100%;
  justify-content: center;
}

.spotlight-badge {
  background: rgba(255,255,255,0.05);
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .community-grid { grid-template-columns: 1fr; }
}

/* 11. LATEST NEWS */
.news-section {
  padding: 80px 0;
}

.news-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40px;
}

.news-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.1em;
}

.news-subtitle {
  color: var(--striqo-cyan);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.news-card {
  background: var(--striqo-bg-card);
  border: 1px solid var(--striqo-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.news-card:hover {
  border-color: var(--striqo-cyan);
  transform: translateY(-4px);
}

.news-image-container {
  height: 200px;
  background: rgba(0,0,0,0.5);
  position: relative;
}

.news-category {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.1em;
}

.news-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-date {
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 12px;
  font-weight: 600;
}

.news-card-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.4;
}

.news-excerpt {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
}

.news-read-more {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--striqo-cyan);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.1em;
}

@media (max-width: 1024px) {
  .news-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .news-grid { grid-template-columns: 1fr; }
  .news-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
`;

content += '\n' + overrides;
fs.writeFileSync(file, content);
