import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const createTeamOld = `    const team = await prisma.team.create({
      data: {
        name, slug, tag, description, logoUrl, bannerUrl,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "OWNER"
          }
        },
        statistics: {
          create: {}
        }
      }
    });
    res.json(team);`;

const createTeamNew = `    const team = await prisma.team.create({
      data: {
        name, slug, tag, description, logoUrl, bannerUrl,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "OWNER"
          }
        },
        statistics: {
          create: {}
        }
      }
    });
    
    const redis = getRedis();
    if (redis) {
      try {
        const keys = await redis.keys('search:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err) {}
    }
    
    res.json(team);`;

code = code.replace(createTeamOld, createTeamNew);
fs.writeFileSync('server.ts', code);
console.log('Fixed redis invalidation team');
