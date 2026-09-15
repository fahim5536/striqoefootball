const fs = require('fs');
let code = fs.readFileSync('services.ts', 'utf8');

const replacement = `let prismaClient: PrismaClient | null = null;
export const getPrisma = (): PrismaClient => {
  if (!prismaClient) {
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes("-pooler") && !dbUrl.includes("pgbouncer=true")) {
      dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
      if (!dbUrl.includes("connection_limit")) {
         dbUrl += "&connection_limit=5"; // reduce connection limit on pooler
      }
    }

    prismaClient = new PrismaClient({
      ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    });
  }
  return prismaClient;
};`;

code = code.replace(/let prismaClient: PrismaClient \| null = null;[\s\S]*return prismaClient;\n\};/, replacement);
fs.writeFileSync('services.ts', code);
console.log('Fixed services.ts');
