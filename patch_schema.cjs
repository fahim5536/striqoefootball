const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(
  'discordId       String? @unique',
  'discordId       String? @unique\n  uiId            String? @unique'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('patched');
