import fs from 'fs';

let code = fs.readFileSync('src/components/Profile.tsx', 'utf8');

code = code.replace(
  `<h1 className="profile-name" id="profileName">{profileData.username || profileData.name || 'Unknown'}</h1>`,
  `<h1 className="profile-name" id="profileName" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {profileData.username || profileData.name || 'Unknown'}
                  {profileData.isBetaUser && (
                    <span style={{ fontSize: '12px', padding: '2px 6px', background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BETA</span>
                  )}
                </h1>`
);

fs.writeFileSync('src/components/Profile.tsx', code);
