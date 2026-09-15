const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// I will just append premium styles at the end, replacing or overriding existing ones where needed,
// but it's cleaner to replace the root variables and add the standard buttons/cards.

const premiumCSS = `
/* --- PREMIUM STRIQO DESIGN SYSTEM UPGRADE --- */

:root {
  --striqo-cyan: #00e5ff;
  --striqo-cyan-glow: rgba(0, 229, 255, 0.4);
  --striqo-cyan-dim: rgba(0, 229, 255, 0.1);
  --striqo-purple: #b026ff;
  --striqo-purple-glow: rgba(176, 38, 255, 0.4);
  --striqo-bg: #030308;
  --striqo-bg-card: rgba(255, 255, 255, 0.03);
  --striqo-bg-card-hover: rgba(255, 255, 255, 0.05);
  --striqo-border: rgba(255, 255, 255, 0.1);
  --striqo-border-focus: rgba(0, 229, 255, 0.5);
  --striqo-text-main: #ffffff;
  --striqo-text-muted: #94a3b8;
  --striqo-text-dim: #64748b;
  
  --font-heading: 'Orbitron', sans-serif;
  --font-body: 'Inter', sans-serif;
}

body {
  background-color: var(--striqo-bg);
  color: var(--striqo-text-main);
  font-family: var(--font-body);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(0, 229, 255, 0.03), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(176, 38, 255, 0.03), transparent 25%);
  background-attachment: fixed;
}

/* Premium Button System */
.btn-premium {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--striqo-cyan);
  color: #000;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  text-decoration: none;
}

.btn-premium:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px var(--striqo-cyan-glow);
}

.btn-premium:active {
  transform: translateY(0);
}

.btn-premium-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(0, 229, 255, 0.05);
  color: var(--striqo-cyan);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--striqo-cyan-glow);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-premium-outline:hover {
  background: var(--striqo-cyan-dim);
  border-color: var(--striqo-cyan);
}

.btn-premium-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  color: var(--striqo-text-muted);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-premium-ghost:hover {
  color: var(--striqo-text-main);
  background: rgba(255, 255, 255, 0.05);
}

/* Premium Card System */
.card-premium {
  background: var(--striqo-bg-card);
  border: 1px solid var(--striqo-border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-premium::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--striqo-border), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-premium:hover {
  background: var(--striqo-bg-card-hover);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.card-premium:hover::before {
  opacity: 1;
}

/* Typography Enhancements */
.text-gradient-cyan {
  background: linear-gradient(135deg, #fff 0%, var(--striqo-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-heading-premium {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--striqo-text-main);
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
}

.section-subheading-premium {
  font-family: var(--font-body);
  font-size: clamp(14px, 2vw, 16px);
  color: var(--striqo-cyan);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
  margin-bottom: 40px;
}

/* Upgraded Navbar */
.navbar-premium {
  border-bottom: 1px solid var(--striqo-border);
  background: rgba(3, 3, 8, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-link-premium {
  color: var(--striqo-text-muted);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color 0.2s;
  position: relative;
  padding: 8px 0;
}

.nav-link-premium:hover {
  color: var(--striqo-text-main);
}

.nav-link-premium.active {
  color: var(--striqo-cyan);
}

.nav-link-premium.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--striqo-cyan);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--striqo-cyan-glow);
}

/* Coin Display Premium */
.coin-display-premium {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  transition: all 0.2s ease;
}

.coin-display-premium:hover {
  background: rgba(0, 229, 255, 0.15);
  border-color: rgba(0, 229, 255, 0.3);
}

/* Empty State Premium */
.empty-state-premium {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--striqo-bg-card);
  border: 1px dashed var(--striqo-border);
  border-radius: 12px;
  text-align: center;
}

.empty-state-icon {
  color: var(--striqo-text-dim);
  margin-bottom: 20px;
}

.empty-state-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  color: var(--striqo-text-main);
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.empty-state-desc {
  color: var(--striqo-text-muted);
  font-size: 15px;
  max-width: 400px;
  line-height: 1.5;
}

/* Skeleton Loading Premium */
.skeleton-premium {
  background: linear-gradient(90deg, 
    var(--striqo-bg-card) 25%, 
    rgba(255, 255, 255, 0.06) 50%, 
    var(--striqo-bg-card) 75%
  );
  background-size: 400% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

`;

content += '\n' + premiumCSS;
fs.writeFileSync(file, content);
