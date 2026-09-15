const { PrismaClient } = require('@prisma/client');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('-pooler') && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=5';
}

const prisma = new PrismaClient();

async function main() {
  const flags = [
    { key: 'BETA_ONLY', name: 'Beta Only Registration', description: 'Restricts registration to users with valid beta codes', type: 'GLOBAL', isEnabled: true },
    { key: 'AI_FEATURES', name: 'AI Features', description: 'Allows usage of AI Match Analysis and OCR', type: 'BETA_ONLY', isEnabled: true },
    { key: 'CREATE_TOURNAMENTS', name: 'Create Tournaments', description: 'Allows tournament creation', type: 'ADMIN_ONLY', isEnabled: true },
  ];

  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: f
    });
  }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
