const fs = require('fs');
const css = `
/* --- MOBILE STATS FIX --- */
#premium-stats-section {
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;
}

#premium-stats-section .stats-grid {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 24px !important;
  max-width: 1400px !important;
  margin: 0 auto !important;
  padding: 0 40px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  justify-items: stretch !important;
}

#premium-stats-section .stat-item {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  gap: 12px !important;
  padding: 24px 12px !important;
  box-sizing: border-box !important;
  width: 100% !important;
  border-right: 1px solid rgba(255,255,255,0.05) !important;
  border-bottom: none !important;
  background: transparent !important;
  border-radius: 0 !important;
}

#premium-stats-section .stat-item:last-child {
  border-right: none !important;
}

#premium-stats-section .stat-icon {
  color: var(--striqo-cyan) !important;
  margin-bottom: 8px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

#premium-stats-section .stat-number {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 32px !important;
  font-weight: 900 !important;
  color: #fff !important;
  text-align: center !important;
}

#premium-stats-section .stat-label {
  font-size: 15px !important;
  color: #E2E8F0 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  text-align: center !important;
  line-height: 1.4 !important;
  white-space: pre-wrap !important;
}

/* Tablet (1024px) */
@media (max-width: 1024px) {
  #premium-stats-section .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    padding: 0 24px !important;
  }
  #premium-stats-section .stat-item {
    border-right: 1px solid rgba(255,255,255,0.05) !important;
    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
  }
  #premium-stats-section .stat-item:nth-child(3n) {
    border-right: none !important;
  }
  #premium-stats-section .stat-item:last-child {
    border-bottom: none !important;
  }
}

/* Mobile (768px and below) */
@media (max-width: 768px) {
  #premium-stats-section {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  #premium-stats-section .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    padding: 0 16px !important;
    gap: 16px !important;
    width: 100% !important;
  }

  #premium-stats-section .stat-item {
    border-right: none !important;
    border-bottom: none !important;
    padding: 20px 8px !important;
    background: rgba(255,255,255,0.02) !important;
    border: 1px solid rgba(255,255,255,0.05) !important;
    border-radius: 12px !important;
  }
  
  /* Make the 5th item (Coins Awarded) span both columns and center perfectly */
  #premium-stats-section .stat-item:nth-child(5) {
    grid-column: 1 / -1 !important;
  }

  #premium-stats-section .stat-number {
    font-size: 24px !important;
  }

  #premium-stats-section .stat-label {
    font-size: 13px !important;
  }
}
`;

fs.appendFileSync('src/index.css', css);
