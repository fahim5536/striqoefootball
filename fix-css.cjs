const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// Remove the inline display:none !important rule in media query
content = content.replace(/\s*\.hero-right-labels\s*\{\s*display:\s*none\s*!important;\s*\/\*\s*Hide decorative right labels on small screens\s*\*\/\s*\}/g, '');

const newStyles = `
/* Hero Right Labels */
.hero-right-labels {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-end;
  z-index: 1;
}

.hero-label-item {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94A3B8;
}

.hero-label-item.active {
  color: #ffffff;
}

.hero-label-dot {
  color: #94A3B8;
}

.hero-label-line {
  display: inline-block;
  width: 24px;
  height: 1px;
  background: #ffffff;
}

@media (max-width: 1200px) {
  .hero-right-labels {
    position: static;
    transform: none;
    flex-direction: row;
    justify-content: center;
    width: 100%;
    margin-top: 40px;
    gap: 16px;
    flex-wrap: wrap;
  }
}
@media (max-width: 640px) {
  .hero-right-labels {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}
`;

content += newStyles;

fs.writeFileSync(file, content);
