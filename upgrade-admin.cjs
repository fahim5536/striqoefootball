const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components');

function replaceInFile(fileName, replacements, imports) {
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const { from, to } of replacements) {
    if (typeof from === 'string') {
      content = content.split(from).join(to);
    } else {
      content = content.replace(from, to);
    }
  }

  if (imports.length > 0) {
    // Add imports if they don't exist
    const hasLucide = content.includes("'lucide-react'");
    if (hasLucide) {
      // Very naive addition to existing lucide import, 
      // better to just add a new import line at the top
      content = `import { ${imports.join(', ')} } from 'lucide-react';\n` + content;
    } else {
      content = `import { ${imports.join(', ')} } from 'lucide-react';\n` + content;
    }
  }

  fs.writeFileSync(filePath, content);
}

// Admin.tsx
replaceInFile('Admin.tsx', [
  { from: "'🔓'", to: "<Unlock size={16} />" },
  { from: "'🔒'", to: "<Lock size={16} />" },
  { from: "'🙈'", to: "<EyeOff size={16} />" },
  { from: "'👁️'", to: "<Eye size={16} />" },
  { from: "❌ Incorrect password", to: "<XCircle size={16} className=\"inline-block mr-2\" /> Incorrect password" },
  { from: "🔒 Too many attempts.", to: "<Lock size={16} className=\"inline-block mr-2\" /> Too many attempts." },
  { from: "⚠️ <span>", to: "<AlertTriangle size={16} className=\"inline-block mr-2 text-yellow-500\" /> <span>" },
  { from: "👑", to: "<Crown size={32} />" },
  { from: ">📊<", to: "><BarChart2 size={18} /><" },
  { from: ">🏆<", to: "><Trophy size={18} /><" },
  { from: ">⚔️<", to: "><Swords size={18} /><" },
  { from: ">⚠️<", to: "><AlertTriangle size={18} /><" },
  { from: ">🌿<", to: "><GitBranch size={18} /><" },
  { from: ">👥<", to: "><Users size={18} /><" },
  { from: ">🚫<", to: "><Ban size={18} /><" },
  { from: ">📰<", to: "><Newspaper size={18} /><" },
  { from: ">🖼️<", to: "><ImageIcon size={18} /><" },
  { from: ">🤝<", to: "><Handshake size={18} /><" },
  { from: ">🔔<", to: "><Bell size={18} /><" },
  { from: ">⚙️<", to: "><Settings size={18} /><" },
  { from: ">📋<", to: "><ClipboardList size={18} /><" },
  { from: ">🚩<", to: "><Flag size={18} /><" },
  { from: ">🎛️<", to: "><Sliders size={18} /><" },
  { from: ">💬<", to: "><MessageSquare size={18} /><" },
  { from: ">🧪<", to: "><FlaskConical size={18} /><" },
  { from: "🚪 LOGOUT", to: "<LogOut size={16} className=\"inline-block mr-2\" /> LOGOUT" },
  { from: "🔒 SECURE SESSION", to: "<Lock size={16} className=\"inline-block mr-2\" /> SECURE SESSION" },
], ['Unlock', 'Lock', 'EyeOff', 'Eye', 'XCircle', 'AlertTriangle', 'Crown', 'BarChart2', 'Trophy', 'Swords', 'GitBranch', 'Users', 'Ban', 'Newspaper', 'Image as ImageIcon', 'Handshake', 'Bell', 'Settings', 'ClipboardList', 'Flag', 'Sliders', 'MessageSquare', 'FlaskConical', 'LogOut']);

// AdminBans.tsx
replaceInFile('AdminBans.tsx', [
  { from: "🚫 BANNED PLAYERS", to: "<Ban size={24} className=\"inline-block mr-2\" /> BANNED PLAYERS" }
], ['Ban']);

// AdminCoins.tsx
replaceInFile('AdminCoins.tsx', [
  { from: "➕ Add", to: "<Plus size={16} className=\"inline-block mr-2\" /> Add" },
  { from: "➖ Deduct", to: "<Minus size={16} className=\"inline-block mr-2\" /> Deduct" },
  { from: "⚡ BULK AWARD", to: "<Zap size={16} className=\"inline-block mr-2\" /> BULK AWARD" }
], ['Plus', 'Minus', 'Zap']);

// AdminDashboard.tsx
replaceInFile('AdminDashboard.tsx', [
  { from: ">🏆<", to: "><Trophy size={24} /><" },
  { from: ">⚔️<", to: "><Swords size={24} /><" },
  { from: ">👥<", to: "><Users size={24} /><" },
  { from: ">⚠️<", to: "><AlertTriangle size={24} /><" },
  { from: "⚡ QUICK ACTIONS", to: "<Zap size={18} className=\"inline-block mr-2\" /> QUICK ACTIONS" },
  { from: "<span>🏆</span> Create Tournament", to: "<span><Trophy size={16} /></span> Create Tournament" },
  { from: "<span>⚔️</span> Assign Match", to: "<span><Swords size={16} /></span> Assign Match" },
  { from: "<span>⚠️</span> Review Disputes", to: "<span><AlertTriangle size={16} /></span> Review Disputes" },
  { from: "<span>🔔</span> Send Alert", to: "<span><Bell size={16} /></span> Send Alert" },
  { from: "<span>📰</span> Write News", to: "<span><Newspaper size={16} /></span> Write News" },
  { from: "📋 RECENT ACTIVITY", to: "<ClipboardList size={18} className=\"inline-block mr-2\" /> RECENT ACTIVITY" }
], ['Trophy', 'Swords', 'Users', 'AlertTriangle', 'Zap', 'Bell', 'Newspaper', 'ClipboardList']);

// AdminGallery.tsx
replaceInFile('AdminGallery.tsx', [
  { from: "🖼️ GALLERY MANAGER", to: "<ImageIcon size={24} className=\"inline-block mr-2\" /> GALLERY MANAGER" }
], ['Image as ImageIcon']);

// AdminMatches.tsx
replaceInFile('AdminMatches.tsx', [
  { from: "⚔️ ASSIGN NEW MATCH", to: "<Swords size={24} className=\"inline-block mr-2\" /> ASSIGN NEW MATCH" },
  { from: "⚔️ ASSIGN MATCH & NOTIFY PLAYERS", to: "<Swords size={18} className=\"inline-block mr-2\" /> ASSIGN MATCH & NOTIFY PLAYERS" },
  { from: "📋 ALL MATCHES", to: "<ClipboardList size={24} className=\"inline-block mr-2\" /> ALL MATCHES" },
  { from: "'🟡'", to: "<><AlertCircle size={16} className=\"inline-block mr-1 text-yellow-500\" /></>" },
  { from: "'✅'", to: "<><CheckCircle2 size={16} className=\"inline-block mr-1 text-green-500\" /></>" },
  { from: "'🔴'", to: "<><XCircle size={16} className=\"inline-block mr-1 text-red-500\" /></>" }
], ['Swords', 'ClipboardList', 'CheckCircle2', 'XCircle', 'AlertCircle']);

// AdminNotifications.tsx
replaceInFile('AdminNotifications.tsx', [
  { from: "🔔 NOTIFICATION MANAGER", to: "<Bell size={24} className=\"inline-block mr-2\" /> NOTIFICATION MANAGER" },
  { from: "📢 NEW NOTIFICATION", to: "<Megaphone size={16} className=\"inline-block mr-2\" /> NEW NOTIFICATION" },
  { from: "👥 All Players", to: "<Users size={16} className=\"inline-block mr-2\" /> All Players" },
  { from: "🏆 Tournament Players", to: "<Trophy size={16} className=\"inline-block mr-2\" /> Tournament Players" },
  { from: "👤 Single Player", to: "<User size={16} className=\"inline-block mr-2\" /> Single Player" },
  { from: "⚠️ Warning", to: "<AlertTriangle size={16} className=\"inline-block mr-2\" /> Warning" },
  { from: "✅ Good News", to: "<CheckCircle2 size={16} className=\"inline-block mr-2\" /> Good News" },
  { from: "🚨 Urgent", to: "<Siren size={16} className=\"inline-block mr-2\" /> Urgent" },
  { from: "⚔️ Match Assigned", to: "<Swords size={16} className=\"inline-block mr-2\" /> Match Assigned" },
  { from: "🏆 Tournament Starting", to: "<Trophy size={16} className=\"inline-block mr-2\" /> Tournament Starting" },
  { from: "🔔 SEND NOTIFICATION", to: "<Bell size={16} className=\"inline-block mr-2\" /> SEND NOTIFICATION" }
], ['Bell', 'Megaphone', 'Users', 'Trophy', 'User', 'AlertTriangle', 'CheckCircle2', 'Siren', 'Swords']);

// AdminPlayers.tsx
replaceInFile('AdminPlayers.tsx', [
  { from: "👥 ALL PLAYERS", to: "<Users size={24} className=\"inline-block mr-2\" /> ALL PLAYERS" },
  { from: "🔍 Search by name or ID...", to: "Search by name or ID..." },
  { from: ">✕<", to: "><X size={20} /><" },
  { from: "🏆 Award Badge", to: "<Award size={16} className=\"inline-block mr-2\" /> Award Badge" },
  { from: "🔔 Send Notification", to: "<Bell size={16} className=\"inline-block mr-2\" /> Send Notification" },
  { from: "⚠️ Issue Warning", to: "<AlertTriangle size={16} className=\"inline-block mr-2\" /> Issue Warning" },
  { from: "✅ Unban Player", to: "<CheckCircle2 size={16} className=\"inline-block mr-2\" /> Unban Player" },
  { from: "🚫 Ban Player", to: "<Ban size={16} className=\"inline-block mr-2\" /> Ban Player" }
], ['Users', 'X', 'Award', 'Bell', 'AlertTriangle', 'CheckCircle2', 'Ban']);

// AdminSettings.tsx
replaceInFile('AdminSettings.tsx', [
  { from: "⚙️ SITE SETTINGS", to: "<Settings size={24} className=\"inline-block mr-2\" /> SITE SETTINGS" },
  { from: "📢 ANNOUNCEMENT BANNER", to: "<Megaphone size={16} className=\"inline-block mr-2\" /> ANNOUNCEMENT BANNER" },
  { from: "e.g. 🏆 Striqo Cup #5 is now open!", to: "e.g. Striqo Cup #5 is now open!" },
  { from: "🔧 MAINTENANCE MODE", to: "<Wrench size={16} className=\"inline-block mr-2\" /> MAINTENANCE MODE" },
  { from: "👤 REGISTRATION", to: "<UserPlus size={16} className=\"inline-block mr-2\" /> REGISTRATION" },
  { from: "📱 SOCIAL LINKS", to: "<Smartphone size={16} className=\"inline-block mr-2\" /> SOCIAL LINKS" }
], ['Settings', 'Megaphone', 'Wrench', 'UserPlus', 'Smartphone']);

// AdminTournaments.tsx
replaceInFile('AdminTournaments.tsx', [
  { from: "💾 Save Draft", to: "<Save size={16} className=\"inline-block mr-2\" /> Save Draft" },
  { from: "🚀 Create & Activate", to: "<Rocket size={16} className=\"inline-block mr-2\" /> Create & Activate" }
], ['Save', 'Rocket']);

// Tournament.tsx
replaceInFile('Tournament.tsx', [
  { from: ">🎮<", to: "><Gamepad2 size={64} /><" }
], ['Gamepad2']);

console.log('Admin icons upgraded');
