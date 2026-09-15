import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldMapEnd = `    'adminActionLogs': prisma.adminActionLog,
  };`;

const newMapEnd = `    'adminActionLogs': prisma.adminActionLog,
    'featureFlags': prisma.featureFlag,
    'remoteConfigs': prisma.remoteConfig,
    'feedbacks': prisma.feedback,
    'experiments': prisma.experiment,
    'experimentParticipants': prisma.experimentParticipant,
  };`;

if(code.includes(oldMapEnd)) {
    code = code.replace(oldMapEnd, newMapEnd);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed getModel map');
} else {
    console.log('Could not find the map end');
}
