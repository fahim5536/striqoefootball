import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `const aiRequests,
      totalFeedbacks,
      openFeedbacks,
      recentErrors,
      authFailures = await prisma.aIRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } });`,
  `const aiRequests = await prisma.aIRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } });`
);

fs.writeFileSync('server.ts', code);
