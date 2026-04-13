# Operations Guide

Practical runbook for operating CoproPilot in staging and production.
Covers backups, log aggregation, metrics scraping, and incident response.

## Backup & Restore

### Automated backups

A PostgreSQL backup sidecar is provided via `compose.backup.yml`. It runs
`scripts/backup.sh` every 24 hours (first run at 3 AM local time) and
stores compressed SQL dumps in a named volume.

Start the full stack with backups enabled:

```bash
docker compose -f compose.yml -f compose.backup.yml up -d
```

Environment variables (can be set in `.env`):

| Variable | Default | Description |
|---|---|---|
| `BACKUP_DIR` | `/var/backups/copro-pilot` | Destination inside the sidecar |
| `RETENTION_DAYS` | `30` | Auto-prune backups older than N days |
| `POSTGRES_HOST` | `postgres` | Host of the database to back up |
| `POSTGRES_PORT` | `5432` | Database port |
| `POSTGRES_DB` | `copro_pilot` | Database name |
| `POSTGRES_USER` | `copro_pilot` | Database user |
| `POSTGRES_PASSWORD` | — | Required |

### Manual backup

Run the script directly against a running database:

```bash
POSTGRES_PASSWORD=... ./scripts/backup.sh
```

Backup files are named `copro_pilot_YYYYMMDD_HHMMSS.sql.gz`.

### Restore

```bash
# Copy the dump out of the volume (or pick it up from your off-site store)
docker cp copro-pilot-backup:/var/backups/copro-pilot/copro_pilot_YYYYMMDD_HHMMSS.sql.gz ./

# Restore into a running postgres container
gunzip -c copro_pilot_YYYYMMDD_HHMMSS.sql.gz \
  | docker exec -i copro-pilot-postgres \
      psql -U copro_pilot -d copro_pilot
```

Tip: for a clean restore, drop and recreate the database first, or use
`--clean --if-exists` options with `pg_dump` / `pg_restore` in custom
format when tighter control is required.

### Off-site copies

The Docker volume `copro_backups` lives on a single host. For real
disaster recovery, periodically sync its contents to an S3-compatible
bucket (e.g. via `rclone`, `aws s3 sync`, or a separate sidecar).

## Log aggregation

The backend logs to **stdout as JSON** in production (Winston,
`apps/backend/src/logger.js`). Each line carries:

- `timestamp`, `level`, `message`
- `service: 'copro-pilot-backend'`
- `environment` (from `NODE_ENV`)
- `hostname` (container hostname)
- `requestId` when a request scope is attached

Any log aggregator that consumes container stdout will work:

- **Loki / Promtail**: scrape the Docker log driver, parse JSON, label
  by `service` and `environment`.
- **CloudWatch Logs / Datadog / ELK**: use the platform's Docker log
  driver or the provider agent.
- **Local dev**: file transports are still enabled (`logs/application.log`,
  `logs/error.log`) for convenience.

To inspect logs locally without an aggregator:

```bash
docker compose -f compose.yml logs -f app
docker compose -f compose.yml logs -f app | jq .
```

### High-volume paths

For very chatty debug paths, use `apps/backend/src/utils/logSampling.js`:

```js
import { sample } from '../utils/logSampling.js'

if (sample(0.01, 'slow-query')) {
  logger.debug('slow query sample', { sql, durationMs })
}
```

This keeps roughly 1% of occurrences, preserving signal while bounding
log volume.

## Metrics scraping

The backend exposes Prometheus-format metrics on **`/metrics`** (outside
the `/api` prefix, so it is not gated by auth middleware meant for the
application API). It covers default process metrics plus per-HTTP-route
histograms via `apps/backend/src/middleware/metrics.js`.

Minimal Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: 'copro-pilot-backend'
    metrics_path: /metrics
    static_configs:
      - targets: ['copro-pilot:3001']
        labels:
          service: copro-pilot-backend
          environment: production
```

Key metrics to alert on:

- `http_request_duration_seconds` (P95 latency per route)
- `http_requests_total{status=~"5.."}` (5xx rate)
- `process_resident_memory_bytes` (memory leaks)
- `nodejs_eventloop_lag_seconds` (event loop health)

## Incident response checklist

When an alert fires or users report a problem:

1. **Acknowledge** the alert in your on-call system.
2. **Check status** of the stack:
   ```bash
   docker compose -f compose.yml ps
   ```
3. **Grab recent logs** (filter by `level=error` and `requestId` if a
   specific request is failing):
   ```bash
   docker compose -f compose.yml logs --tail=500 app | jq 'select(.level=="error")'
   ```
4. **Check metrics**: look at `/metrics`, error rate, latency, memory.
5. **Check database**: connection count, long-running queries,
   replication lag (if applicable).
   ```bash
   docker exec -it copro-pilot-postgres \
     psql -U copro_pilot -d copro_pilot -c \
     "SELECT pid, state, query_start, query FROM pg_stat_activity WHERE state != 'idle';"
   ```
6. **Verify recent deploys**: correlate the incident start time with the
   latest release (`chore(release): ...` commit on `main`).
7. **Mitigate**:
   - Roll back via the previous Docker image tag in `ghcr.io` if the
     regression is deploy-related.
   - Scale out / restart the container for transient issues.
   - Restore from the most recent backup if data corruption is
     suspected (see "Restore" above).
8. **Communicate**: post updates to the incident channel at least every
   15 minutes during active investigation.
9. **Post-mortem**: once resolved, open an issue with timeline, root
   cause, and action items. Commit any fixes with `fix(...)` so
   semantic-release publishes a patch.

### Useful one-liners

```bash
# Tail structured error logs
docker compose logs -f app | jq -c 'select(.level=="error")'

# Find all logs for a given requestId
docker compose logs app | jq -c 'select(.requestId=="<id>")'

# Check backup sidecar status
docker compose -f compose.yml -f compose.backup.yml logs postgres-backup

# List backups present in the volume
docker exec copro-pilot-backup ls -lh /var/backups/copro-pilot
```
