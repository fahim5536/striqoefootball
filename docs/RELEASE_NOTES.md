# Release Notes - STRIQO Alpha v1.30

## Overview
STRIQO Alpha (v1.30) marks the completion of the core platform features and sets the stage for the upcoming Closed Beta testing phase. This release focuses on stability, analytics, and business intelligence.

## New Features
- **Business Intelligence & Analytics**: Added comprehensive dashboards for Daily Active Users (DAU), Weekly Active Users (WAU), Monthly Active Users (MAU), new registrations, active tournaments, completed tournaments, and match completion rates.
- **Admin Reports**: Exportable operational insights and AI usage metrics via CSV.
- **System Metrics Monitoring**: Added endpoints and UI to monitor API usage, database performance, cache latency, and system health.
- **Audit & Insights**: Added tracking for user behavior summaries, tournament trends, and platform engagement metrics.
- **Feedback & Experiments Management**: Dedicated admin sections for feature flagging, A/B testing (experiments), and user feedback analysis.

## Improvements
- **Performance & Scalability**: Optimized database queries, added Redis caching for tournaments and leaderboards, and refined background job processing for matchmaking.
- **Security**: Strengthened admin authorization checks, role-based access control, and API rate limiting.
- **Code Quality**: Resolved all TypeScript errors, applied consistent formatting, removed dead code, and ensured production build stability.

## Known Issues (To be addressed in Closed Beta)
- Real-time socket updates for complex match events might occasionally drop under extreme load.
- Geographic distribution metrics in analytics are stubbed for future expansion.

## Next Steps
- Begin Closed Beta testing with selected teams and organizers.
- Gather feedback for the v1.5 milestone.
