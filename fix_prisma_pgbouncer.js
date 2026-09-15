const fs = require('fs');
let code = fs.readFileSync('services.ts', 'utf8');

const replacement = `let prismaClient: PrismaClient | null = null;
export const getPrisma = (): PrismaClient => {
  if (!prismaClient) {
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes("-pooler") && !dbUrl.includes("pgbouncer=true")) {
      dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
    }

    prismaClient = new PrismaClient({
      ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    });
  }
  return prismaClient;
};`;

code = code.replace(/let prismaClient[\s\S]*return prismaClient;\n\};\n?/, replacement + "\n");
fs.writeFileSync('services.ts', code);
console.log('Fixed services.ts');
