#!/bin/bash
set -e
BACKUP_DIR=/opt/backups
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="intemso_db_${DATE}.sql.gz"
ENCRYPTED_FILE="${FILENAME}.enc"
LOG="/var/log/intemso-backup.log"

log() { echo "[$(date)] $1" >> "$LOG"; }

# Dump database and compress
docker exec intemso-postgres pg_dump -U intemso -d intemso --no-owner --no-acl | gzip > "${BACKUP_DIR}/${FILENAME}"

# Encrypt backup if passphrase is configured
if [ -f /root/.backup-passphrase ]; then
  openssl enc -aes-256-cbc -salt -pbkdf2 -in "${BACKUP_DIR}/${FILENAME}" \
    -out "${BACKUP_DIR}/${ENCRYPTED_FILE}" -pass file:/root/.backup-passphrase
  rm "${BACKUP_DIR}/${FILENAME}"
  FINAL_FILE="${ENCRYPTED_FILE}"
else
  FINAL_FILE="${FILENAME}"
fi

# Keep only last 7 daily backups
find "${BACKUP_DIR}" -name "intemso_db_*" -mtime +7 -delete

SIZE=$(du -h "${BACKUP_DIR}/${FINAL_FILE}" | cut -f1)
log "Backup created: ${FINAL_FILE} (${SIZE})"

# Offsite copy via rclone (if configured)
if command -v rclone &>/dev/null && rclone listremotes 2>/dev/null | grep -q 'intemso-backup:'; then
  if rclone copy "${BACKUP_DIR}/${FINAL_FILE}" intemso-backup:intemso-backups/ 2>>"$LOG"; then
    log "Offsite copy successful: ${FINAL_FILE}"
  else
    log "WARNING: Offsite copy failed for ${FINAL_FILE}"
  fi
fi
