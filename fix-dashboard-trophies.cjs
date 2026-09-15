const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `trophies: ['<Trophy size={16} color="#ffd700"/>', '<Medal size={16} color="#ffd700"/>', '<Star size={16} color="#ffd700"/>']`,
  `trophies: [<Trophy key="1" size={16} color="#ffd700"/>, <Medal key="2" size={16} color="#ffd700"/>, <Star key="3" size={16} color="#ffd700"/>]`
);

content = content.replace(
  `trophies: ['<Medal size={16} color="#c0c0c0"/>', '<Star size={16} color="#c0c0c0"/>']`,
  `trophies: [<Medal key="1" size={16} color="#c0c0c0"/>, <Star key="2" size={16} color="#c0c0c0"/>]`
);

content = content.replace(
  `trophies: ['<Medal size={16} color="#cd7f32"/>', '<Target size={16} color="#cd7f32"/>']`,
  `trophies: [<Medal key="1" size={16} color="#cd7f32"/>, <Target key="2" size={16} color="#cd7f32"/>]`
);

fs.writeFileSync(file, content);
