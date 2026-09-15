import fs from 'fs';
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add indexes to User
schema = schema.replace(
  'model User {\n  id            String',
  'model User {\n  id            String'
);

function addIndex(modelName, indexStr) {
  const modelRegex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?)(^})`, 'm');
  schema = schema.replace(modelRegex, (match, p1, p2) => {
    if (p1.includes(indexStr)) return match; // Already has it
    return `${p1}  ${indexStr}\n${p2}`;
  });
}

addIndex('User', '@@index([role])\n  @@index([status])\n  @@index([createdAt])');
addIndex('Team', '@@index([createdAt])\n  @@index([isVerified])');
addIndex('Tournament', '@@index([createdAt])\n  @@index([startDate])\n  @@index([region])');
addIndex('Match', '@@index([scheduledAt])\n  @@index([status])\n  @@index([tournamentId])');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Added missing indexes to schema.prisma');
