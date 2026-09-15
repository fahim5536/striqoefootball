import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The project lacks active invalidation of search/recommendations on content creation
// For example, when a tournament is created, we should invalidate caches

const createTournamentOld = `    const tournament = await prisma.tournament.create({
      data: {
        title, slug, description, bannerUrl, status, type, visibility,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        maxParticipants, minParticipants, entryFee, prizePool,
        categoryId, organizerId: req.user.id
      }
    });
    res.json(tournament);`;

const createTournamentNew = `    const tournament = await prisma.tournament.create({
      data: {
        title, slug, description, bannerUrl, status, type, visibility,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        maxParticipants, minParticipants, entryFee, prizePool,
        categoryId, organizerId: req.user.id
      }
    });
    
    // Invalidate caches
    const redis = getRedis();
    if (redis) {
      try {
        // Clear global search caches (keys starting with search:)
        const keys = await redis.keys('search:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err) {
        logger.error('Failed to invalidate search cache', err);
      }
    }
    
    res.json(tournament);`;

code = code.replace(createTournamentOld, createTournamentNew);
fs.writeFileSync('server.ts', code);
console.log('Fixed redis invalidation');
