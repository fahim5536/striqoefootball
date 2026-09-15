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
    const hasLucide = content.includes("'lucide-react'");
    if (!hasLucide) {
      content = `import { ${imports.join(', ')} } from 'lucide-react';\n` + content;
    }
  }

  fs.writeFileSync(filePath, content);
}

replaceInFile('AdminBetaManagement.tsx', [
  { from: "📊 Beta Dashboard", to: "<BarChart2 size={24} className=\"inline-block mr-2\" /> Beta Dashboard" },
  { from: "🎟️ Generate Beta Invitation", to: "<Ticket size={24} className=\"inline-block mr-2\" /> Generate Beta Invitation" },
  { from: "🔑 Active Invitations", to: "<Key size={24} className=\"inline-block mr-2\" /> Active Invitations" },
  { from: "👥 Beta Users", to: "<Users size={24} className=\"inline-block mr-2\" /> Beta Users" }
], ['BarChart2', 'Ticket', 'Key', 'Users']);

replaceInFile('AdminLogs.tsx', [
  { from: "📋 ACTIVITY LOGS", to: "<ClipboardList size={24} className=\"inline-block mr-2\" /> ACTIVITY LOGS" },
  { from: "l.type === 'match' ? '⚔️' : l.type === 'tournament' ? '🏆' : l.type === 'player' ? '👤' : '⚙️'", 
    to: "l.type === 'match' ? <Swords size={16} /> : l.type === 'tournament' ? <Trophy size={16} /> : l.type === 'player' ? <User size={16} /> : <Settings size={16} />" }
], ['ClipboardList', 'Swords', 'Trophy', 'User', 'Settings']);

replaceInFile('AdminPartners.tsx', [
  { from: "🤝 PARTNERS MANAGER", to: "<Handshake size={24} className=\"inline-block mr-2\" /> PARTNERS MANAGER" },
  { from: ">✕<", to: "><X size={20} /><" },
  { from: ">🖼️<", to: "><ImageIcon size={32} /><" },
  { from: "✕ Remove Logo", to: "<X size={14} className=\"inline-block mr-1\" /> Remove Logo" },
  { from: "💡 If no", to: "<Lightbulb size={14} className=\"inline-block mr-1 text-yellow-400\" /> If no" },
  { from: "'👁️'", to: "<><Eye size={16} /></>" },
  { from: "'🙈'", to: "<><EyeOff size={16} /></>" },
  { from: ">✏️<", to: "><Pencil size={16} /><" },
  { from: ">🗑️<", to: "><Trash2 size={16} /><" }
], ['Handshake', 'X', 'Image as ImageIcon', 'Lightbulb', 'Eye', 'EyeOff', 'Pencil', 'Trash2']);

replaceInFile('AdminAnalytics.tsx', [
  { from: "📈 User Growth", to: "<LineChart size={24} className=\"inline-block mr-2\" /> User Growth" },
  { from: "🧠 Audit & Operational Insights", to: "<Brain size={24} className=\"inline-block mr-2\" /> Audit & Operational Insights" },
  { from: ">👥<", to: "><Users size={20} /><" },
  { from: ">🏆<", to: "><Trophy size={20} /><" }
], ['LineChart', 'Brain', 'Users', 'Trophy']);

replaceInFile('EditProfileModal.tsx', [
  { from: "✏️ EDIT PROFILE", to: "<Pencil size={24} className=\"inline-block mr-2\" /> EDIT PROFILE" },
  { from: ">✕<", to: "><X size={20} /><" },
  { from: ">👤<", to: "><User size={40} /><" },
  { from: "📸 Drop or click to upload", to: "<Camera size={16} className=\"inline-block mr-2\" /> Drop or click to upload" },
  { from: "💾 SAVE CHANGES", to: "<Save size={16} className=\"inline-block mr-2\" /> SAVE CHANGES" }
], ['Pencil', 'X', 'User', 'Camera', 'Save']);

replaceInFile('AdminNewsManager.tsx', [
  { from: "📰 NEWS MANAGER", to: "<Newspaper size={32} className=\"inline-block mr-2\" /> NEWS MANAGER" },
  { from: ">✕<", to: "><X size={18} /><" }
], ['Newspaper', 'X']);

replaceInFile('Profile.tsx', [
  { from: "match.tournamentId ? '🏆 TOURNAMENT' : '🤝 FRIENDLY'", 
    to: "match.tournamentId ? <><Trophy size={14} className=\"inline-block mr-1\"/> TOURNAMENT</> : <><Handshake size={14} className=\"inline-block mr-1\"/> FRIENDLY</>" }
], []);

console.log('Remaining files upgraded');
