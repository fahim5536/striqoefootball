# Environment Guide

## Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Redis 6+ (Required for caching and background queues)

## Local Development
1. Clone the repository and run \`npm install\`
2. Duplicate \`.env.example\` to \`.env\`
3. Set your local database credentials:
   \`DATABASE_URL="postgresql://user:password@localhost:5432/striqo?schema=public"\`
4. Set your Redis connection:
   \`REDIS_URL="redis://localhost:6379"\`
5. Run migrations: \`npx prisma migrate dev\`
6. Start development server: \`npm run dev\`

## Environment Variables
- \`DATABASE_URL\`: Primary database connection string.
- \`REDIS_URL\`: Redis caching layer.
- \`JWT_SECRET\`: Secret for signing authentication tokens.
- \`GEMINI_API_KEY\`: For AI-powered match analysis and automated dispute resolution.
- \`DISCORD_BOT_TOKEN\`: Required if Discord server integration is used for announcements.

## Production Guidelines
Always ensure \`NODE_ENV=production\` is set to optimize Express and React builds. Ensure SSL is terminated at the load balancer or reverse proxy.
