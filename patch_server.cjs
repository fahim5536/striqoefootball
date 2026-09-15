const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('const generateUiId = ')) {
  const generateCode = `
const generateUiId = async () => {
  let id = '';
  let exists = true;
  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await prisma.user.findUnique({ where: { uiId: id } });
    if (!user) exists = false;
  }
  return id;
};
  `;
  code = code.replace('const authLimiter', generateCode + '\nconst authLimiter');
  code = code.replace(
    'const user = await prisma.user.create({',
    'const uiId = await generateUiId();\n      const user = await prisma.user.create({'
  );
  code = code.replace(
    'data: { email, password: hashedPassword, username, isBetaUser',
    'data: { email, password: hashedPassword, username, uiId, isBetaUser'
  );
}

// In /auth/login, if uiId is missing, generate it
code = code.replace(
  'const token = generateToken(user);',
  `if (!user.uiId) {
      const uiId = await generateUiId();
      await prisma.user.update({ where: { id: user.id }, data: { uiId } });
      user.uiId = uiId;
    }
    const token = generateToken(user);`
);

fs.writeFileSync('server.ts', code);
console.log('Server patched');
