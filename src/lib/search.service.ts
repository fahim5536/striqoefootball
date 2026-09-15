
import { getRedis, getPrisma } from "../../services";

const prisma = getPrisma();

export class SearchService {
  async globalSearch(query: string, filters: any = {}) {
    const { entity, gameMode, tournamentType, rank, region, status, date, entryType, teamSize } = filters;
    
    // Minimum 2 chars if providing a query, else allow empty query if we have filters
    if ((!query || query.length < 2) && Object.keys(filters).length === 0) {
      return { users: [], teams: [], tournaments: [], matches: [], leaderboards: [], announcements: [] };
    }

    const redis = getRedis();
    const filterKey = Buffer.from(JSON.stringify(filters)).toString('base64');
    const cacheKey = `search:global:v3:${query}:${filterKey}`;
    
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }

    const results: any = {};
    const q = query || '';

    // Base conditions
    const userConditions: any = { status: 'ACTIVE' };
    if (q) {
      userConditions.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { inGameName: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (region) userConditions.region = region;
    if (rank) userConditions.rank = rank;

    if (!entity || entity === 'user') {
      results.users = await prisma.user.findMany({
        where: userConditions,
        take: 10,
        select: { id: true, username: true, displayName: true, avatarUrl: true, inGameName: true }
      });
    }

    const teamConditions: any = { deletedAt: null };
    if (q) {
      teamConditions.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { tag: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (region) teamConditions.region = region;

    if (!entity || entity === 'team') {
      let teams = await prisma.team.findMany({
        where: teamConditions,
        take: 20,
        select: { id: true, name: true, slug: true, tag: true, logoUrl: true, isVerified: true, _count: { select: { members: true } } }
      });
      
      if (teamSize) {
        teams = teams.filter(t => t._count.members === parseInt(teamSize));
      }
      results.teams = teams.slice(0, 10);
    }

    const tourneyConditions: any = { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED'] } };
    if (q) {
      tourneyConditions.title = { contains: q, mode: 'insensitive' };
    }
    if (status) tourneyConditions.status = status;
    if (region) tourneyConditions.region = region;
    // Assume gameMode and tournamentType might be mapped to format or category
    if (gameMode) tourneyConditions.format = gameMode;
    if (tournamentType) tourneyConditions.type = tournamentType;
    if (entryType) tourneyConditions.entryFeeType = entryType;
    if (date) {
      const d = new Date(date);
      tourneyConditions.startDate = { gte: d };
    }

    if (!entity || entity === 'tournament') {
      results.tournaments = await prisma.tournament.findMany({
        where: tourneyConditions,
        take: 10,
        select: { id: true, title: true, slug: true, status: true, type: true, prizePool: true, startDate: true }
      });
    }

    const matchConditions: any = {};
    if (q) matchConditions.id = { contains: q, mode: 'insensitive' };
    if (status) matchConditions.status = status;
    if (gameMode) matchConditions.format = gameMode;

    if (!entity || entity === 'match') {
      results.matches = await prisma.match.findMany({
        where: matchConditions,
        take: 5,
        select: { id: true, status: true, format: true, scheduledAt: true, tournament: { select: { title: true } } }
      });
    }

    const announcementConditions: any = { isActive: true };
    if (q) {
      announcementConditions.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (!entity || entity === 'announcement') {
      results.announcements = await prisma.announcement.findMany({
        where: announcementConditions,
        take: 5,
        select: { id: true, title: true, createdAt: true }
      });
    }

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), { ex: 300 });
    }

    return results;
  }
}
