const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace the PrismaClient import and initialization in server.ts
// The import might be: import { PrismaClient } from "@prisma/client";
// We want to add: import { getPrisma } from "./services"; if not there
if (!serverCode.includes('import { getPrisma }')) {
   serverCode = serverCode.replace('import { PrismaClient } from "@prisma/client";', 'import { PrismaClient } from "@prisma/client";\nimport { getPrisma } from "./services";');
}

// The init is:
// const prisma = new PrismaClient({
//   log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
// });
const targetInit = `const prisma = new PrismaClient({
  log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});`;

if (serverCode.includes(targetInit)) {
  serverCode = serverCode.replace(targetInit, `const prisma = getPrisma();`);
  console.log("Replaced in server.ts");
} else {
  // Try regex
  const regex = /const prisma = new PrismaClient\(\{\s*log: [^}]+\}\);/m;
  if (regex.test(serverCode)) {
    serverCode = serverCode.replace(regex, `const prisma = getPrisma();`);
    console.log("Replaced in server.ts via regex");
  } else {
    console.log("Could not find Prisma initialization in server.ts");
  }
}

fs.writeFileSync('server.ts', serverCode);
