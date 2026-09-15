import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const updateTournamentOld = `    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(tournament);`;

const updateTournamentNew = `    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: req.body
    });
    const redis = getRedis();
    if (redis) {
      try {
        const keys = await redis.keys('search:*');
        if (keys.length > 0) await redis.del(...keys);
      } catch (e) {}
    }
    res.json(tournament);`;

code = code.replace(updateTournamentOld, updateTournamentNew);
fs.writeFileSync('server.ts', code);
console.log('Fixed redis invalidation on tournament update');
