# Maintenance Guide

## Database Backups
Automated database backups should be configured on the host database provider (e.g., AWS RDS, GCP Cloud SQL).
For manual snapshotting, the application provides a trigger via the Admin Panel under **Backups**, which invokes a storage routine (ensure AWS S3 or equivalent is configured).

## Clearing Caches
If leaderboards or brackets appear stale, administrators can manually flush the Redis caches from the Admin Panel's **System Health** tab or by connecting directly to the Redis CLI:
\`redis-cli FLUSHALL\`

## Log Rotation
STRIQO uses Winston for logging to the console. When deploying via PM2 or Docker, ensure your process manager handles log rotation to prevent disk space exhaustion.

## Updating Dependencies
Before rolling out major version updates of dependencies (like Prisma or React), perform a full regression test against the \`/api/admin/health\` metrics and tournament workflows on a staging environment.
