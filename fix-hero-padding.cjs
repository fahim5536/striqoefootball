const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// Replace the previous media query update with a more refined one
content = content.replace(/@media \(max-width: 1200px\) \{[\s\S]*?@media \(max-width: 640px\) \{[\s\S]*?\}\n\}/g, '');

const refinedUpdate = `
@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column !important;
    justify-content: center !important;
    padding: 100px 40px 60px !important;
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

@media (max-width: 1024px) {
  .hero-layout {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-text {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-heading {
    text-align: center;
    max-width: 800px !important;
  }
  
  .hero-image-wrapper {
    margin-top: 40px;
    width: 100%;
  }

  .hero-image {
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 20px 40px !important;
  }
}

@media (max-width: 640px) {
  .hero-image {
    max-width: 100%;
  }
  .hero-image-wrapper {
    margin-top: 20px;
  }
  .hero-right-labels {
    flex-direction: column !important;
    align-items: center !important;
    gap: 12px !important;
  }
}
`;

content += refinedUpdate;

fs.writeFileSync(file, content);
