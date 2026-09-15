import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        isBetaUser: !!betaCode,
        betaCodeUsed: betaCode || null
      }
    });`,
  `const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        isBetaUser: true, // Everyone registering now is a beta user
        betaCodeUsed: betaCode || null
      }
    });`
);

fs.writeFileSync('server.ts', code);
