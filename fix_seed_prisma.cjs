const fs = require('fs');

const fixFile = (file) => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('new PrismaClient()')) {
    code = code.replace('const { PrismaClient } = require("@prisma/client");', 'const { PrismaClient } = require("@prisma/client");\nconst { getPrisma } = require("./services.ts");');
    // For ES modules it might be import
    code = code.replace('import { PrismaClient } from "@prisma/client";', 'import { PrismaClient } from "@prisma/client";\nimport { getPrisma } from "./services";');
    
    // Oh wait, `services.ts` is TS. If they run seed scripts with tsx it's fine.
    // Actually, I can just mutate process.env.DATABASE_URL at the top of these files directly for safety!
    const mutate = `
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('-pooler') && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=5';
}
`;
    code = code.replace(/(import .*|const .*require.*)/, "$1\n" + mutate);
    fs.writeFileSync(file, code);
    console.log("Fixed " + file);
  }
};

fixFile('seed_beta_flags.js');
fixFile('seed_open_beta.js');
