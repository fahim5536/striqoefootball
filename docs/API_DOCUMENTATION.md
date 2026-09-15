# API Documentation

## Authentication
All protected routes require a valid JWT token sent in the Authorization header:
\`Authorization: Bearer <token>\`

## Core Endpoints
### User & Profile
- \`POST /api/auth/login\`: Authenticate a user and receive a JWT.
- \`POST /api/auth/register\`: Register a new user.
- \`GET /api/users/profile\`: Fetch current authenticated user's profile.

### Tournaments
- \`GET /api/tournaments\`: List active and upcoming tournaments (supports pagination).
- \`POST /api/tournaments\`: Create a new tournament (Requires organizer role).
- \`GET /api/tournaments/:id/bracket\`: Fetch the generated bracket.

### Matches & Disputes
- \`POST /api/matches/:id/score\`: Submit a score for a match.
- \`POST /api/matches/:id/dispute\`: Open a dispute and upload evidence.

## Admin Endpoints
Admin endpoints require the \`ADMIN\` role.
- \`GET /api/admin/analytics/dashboard\`: Returns BI dashboard metrics.
- \`GET /api/admin/analytics/reports\`: Returns comprehensive platform usage data.
- \`GET /api/admin/health\`: Returns current system health checks.
