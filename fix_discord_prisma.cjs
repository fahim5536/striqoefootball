const fs = require('fs');
let discordCode = fs.readFileSync('discord.ts', 'utf8');

discordCode = discordCode.replace('import { PrismaClient } from "@prisma/client";', 'import { PrismaClient } from "@prisma/client";\nimport { getPrisma } from "./services";');
discordCode = discordCode.replace(/const prisma = new PrismaClient\(\{\s*log:\s*\['error'\]\s*\}\);/, 'const prisma = getPrisma();');
fs.writeFileSync('discord.ts', discordCode);
console.log("Fixed discord.ts");
