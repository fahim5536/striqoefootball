import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: async app.use syntax error
code = code.replace("async \napp.use((err: any", "app.use((err: any");

// Fix 2: async startServer
code = code.replace("function startServer() {", "async function startServer() {");

// Fix 3: PrismaClient not found (it's initialized via getPrisma, but some generic functions might need it imported or initialized)
// Wait, we see "const prisma = new PrismaClient(" at line 85. We should import it.
if (code.includes("const prisma = new PrismaClient")) {
    if (!code.includes("import { PrismaClient }")) {
         code = code.replace("import express from \"express\";", "import express from \"express\";\nimport { PrismaClient } from \"@prisma/client\";");
    }
}

fs.writeFileSync('server.ts', code);
console.log('Fixed syntax errors');
