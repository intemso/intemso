#!/bin/bash
# Intemso Health Monitor - runs via cron every 5 minutes
# Checks: containers, disk, memory, API, web
# Logs to /var/log/intemso-health.log

LOG="/var/log/intemso-health.log"
ALERT_LOG="/var/log/intemso-alerts.log"
DISK_THRESHOLD=85
MEM_THRESHOLD=90
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ISSUES=0

log() { echo "[$TIMESTAMP] $1" >> "$LOG"; }
alert() { echo "[$TIMESTAMP] ALERT: $1" >> "$ALERT_LOG"; echo "[$TIMESTAMP] ALERT: $1" >> "$LOG"; ISSUES=$((ISSUES + 1)); }

log "--- Health check started ---"

# 1. Check Docker containers
EXPECTED_CONTAINERS="intemso-api intemso-web intemso-student intemso-employer intemso-admin intemso-postgres intemso-redis"
for CONTAINER in $EXPECTED_CONTAINERS; do
  STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)
  if [ "$STATUS" != "running" ]; then
    alert "$CONTAINER is $STATUS - attempting restart"
    docker restart "$CONTAINER" >> "$LOG" 2>&1
  fi
done

# 2. Check disk usage
DISK_USAGE=$(df / --output=pcent | tail -1 | tr -d ' %')
if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
  alert "Disk usage at ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
  # Auto-cleanup: prune Docker if disk is critical
  if [ "$DISK_USAGE" -ge 95 ]; then
    alert "Critical disk usage - pruning Docker"
    docker system prune -f >> "$LOG" 2>&1
  fi
else
  log "Disk: ${DISK_USAGE}% OK"
fi

# 3. Check memory usage
MEM_USAGE=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USAGE" -ge "$MEM_THRESHOLD" ]; then
  alert "Memory usage at ${MEM_USAGE}% (threshold: ${MEM_THRESHOLD}%)"
else
  log "Memory: ${MEM_USAGE}% OK"
fi

# 4. Check API health endpoint
API_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3001/api/v1/health 2>/dev/null)
if [ "$API_STATUS" != "200" ]; then
  alert "API health check failed (HTTP $API_STATUS)"
else
  log "API: healthy"
fi

# 5. Check web frontend
WEB_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3000 2>/dev/null)
if [ "$WEB_STATUS" != "200" ]; then
  alert "Web frontend check failed (HTTP $WEB_STATUS)"
else
  log "Web: healthy"
fi

# 5b. Check student portal
STUDENT_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3002 2>/dev/null)
if [ "$STUDENT_STATUS" != "200" ] && [ "$STUDENT_STATUS" != "307" ]; then
  alert "Student portal check failed (HTTP $STUDENT_STATUS)"
else
  log "Student portal: healthy"
fi

# 5c. Check employer portal
EMPLOYER_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3003 2>/dev/null)
if [ "$EMPLOYER_STATUS" != "200" ] && [ "$EMPLOYER_STATUS" != "307" ]; then
  alert "Employer portal check failed (HTTP $EMPLOYER_STATUS)"
else
  log "Employer portal: healthy"
fi

# 5d. Check admin portal
ADMIN_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:3004 2>/dev/null)
if [ "$ADMIN_STATUS" != "200" ] && [ "$ADMIN_STATUS" != "307" ]; then
  alert "Admin portal check failed (HTTP $ADMIN_STATUS)"
else
  log "Admin portal: healthy"
fi

# 6. Check PostgreSQL connections
PG_CONNS=$(docker exec intemso-postgres psql -U intemso -d intemso -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ')
if [ -n "$PG_CONNS" ] && [ "$PG_CONNS" -ge 35 ]; then
  alert "PostgreSQL connections high: ${PG_CONNS}/40"
else
  log "PostgreSQL connections: ${PG_CONNS:-unknown}"
fi

# 7. Check if swap is heavily used (>50%)
SWAP_TOTAL=$(free | awk '/Swap:/ {print $2}')
SWAP_USED=$(free | awk '/Swap:/ {print $3}')
if [ "$SWAP_TOTAL" -gt 0 ]; then
  SWAP_PCT=$((SWAP_USED * 100 / SWAP_TOTAL))
  if [ "$SWAP_PCT" -ge 50 ]; then
    alert "Swap usage high: ${SWAP_PCT}%"
  fi
fi

# 8. Check SSL certificate expiry (if exists)
if [ -f /etc/letsencrypt/live/*/fullchain.pem ]; then
  CERT_FILE=$(ls /etc/letsencrypt/live/*/fullchain.pem 2>/dev/null | head -1)
  if [ -n "$CERT_FILE" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" 2>/dev/null | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "$DAYS_LEFT" -le 7 ]; then
      alert "SSL certificate expires in ${DAYS_LEFT} days!"
    else
      log "SSL: ${DAYS_LEFT} days remaining"
    fi
  fi
fi

if [ "$ISSUES" -eq 0 ]; then
  log "All checks passed"
else
  log "$ISSUES issue(s) detected - check $ALERT_LOG"
fi
