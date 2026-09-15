const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

const responsiveCSS = `
/* =======================================================
   RESPONSIVENESS AND LAYOUT POLISH
   ======================================================= */

/* General Mobile Resets */
html, body {
  overflow-x: hidden;
  width: 100%;
}

img, svg, video {
  max-width: 100%;
  height: auto;
}

/* 1. Mobile Navigation */
@media (max-width: 768px) {
  .desktop-nav-links {
    display: none !important;
  }
  
  /* Assume a hamburger menu or similar exists, or at least prevent the header from squishing */
  .navbar-container {
    justify-content: space-between;
    padding: 0 16px;
  }
}

/* 2. Hero Responsiveness */
.hero-heading {
  font-size: clamp(32px, 8vw, 84px) !important;
  line-height: 1.1 !important;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 20px 40px !important;
  }
  .hero-right-labels {
    display: none !important; /* Hide decorative right labels on small screens */
  }
}

/* 3. Statistics Bar Responsiveness */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  justify-items: center;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-grid .stat-item:last-child {
    grid-column: span 2; /* Center the odd one out */
  }
  .stat-number {
    font-size: 24px;
  }
}

/* 4. Top Players Responsiveness */
.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 5. How It Works */
.hiw-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.hiw-rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.rule-item {
  flex-direction: row;
  align-items: center;
}

@media (max-width: 640px) {
  .hiw-rules {
    grid-template-columns: 1fr;
  }
  .hiw-step {
    padding: 24px 16px;
  }
}

/* 6. Featured Banner */
.featured-title {
  font-size: clamp(24px, 5vw, 48px);
}

.featured-banner {
  padding: 40px 20px;
}

/* 7. Footer Responsiveness */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer-brand .social-links {
    justify-content: center;
  }
  .footer-brand p {
    margin-left: auto;
    margin-right: auto;
  }
}

/* 8. Touch Targets */
button, a, .btn-premium, .nav-link, .social-icon {
  min-height: 44px;
  min-width: 44px;
}

/* 9. Container Max Padding on Mobile */
@media (max-width: 640px) {
  .container-max {
    padding: 0 16px !important;
  }
}

/* 10. News Section */
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
`;

content += '\n' + responsiveCSS;
fs.writeFileSync(file, content);
