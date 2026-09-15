
import { getRedis, getPrisma } from "../../services";

const prisma = getPrisma();

export class RecommendationService {
  async getPersonalized(userId: string) {
    const redis = getRedis();
    const cacheKey = `recs:personalized:${userId}`;
    
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return cached;
    }

    // Get user's teams
    const userTeams = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true }
    });
    const teamIds = userTeams.map(t => t.teamId);

    // Suggested Tournaments: Registration open, ideally matching user's region or history (mocking with latest registration open)
    const suggestedTournaments = await prisma.tournament.findMany({
      where: {
        status: 'REGISTRATION_OPEN',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, prizePool: true, startDate: true }
    });

    // Suggested Teams: Active teams with open slots or high activity (mocking with verified teams)
    const suggestedTeams = await prisma.team.findMany({
      where: {
        isVerified: true,
        id: { notIn: teamIds }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, tag: true, logoUrl: true, _count: { select: { members: true } } }
    });

    // Trending Tournaments
    const trendingTournaments = await prisma.tournament.findMany({
      where: { status: { in: ['IN_PROGRESS', 'PUBLISHED'] } },
      orderBy: { participants: { _count: 'desc' } },
      take: 5,
      select: { id: true, title: true, slug: true, status: true, _count: { select: { participants: true } } }
    });

    // Popular Players
    const popularPlayers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { points: "desc" },
      take: 5,
      select: { id: true, username: true, avatarUrl: true, inGameName: true,  }
    });

    const results = {
      suggestedTournaments,
      suggestedTeams,
      trendingTournaments,
      popularPlayers
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), { ex: 900 }); // Cache for 5 mins
    }

    return results;
  }

  async getDiscovery() {
    const redis = getRedis();
    const cacheKey = `recs:discovery:global`;
    
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return cached;
    }

    const featuredTournaments = await prisma.tournament.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, bannerUrl: true, status: true, prizePool: true }
    }).catch(() => []); // Fallback if isFeatured doesn't exist

    // Fallback if isFeatured is not in schema
    const trending = await prisma.tournament.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { participants: { _count: 'desc' } },
      take: 5,
      select: { id: true, title: true, slug: true, status: true, _count: { select: { participants: true } } }
    });

    const mostActiveTeams = await prisma.team.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, tag: true, logoUrl: true,  }
    }).catch(() => []);

    const results = {
      featuredTournaments: featuredTournaments.length > 0 ? featuredTournaments : trending,
      mostActiveTeams,
      trending
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(results), { ex: 600 }); // Cache for 10 mins
    }

    return results;
  }
}
