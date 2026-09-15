import { PrismaClient } from '@prisma/client';

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('-pooler') && !process.env.DATABASE_URL.includes('pgbouncer=true')) {
  process.env.DATABASE_URL += (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=5';
}

const prisma = new PrismaClient();

async function main() {
  const flags = [
    { key: 'BETA_ONLY', name: 'Closed Beta Registration', description: 'Restricts registration to users with valid beta codes', type: 'GLOBAL', isEnabled: false },
    { key: 'BETA_FEEDBACK', name: 'Show Feedback Button', description: 'Show the feedback button for users to report bugs', type: 'GLOBAL', isEnabled: true },
    { key: 'CREATE_TOURNAMENTS', name: 'Create Tournaments', description: 'Allows tournament creation', type: 'ADMIN_ONLY', isEnabled: true },
  ];

  for (const f of flags) {
    const existing = await prisma.featureFlag.findUnique({ where: { key: f.key } });
    if (existing) {
      await prisma.featureFlag.update({
        where: { key: f.key },
        data: { isEnabled: f.isEnabled, type: f.type }
      });
    } else {
      await prisma.featureFlag.create({ data: f });
    }
  }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
