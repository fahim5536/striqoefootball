const fs = require('fs');
const path = require('path');

const replacements = [
  // Dashboard.tsx
  { file: 'src/components/Dashboard.tsx', from: "🏆', '🥇', '🌟'", to: "<Trophy size={16} color=\"#ffd700\"/>', '<Medal size={16} color=\"#ffd700\"/>', '<Star size={16} color=\"#ffd700\"/>'" },
  { file: 'src/components/Dashboard.tsx', from: "🥈', '⭐'", to: "<Medal size={16} color=\"#c0c0c0\"/>', '<Star size={16} color=\"#c0c0c0\"/>'" },
  { file: 'src/components/Dashboard.tsx', from: "🥉', '🎯'", to: "<Medal size={16} color=\"#cd7f32\"/>', '<Target size={16} color=\"#cd7f32\"/>'" },
  { file: 'src/components/Dashboard.tsx', from: "🏆 STRIQO CUP", to: "<Trophy size={16} className=\"inline-block mr-2\" /> STRIQO CUP" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"stat-icon\">🏆</span>", to: "<span className=\"stat-icon\"><Trophy size={24} /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"stat-icon\">⚽</span>", to: "<span className=\"stat-icon\"><Activity size={24} /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"stat-icon\">👥</span>", to: "<span className=\"stat-icon\"><Users size={24} /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"stat-icon\">🎮</span>", to: "<span className=\"stat-icon\"><Gamepad2 size={24} /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "📸", to: "<Camera size={24} color=\"#00e5ff\" />" },
  { file: 'src/components/Dashboard.tsx', from: ">✕<", to: "><X size={24} /><" },
  { file: 'src/components/Dashboard.tsx', from: "<div className=\"step-icon\">👤</div>", to: "<div className=\"step-icon\"><User size={28} /></div>" },
  { file: 'src/components/Dashboard.tsx', from: "<div className=\"step-icon\">🏟️</div>", to: "<div className=\"step-icon\"><Gamepad2 size={28} /></div>" },
  { file: 'src/components/Dashboard.tsx', from: "<div className=\"step-icon\">⚔️</div>", to: "<div className=\"step-icon\"><Swords size={28} /></div>" },
  { file: 'src/components/Dashboard.tsx', from: "<div className=\"step-icon\">🏆</div>", to: "<div className=\"step-icon\"><Trophy size={28} /></div>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"rule-icon\">🟢</span>", to: "<span className=\"rule-icon\"><CheckCircle2 size={20} color=\"#22c55e\" /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"rule-icon\">🟡</span>", to: "<span className=\"rule-icon\"><MinusCircle size={20} color=\"#eab308\" /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"rule-icon\">🔴</span>", to: "<span className=\"rule-icon\"><XCircle size={20} color=\"#ff2d55\" /></span>" },
  { file: 'src/components/Dashboard.tsx', from: "<span className=\"rule-icon\">📸</span>", to: "<span className=\"rule-icon\"><Camera size={20} color=\"#00e5ff\" /></span>" },
];

for (const { file, from, to } of replacements) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(from, to);
    fs.writeFileSync(filePath, content);
  }
}
console.log('Done');
