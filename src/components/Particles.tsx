import { useEffect } from 'react';

export default function Particles() {
  useEffect(() => {
    const container = document.querySelector('.particles');
    if (!container) return;

    // Clear existing particles if re-running
    container.innerHTML = '';

    const colors = ['#00ff88', '#4444ff', '#00e5ff', '#7c3aed'];
    
    for (let i = 0; i < 25; i++) {
      const dot = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 4 + 2;
      
      dot.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.6 + 0.2};
        animation: floatDot ${Math.random() * 12 + 8}s ${Math.random() * 8}s infinite ease-in-out;
      `;
      container.appendChild(dot);
    }
  }, []);

  return <div className="particles" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} />;
}
