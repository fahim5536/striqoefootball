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

replaceInFile('AdminNewsManager.tsx', [
  { from: ">🖼️<", to: "><ImageIcon size={24} /><" },
  { from: "✕ Remove", to: "<X size={14} className=\"inline-block mr-1\" /> Remove" },
  { from: "📌 Pin this post", to: "<Pin size={14} className=\"inline-block mr-1\" /> Pin this post" },
  { from: "⏳ SAVING...", to: "<Loader2 size={14} className=\"inline-block mr-1 animate-spin\" /> SAVING..." },
  { from: "💾 SAVE AS DRAFT", to: "<Save size={14} className=\"inline-block mr-1\" /> SAVE AS DRAFT" },
  { from: "⏳ PUBLISHING...", to: "<Loader2 size={14} className=\"inline-block mr-1 animate-spin\" /> PUBLISHING..." },
  { from: "🚀 PUBLISH NOW", to: "<Send size={14} className=\"inline-block mr-1\" /> PUBLISH NOW" },
  { from: "✅ PUBLISHED", to: "<CheckCircle2 size={14} className=\"inline-block mr-2\" /> PUBLISHED" },
  { from: ">📌<", to: "><Pin size={14} /><" },
  { from: "✏️ Edit", to: "<Pencil size={14} className=\"inline-block mr-1\" /> Edit" },
  { from: "📥 Unpublish", to: "<Archive size={14} className=\"inline-block mr-1\" /> Unpublish" },
  { from: "'📌 Unpin'", to: "<><PinOff size={14} className=\"inline-block mr-1\" /> Unpin</>" },
  { from: "'📌 Pin'", to: "<><Pin size={14} className=\"inline-block mr-1\" /> Pin</>" },
  { from: ">🗑️<", to: "><Trash2 size={14} /><" },
  { from: "📝 DRAFTS", to: "<FileEdit size={14} className=\"inline-block mr-2\" /> DRAFTS" },
  { from: "🚀 Publish", to: "<Send size={14} className=\"inline-block mr-1\" /> Publish" }
], ['Image as ImageIcon', 'X', 'Pin', 'Loader2', 'Save', 'Send', 'CheckCircle2', 'Pencil', 'Archive', 'PinOff', 'Trash2', 'FileEdit']);

replaceInFile('Bracket.tsx', [
  { from: "🏆", to: "<Trophy size={16} color=\"#ffd700\" />" },
  { from: ">✕<", to: "><X size={20} /><" }
], ['Trophy', 'X']);

replaceInFile('AdminMetrics.tsx', [
  { from: "🖥️ System Health", to: "<Server size={24} className=\"inline-block mr-2\" /> System Health" },
  { from: "⚡ API Latency (ms)", to: "<Activity size={24} className=\"inline-block mr-2\" /> API Latency (ms)" },
  { from: "🧠 Memory Usage (MB)", to: "<Cpu size={24} className=\"inline-block mr-2\" /> Memory Usage (MB)" },
  { from: "📋 Raw Metric Logs", to: "<FileText size={24} className=\"inline-block mr-2\" /> Raw Metric Logs" }
], ['Server', 'Activity', 'Cpu', 'FileText']);

replaceInFile('AdminDisputes.tsx', [
  { from: "⚠️ ACTIVE DISPUTES", to: "<AlertTriangle size={24} className=\"inline-block mr-2\" /> ACTIVE DISPUTES" },
  { from: "✅ Award Win", to: "<CheckCircle2 size={16} className=\"inline-block mr-2\" /> Award Win" },
  { from: "❌ Cancel Match", to: "<XCircle size={16} className=\"inline-block mr-2\" /> Cancel Match" }
], ['AlertTriangle', 'CheckCircle2', 'XCircle']);

replaceInFile('AdminSOC.tsx', [
  { from: "🛡️ Security Operations Center (SOC)", to: "<ShieldAlert size={24} className=\"inline-block mr-2\" /> Security Operations Center (SOC)" }
], ['ShieldAlert']);

replaceInFile('AdminBracket.tsx', [
  { from: "🌿 BRACKET MANAGER", to: "<GitBranch size={24} className=\"inline-block mr-2\" /> BRACKET MANAGER" }
], ['GitBranch']);

replaceInFile('TournamentDetails.tsx', [
  { from: "'❌ ELIMINATED'", to: "<><XCircle size={14} className=\"inline-block mr-1\" /> ELIMINATED</>" },
  { from: "'⚠️ WARNING'", to: "<><AlertTriangle size={14} className=\"inline-block mr-1\" /> WARNING</>" },
  { from: "'🟢 ACTIVE'", to: "<><CheckCircle2 size={14} className=\"inline-block mr-1\" /> ACTIVE</>" },
  { from: ">🚧<", to: "><Construction size={24} /><" }
], ['XCircle', 'AlertTriangle', 'CheckCircle2', 'Construction']);

replaceInFile('AdminReports.tsx', [
  { from: "📊 Overview", to: "<BarChart2 size={24} className=\"inline-block mr-2\" /> Overview" },
  { from: "🎮 Popular Games", to: "<Gamepad2 size={24} className=\"inline-block mr-2\" /> Popular Games" }
], ['BarChart2', 'Gamepad2']);

replaceInFile('AdminBackups.tsx', [
  { from: "💾 Backup & Disaster Recovery", to: "<Save size={24} className=\"inline-block mr-2\" /> Backup & Disaster Recovery" },
  { from: "'✅'", to: "<CheckCircle2 size={16} color=\"#22c55e\" />" },
  { from: "'❌'", to: "<XCircle size={16} color=\"#ff2d55\" />" }
], ['Save', 'CheckCircle2', 'XCircle']);

replaceInFile('Match.tsx', [
  { from: ">👤<", to: "><User size={40} /><" },
  { from: "'👤'", to: "<User size={40} />" }
], ['User']);

replaceInFile('NewsSection.tsx', [
  { from: "icon: '📢'", to: "icon: <Megaphone size={16} />" },
  { from: "icon: '🏆'", to: "icon: <Trophy size={16} />" },
  { from: "icon: '🎮'", to: "icon: <Gamepad2 size={16} />" },
  { from: "icon: '📣'", to: "icon: <Megaphone size={16} />" },
  { from: ">📰<", to: "><Newspaper size={48} /><" },
  { from: "📌 PINNED", to: "<Pin size={14} className=\"inline-block mr-2\" /> PINNED" },
  { from: ">✕<", to: "><X size={24} /><" },
  { from: "|| '📢'", to: "|| <Megaphone size={16} />" }
], ['Megaphone', 'Trophy', 'Gamepad2', 'Newspaper', 'Pin', 'X']);

// Also need to fix AdminNotifications.tsx string assignment
replaceInFile('AdminNotifications.tsx', [
  { from: "setMessage(\"⚔️ Your next match", to: "setMessage(\"Your next match" },
  { from: "setMessage(\"🏆 A new tournament", to: "setMessage(\"A new tournament" }
], []);

console.log('Misc files upgraded');
