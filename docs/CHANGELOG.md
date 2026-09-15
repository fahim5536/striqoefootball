# Changelog

## [1.30.0-alpha] - 2026-08-04
### Added
- Comprehensive Analytics and Business Intelligence dashboards.
- CSV Reports exporter for platform usage.
- AI Feature Usage tracking.
- Operational Insights and System Metrics charts (Latency, Memory, Status).

### Changed
- Re-architected Admin Panel to support horizontal scaling and granular tabs.
- Refined caching patterns in server.ts to gracefully handle Redis disconnections.

### Fixed
- Fixed TypeScript inconsistencies in analytics API endpoints.
- Resolved styling overlap in match details modal.
- Fixed tournament generation edge cases when bracket node participants are null.
