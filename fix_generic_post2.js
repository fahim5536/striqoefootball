import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The reason it returns "Not found" is because getModel doesn't have it.
// Let's check if getModel actually has it.
const mapEnd = `    'adminActionLogs': prisma.adminActionLog,
    'featureFlags': prisma.featureFlag,
    'remoteConfigs': prisma.remoteConfig,
    'feedbacks': prisma.feedback,
    'experiments': prisma.experiment,
    'experimentParticipants': prisma.experimentParticipant,
  };`;
  
if (code.includes(mapEnd)) {
    console.log("getModel map includes featureFlags");
} else {
    console.log("getModel map DOES NOT include featureFlags!");
}
