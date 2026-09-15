# STRIQO Deployment Guide

## Overview
This guide provides instructions for deploying STRIQO to a production environment. STRIQO is a full-stack Node.js/Express application with a React front-end, using Prisma for database interactions (PostgreSQL recommended) and Redis for caching and background jobs.

## Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- A process manager (e.g., PM2) or Docker

## Environment Configuration
Create a `.env` file in the root directory based on `.env.example`. Ensure all required variables are set, including:
- \`DATABASE_URL\`
- \`REDIS_URL\`
- \`JWT_SECRET\`
- \`GEMINI_API_KEY\`
- \`DISCORD_BOT_TOKEN\` (if Discord integration is enabled)
- \`AWS_*\` or other object storage credentials for file uploads

## Build Process
1. Install dependencies: \`npm install\`
2. Generate Prisma client: \`npx prisma generate\`
3. Apply database migrations: \`npx prisma migrate deploy\`
4. Build the application: \`npm run build\`

## Starting the Application
The application can be started using the generated build output.

### Using Node directly
\`\`\`bash
npm start
\`\`\`

### Using PM2
\`\`\`bash
pm2 start dist/server.cjs --name striqo-prod
\`\`\`

### Using Docker
A `Dockerfile` is provided for containerized deployments.
\`\`\`bash
docker build -t striqo:latest .
docker run -p 3000:3000 --env-file .env striqo:latest
\`\`\`

## Monitoring
The application exposes a health check endpoint at \`/api/admin/health\` which can be used by load balancers or monitoring tools (requires admin authentication, or configure a public health route if needed).
