import fs from 'fs';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getModel = (collection) => {
  const map = {
    'tournaments': prisma.tournament,
    'users': prisma.user,
    'featureFlags': prisma.featureFlag,
    'feedbacks': prisma.feedback,
    'remoteConfigs': prisma.remoteConfig,
    'experiments': prisma.experiment,
    'experimentParticipants': prisma.experimentParticipant,
  };
  return map[collection];
};

console.log(getModel('featureFlags') !== undefined ? "Found" : "Not Found");
