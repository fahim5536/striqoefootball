const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// Replace the incorrect hero-right-labels colors
content = content.replace(/color: #94A3B8;/g, 'color: #E2E8F0;');

// Update media queries for hero section layout
const mediaQueryUpdate = `
@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column !important;
    justify-content: center !important;
    padding-top: 60px !important;
  }
  
  .hero-right-labels {
    position: static !important;
    transform: none !important;
    flex-direction: row !important;
    justify-content: center !important;
    width: 100% !important;
    margin-top: 40px !important;
    gap: 16px !important;
    flex-wrap: wrap !important;
  }
}

@media (max-width: 640px) {
  .hero-right-labels {
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
  }
}
`;

content += mediaQueryUpdate;

fs.writeFileSync(file, content);
