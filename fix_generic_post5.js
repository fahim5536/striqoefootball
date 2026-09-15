import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');
const mapOld = `    'adminActionLogs': prisma.adminActionLog,
    'featureFlags': prisma.featureFlag,
    'remoteConfigs': prisma.remoteConfig,
    'feedbacks': prisma.feedback,
    'experiments': prisma.experiment,
    'experimentParticipants': prisma.experimentParticipant,
  };`;
  
// I suspect the issue is that I added `featureFlags` to getModel but the dist/server.cjs might not have it properly, or I'm missing something.
// Oh wait! The curl command returns `{"error":"Not found"}` without the `console.error("No token on route: ", req.path);` logging to stdout?
// We didn't see any logs in the pm2 output.
// Is the route `/api/featureFlags` literally returning 404 from Express because the route isn't defined?
// But `/api/:collection` catches it.
// Let's replace the 404 in `getModel` to `return res.status(404).json({ error: "Collection not found in getModel: " + req.params.collection });` to be sure.
code = code.replace(`if (!model) return res.status(404).json({ error: "Not found" });`, `if (!model) return res.status(404).json({ error: "Collection not found in getModel: " + req.params.collection });`);
code = code.replace(`if (!model) return res.status(404).json({ error: "Not found" });`, `if (!model) return res.status(404).json({ error: "Collection not found in getModel: " + req.params.collection });`);
code = code.replace(`if (!model) return res.status(404).json({ error: "Not found" });`, `if (!model) return res.status(404).json({ error: "Collection not found in getModel: " + req.params.collection });`);

fs.writeFileSync('server.ts', code);
