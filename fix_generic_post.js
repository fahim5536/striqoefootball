import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const postRegex = /app\.post\("\/api\/:collection", requireAuth, async \(req, res\) => \{\n  if \(\['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'\]\.includes\(req\.params\.collection\) && req\.user\.role !== 'ADMIN'\) \{\n      return res\.status\(403\)\.json\(\{ error: "Forbidden" \}\);\n  \}/;

const getAuthRegex = /app\.get\("\/api\/:collection", async \(req, res, next\) => \{\n  if \(\['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'\]\.includes\(req\.params\.collection\)\) \{\n     return requireAuth\(req, res, \(\) => \{\n       if \(\(req as any\)\.user\.role !== 'ADMIN'\) \{\n         return res\.status\(403\)\.json\(\{ error: "Forbidden" \}\);\n       \}\n       next\(\);\n     \}\);\n  \}\n  next\(\);\n\}, async \(req: any, res: any\) => \{/;

if (postRegex.test(code)) console.log("Post regex matches");
if (getAuthRegex.test(code)) console.log("Get regex matches");
