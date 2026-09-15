const fs = require('fs');
let code = fs.readFileSync('src/components/Profile.tsx', 'utf8');

// Display uiId below the username in Profile hero
code = code.replace(
  '<h1 className="profile-name">{profileData.username || \'Player\'}</h1>',
  '<h1 className="profile-name">{profileData.username || \'Player\'} <span style={{ fontSize: "16px", color: "#00e5ff", marginLeft: "10px", fontWeight: "normal" }}>#{profileData.uiId || "----"}</span></h1>'
);

fs.writeFileSync('src/components/Profile.tsx', code);
console.log('Profile patched');
