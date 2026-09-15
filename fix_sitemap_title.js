import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("prisma.tournament.findMany({ select: { id: true, name: true, createdAt: true }, take: 1000 })", "prisma.tournament.findMany({ select: { id: true, title: true, createdAt: true }, take: 1000 })");
code = code.replace("const slug = slugify(t.name || '', { lower: true, strict: true });", "const slug = slugify(t.title || '', { lower: true, strict: true });");

// Check the index route for the same issue
code = code.replace("const t = await prisma.tournament.findUnique({ where: { id } }).catch(()=>null);\\n          if (t) {\\n            title = \\`\\${t.name || 'Tournament'} | STRIQO\\`;\\n            description = t.description || \\`Join the \\${t.name} tournament on STRIQO.\\`;", "const t = await prisma.tournament.findUnique({ where: { id } }).catch(()=>null);\\n          if (t) {\\n            title = \\`\\${t.title || 'Tournament'} | STRIQO\\`;\\n            description = t.description || \\`Join the \\${t.title} tournament on STRIQO.\\`;");

fs.writeFileSync('server.ts', code);
