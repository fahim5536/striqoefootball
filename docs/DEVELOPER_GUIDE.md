# Developer Guide

## Architecture
STRIQO is built as a monolith to optimize development velocity, leveraging Express for the backend API and React + Vite for the frontend.
The backend heavily relies on Prisma ORM for type-safe database queries.

## Key Technologies
- **Frontend**: React, Tailwind CSS, Recharts, Lucide-React.
- **Backend**: Node.js, Express, Prisma.
- **Database**: PostgreSQL (relational structure for strict consistency).
- **Caching**: Redis (leaderboards, brackets, session persistence).

## Adding a New Feature
1. **Schema**: Define the model in \`prisma/schema.prisma\`.
2. **Migration**: Run \`npx prisma migrate dev --name feature_name\`.
3. **API**: Create the endpoints in \`server.ts\` or modularize under a specific router.
4. **UI**: Build the React component in \`src/components/\` and ensure responsive design using Tailwind.

## Code Style
- We enforce strict TypeScript compilation (\`npm run lint\`).
- Use functional components and hooks.
- Follow the established pattern of handling API requests via the \`useApi\` custom hook.
