#!/usr/bin/env bash
# Automated PostgreSQL backup script for CoproPilot
# Make executable with: chmod +x scripts/backup.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/copro-pilot}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-copro_pilot}"
POSTGRES_USER="${POSTGRES_USER:-copro_pilot}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/copro_pilot_${TIMESTAMP}.sql.gz"

echo "[backup] Starting backup to $BACKUP_FILE"
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

echo "[backup] Backup complete: $(du -h "$BACKUP_FILE" | cut -f1)"

# Cleanup old backups
find "$BACKUP_DIR" -name 'copro_pilot_*.sql.gz' -mtime +$RETENTION_DAYS -delete
echo "[backup] Cleaned up backups older than $RETENTION_DAYS days"
