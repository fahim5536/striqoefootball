import fs from 'fs';

let code = fs.readFileSync('services.ts', 'utf8');

const prismaImport = `import { PrismaClient } from "@prisma/client";\n`;

const getPrisma = `
let prismaClient: PrismaClient | null = null;
export const getPrisma = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      // We can tune connection pool via DATABASE_URL or uncomment logs
      // log: ['error', 'warn']
    });
  }
  return prismaClient;
};
`;

if (!code.includes("getPrisma")) {
  code = prismaImport + code + getPrisma;
  fs.writeFileSync('services.ts', code);
  console.log('Prisma service added');
} else {
  console.log('Prisma service already exists');
}

// Now replace new PrismaClient() with getPrisma() in server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
if (!serverCode.includes("getPrisma")) {
  serverCode = serverCode.replace("import { PrismaClient } from \"@prisma/client\";", "import { getPrisma } from \"./services\";");
  serverCode = serverCode.replace("const prisma = new PrismaClient();", "const prisma = getPrisma();");
  fs.writeFileSync('server.ts', serverCode);
  console.log('server.ts updated to use getPrisma()');
}

// Now replace in search.service.ts
let searchCode = fs.readFileSync('src/lib/search.service.ts', 'utf8');
if (!searchCode.includes("getPrisma")) {
  searchCode = searchCode.replace("import { PrismaClient } from \"@prisma/client\";", "");
  searchCode = searchCode.replace("import { getRedis } from \"../../services\";", "import { getRedis, getPrisma } from \"../../services\";");
  searchCode = searchCode.replace("const prisma = new PrismaClient();", "const prisma = getPrisma();");
  fs.writeFileSync('src/lib/search.service.ts', searchCode);
  console.log('search.service.ts updated');
}

// Now replace in recommendation.service.ts
let recCode = fs.readFileSync('src/lib/recommendation.service.ts', 'utf8');
if (!recCode.includes("getPrisma")) {
  recCode = recCode.replace("import { PrismaClient } from \"@prisma/client\";", "");
  recCode = recCode.replace("import { getRedis } from \"../../services\";", "import { getRedis, getPrisma } from \"../../services\";");
  recCode = recCode.replace("const prisma = new PrismaClient();", "const prisma = getPrisma();");
  fs.writeFileSync('src/lib/recommendation.service.ts', recCode);
  console.log('recommendation.service.ts updated');
}

// Replace in startup-validation.ts
let startupCode = fs.readFileSync('src/lib/startup-validation.ts', 'utf8');
if (!startupCode.includes("getPrisma")) {
  startupCode = startupCode.replace("import { PrismaClient } from \"@prisma/client\";", "");
  startupCode = startupCode.replace("import { getRedis, getCloudinary, getAi } from \"../../services\";", "import { getRedis, getCloudinary, getAi, getPrisma } from \"../../services\";");
  startupCode = startupCode.replace("const prisma = new PrismaClient();", "const prisma = getPrisma();");
  fs.writeFileSync('src/lib/startup-validation.ts', startupCode);
  console.log('startup-validation.ts updated');
}
