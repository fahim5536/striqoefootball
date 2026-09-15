const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Profile.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ Trophy, Swords, History, Image as ImageIcon, Users \} from 'lucide-react';/,
`import { 
  Trophy, Swords, History, Image as ImageIcon, Users, 
  Medal, Star, Crown, Handshake, Gem, Camera, Copy, 
  Gamepad2, Pencil, MessageSquare, BarChart2, Award, 
  Target, CheckCircle2, XCircle, MinusCircle, Check, Lock, Bird 
} from 'lucide-react';`);

// Achievements
content = content.replace(/icon: '⚔️'/g, "icon: <Swords size={20} className=\"inline\" />");
content = content.replace(/icon: '🏅'/g, "icon: <Medal size={20} className=\"inline\" />");
content = content.replace(/icon: '🌟'/g, "icon: <Star size={20} className=\"inline\" />");
content = content.replace(/icon: '🏆'/g, "icon: <Trophy size={20} className=\"inline\" />");
content = content.replace(/icon: '👑'/g, "icon: <Crown size={20} className=\"inline\" />");
content = content.replace(/icon: '🤝'/g, "icon: <Handshake size={20} className=\"inline\" />");

// Divisions
content = content.replace(/'💎 DIAMOND DIV'/g, "'DIAMOND DIV'");
content = content.replace(/'🥇 GOLD DIV'/g, "'GOLD DIV'");
content = content.replace(/'🥈 SILVER DIV'/g, "'SILVER DIV'");

content = content.replace(/💎/g, "<Gem size={16} className=\"inline-block mr-1\" />");
content = content.replace(/🥇/g, "<Medal size={16} className=\"inline-block mr-1\" />");
content = content.replace(/🥈/g, "<Medal size={16} className=\"inline-block mr-1\" />");

// Profile Top
content = content.replace(/>🏆</g, "><Trophy size={24} color=\"#ffd700\" /><");
content = content.replace(/>📷</g, "><Camera size={16} /><");
content = content.replace(/⚽ eFOOTBALL ID:/g, "<Target size={16} className=\"inline-block mr-1\" /> eFOOTBALL ID:");
content = content.replace(/>📋</g, "><Copy size={14} /><");
content = content.replace(/🏟️ CURRENT TEAM:/g, "<Users size={16} className=\"inline-block mr-1\" /> CURRENT TEAM:");
content = content.replace(/✏️ EDIT PROFILE/g, "<Pencil size={14} className=\"inline-block mr-2\" /> EDIT PROFILE");
content = content.replace(/⚔️ CHALLENGE TO MATCH/g, "<Swords size={14} className=\"inline-block mr-2\" /> CHALLENGE TO MATCH");
content = content.replace(/💬 MESSAGE/g, "<MessageSquare size={14} className=\"inline-block mr-2\" /> MESSAGE");
content = content.replace(/TROPHIES 🏆/g, "TROPHIES <Trophy size={16} className=\"inline-block ml-1\" />");

// Tabs
content = content.replace(/>📊 OVERVIEW/g, "><BarChart2 size={16} className=\"inline-block mr-2\" /> OVERVIEW");
content = content.replace(/>🏆 TOURNAMENTS/g, "><Trophy size={16} className=\"inline-block mr-2\" /> TOURNAMENTS");
content = content.replace(/>⚔️ MATCH HISTORY/g, "><History size={16} className=\"inline-block mr-2\" /> MATCH HISTORY");
content = content.replace(/>🎖️ ACHIEVEMENTS/g, "><Award size={16} className=\"inline-block mr-2\" /> ACHIEVEMENTS");

// Cards
content = content.replace(/>🎮 GAMEPLAY STYLE/g, "><Gamepad2 size={16} className=\"inline-block mr-2\" /> GAMEPLAY STYLE");
content = content.replace(/>🎮</g, "><Gamepad2 size={24} /><");
content = content.replace(/>📝 ABOUT/g, "><MessageSquare size={16} className=\"inline-block mr-2\" /> ABOUT");
content = content.replace(/>✏️</g, "><Pencil size={14} /><");
content = content.replace(/>🏆 TOURNAMENT STATS/g, "><Trophy size={16} className=\"inline-block mr-2\" /> TOURNAMENT STATS");
content = content.replace(/>🤝 FRIEND MATCH STATS/g, "><Handshake size={16} className=\"inline-block mr-2\" /> FRIEND MATCH STATS");
content = content.replace(/>📊 GLOBAL RANKING/g, "><BarChart2 size={16} className=\"inline-block mr-2\" /> GLOBAL RANKING");
content = content.replace(/>🏆 TOURNAMENT HISTORY/g, "><Trophy size={16} className=\"inline-block mr-2\" /> TOURNAMENT HISTORY");
content = content.replace(/>🏟️</g, "><Users size={20} /><");

content = content.replace(/'🏆 '/g, "<Trophy size={14} className=\"inline-block mr-1\" color=\"#ffd700\" /> ");
content = content.replace(/>👑 CHAMPION/g, "><Crown size={14} className=\"inline-block mr-1\" /> CHAMPION");

content = content.replace(/'🟢 Win'/g, "<><CheckCircle2 size={14} className=\"inline-block mr-1\" color=\"#22c55e\" /> Win</>");
content = content.replace(/'🔴 Loss'/g, "<><XCircle size={14} className=\"inline-block mr-1\" color=\"#ff2d55\" /> Loss</>");
content = content.replace(/'🟡 Draw'/g, "<><MinusCircle size={14} className=\"inline-block mr-1\" color=\"#eab308\" /> Draw</>");

content = content.replace(/>⚔️</g, "><Swords size={20} /><");

content = content.replace(/icon: '✅'/g, "icon: <CheckCircle2 size={18} />");
content = content.replace(/icon: '❌'/g, "icon: <XCircle size={18} />");
content = content.replace(/icon: '🤝'/g, "icon: <Handshake size={18} />");

content = content.replace(/>🏆 TOURNAMENT</g, "><Trophy size={12} className=\"inline-block mr-1\" /> TOURNAMENT");
content = content.replace(/>🤝 FRIENDLY</g, "><Handshake size={12} className=\"inline-block mr-1\" /> FRIENDLY");

content = content.replace(/>🏆 TROPHY BADGES/g, "><Trophy size={16} className=\"inline-block mr-2\" /> TROPHY BADGES");
content = content.replace(/>🎖️ ACHIEVEMENTS/g, "><Award size={16} className=\"inline-block mr-2\" /> ACHIEVEMENTS");

content = content.replace(/>🔒</g, "><Lock size={24} color=\"#475569\" /><");
content = content.replace(/>✅</g, "><Check size={24} color=\"#22c55e\" /><");

content = content.replace(/>🖼️ AVATAR COLLECTION/g, "><ImageIcon size={16} className=\"inline-block mr-2\" /> AVATAR COLLECTION");
content = content.replace(/emoji: '⚽'/g, "emoji: <Target size={24} />");
content = content.replace(/emoji: '🦅'/g, "emoji: <Bird size={24} />");
content = content.replace(/>✅ OWNED/g, "><Check size={14} className=\"inline-block mr-1\" /> OWNED");

fs.writeFileSync(file, content);
