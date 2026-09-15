import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `const aiRequests = await prisma.aIRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } });`,
  `const aiRequests = await prisma.aIRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

    // Open Beta Metrics
    const totalFeedbacks = await prisma.feedback.count();
    const openFeedbacks = await prisma.feedback.count({ where: { status: { in: ['OPEN', 'REVIEWING', 'IN_PROGRESS'] } } });
    const recentErrors = await prisma.errorLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const authFailures = await prisma.securityEvent.count({ where: { eventType: 'LOGIN_FAILED', createdAt: { gte: thirtyDaysAgo } } });`
);

code = code.replace(
  `aiRequests`,
  `aiRequests,
      totalFeedbacks,
      openFeedbacks,
      recentErrors,
      authFailures`
);

fs.writeFileSync('server.ts', code);
