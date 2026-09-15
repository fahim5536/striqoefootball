const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="gallery-grid">[\s\S]*?\{\/\* How It Works Section \*\/\}/;
content = content.replace(regex, `<PremiumGallery images={galleryImages} />
        </div>
      </section>

      {/* How It Works Section */}`);

content = content.replace(/<div className="gallery-subtitle">TOURNAMENT MOMENTS<\/div>/, '<div className="gallery-subtitle">THE MOMENTS THAT DEFINE THE COMPETITION</div>');

fs.writeFileSync(file, content);
