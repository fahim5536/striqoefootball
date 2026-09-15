const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Navbar.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the CTA button explicitly using regex to handle variations in attributes
content = content.replace(/<button style=\{\{[\s\S]*?JOIN NOW\s*<\/button>/, `<button className="premium-cta-btn" onClick={() => setActiveModal('signup')}>JOIN NOW</button>`);

fs.writeFileSync(file, content);
