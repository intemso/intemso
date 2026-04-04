#!/bin/bash
# ============================================================
# Intemso Full Deployment Script
# Run this on the Hetzner production server (46.224.59.126)
#
# Usage:
#   First deploy:  bash deploy/deploy.sh --full
#   Update only:   bash deploy/deploy.sh --update
#   SSL only:      bash deploy/deploy.sh --ssl
# ============================================================

set -euo pipefail

DOMAIN="intemso.com"
EMAIL="team@intemso.com"
SERVER_IP="46.224.59.126"
PROJECT_DIR="/opt/intemso"
DEPLOY_DIR="$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Parse arguments ──
ACTION="${1:-}"
if [[ "$ACTION" != "--full" && "$ACTION" != "--update" && "$ACTION" != "--ssl" ]]; then
    echo "Usage: bash deploy/deploy.sh [--full|--update|--ssl]"
    echo ""
    echo "  --full    First-time setup: install deps, configure nginx, SSL, build & start everything"
    echo "  --update  Pull latest code, rebuild containers, restart services"
    echo "  --ssl     Re-issue SSL certificates only (e.g., after adding new subdomains)"
    exit 1
fi

# ============================================================
# FULL DEPLOYMENT (first time)
# ============================================================
full_deploy() {
    log "Starting full deployment..."

    # 1. System packages
    log "Installing system dependencies..."
    apt update -qq
    apt install -y -qq nginx certbot python3-certbot-nginx curl git

    # 2. Docker (if not installed)
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi

    # Docker Compose plugin (if not installed)
    if ! docker compose version &> /dev/null; then
        log "Installing Docker Compose plugin..."
        apt install -y docker-compose-plugin
    fi

    # 3. Create project directory
    mkdir -p "$PROJECT_DIR"

    # 4. Configure Nginx
    setup_nginx

    # 5. SSL Certificates
    setup_ssl

    # 6. Deploy Nginx with SSL
    deploy_nginx_ssl

    # 7. Build and start containers
    build_and_start

    # 8. Set up health monitor cron
    setup_cron

    # 9. Apply system hardening
    setup_sysctl

    log "Full deployment complete!"
    print_status
}

# ============================================================
# UPDATE DEPLOYMENT (code changes)
# ============================================================
update_deploy() {
    log "Starting update deployment..."

    cd "$PROJECT_DIR"

    # Pull latest code (assumes git is set up)
    if [ -d ".git" ]; then
        log "Pulling latest code..."
        git pull --ff-only
    fi

    # Rebuild and restart
    build_and_start

    log "Update deployment complete!"
    print_status
}

# ============================================================
# NGINX SETUP
# ============================================================
setup_nginx() {
    log "Configuring Nginx..."

    # Copy our config
    cp "$PROJECT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/intemso

    # Enable the site
    ln -sf /etc/nginx/sites-available/intemso /etc/nginx/sites-enabled/intemso
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

    # Test config (will fail on SSL refs if certs don't exist yet, that's OK)
    log "Nginx config installed at /etc/nginx/sites-available/intemso"
}

# ============================================================
# SSL SETUP
# ============================================================
setup_ssl() {
    log "Setting up SSL certificates..."

    mkdir -p /var/www/certbot

    # Temporary HTTP-only config for cert issuance
    cat > /etc/nginx/sites-available/intemso-certbot <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} jobs.${DOMAIN} hire.${DOMAIN} admin.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Waiting for SSL setup...';
        add_header Content-Type text/plain;
    }
}
EOF

    # Swap to temp config
    ln -sf /etc/nginx/sites-available/intemso-certbot /etc/nginx/sites-enabled/intemso
    nginx -t && systemctl reload nginx

    # Request certificate covering all domains
    log "Requesting SSL certificate for all domains..."
    certbot certonly \
        --webroot \
        --webroot-path /var/www/certbot \
        --domain "${DOMAIN}" \
        --domain "www.${DOMAIN}" \
        --domain "jobs.${DOMAIN}" \
        --domain "hire.${DOMAIN}" \
        --domain "admin.${DOMAIN}" \
        --email "${EMAIL}" \
        --agree-tos \
        --non-interactive \
        --force-renewal

    # Enable auto-renewal
    systemctl enable certbot.timer
    systemctl start certbot.timer

    # Verify
    certbot renew --dry-run

    log "SSL certificates issued successfully"
    log "  Certificate: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
    log "  Domains: ${DOMAIN}, www.${DOMAIN}, jobs.${DOMAIN}, hire.${DOMAIN}, admin.${DOMAIN}"
}

# ============================================================
# DEPLOY NGINX WITH SSL
# ============================================================
deploy_nginx_ssl() {
    log "Deploying production Nginx config with SSL..."

    # Copy production config
    cp "$PROJECT_DIR/deploy/nginx.conf" /etc/nginx/sites-available/intemso
    ln -sf /etc/nginx/sites-available/intemso /etc/nginx/sites-enabled/intemso

    # Remove temp certbot config if present
    rm -f /etc/nginx/sites-available/intemso-certbot 2>/dev/null || true

    # Test and reload
    nginx -t || error "Nginx config test failed!"
    systemctl reload nginx

    log "Nginx deployed and running"
}

# ============================================================
# BUILD AND START CONTAINERS
# ============================================================
build_and_start() {
    cd "$PROJECT_DIR"

    log "Building Docker containers (this may take a few minutes)..."
    docker compose -f docker-compose.prod.yml build --parallel

    log "Running database migrations..."
    docker compose -f docker-compose.prod.yml run --rm migrate

    log "Starting all services..."
    docker compose -f docker-compose.prod.yml up -d

    # Wait for services to be healthy
    log "Waiting for services to become healthy..."
    local retries=30
    while [ $retries -gt 0 ]; do
        API_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3001/api/v1/health 2>/dev/null || echo "000")
        if [ "$API_STATUS" = "200" ]; then
            log "API is healthy"
            break
        fi
        retries=$((retries - 1))
        sleep 2
    done

    if [ $retries -eq 0 ]; then
        warn "API health check timed out — check logs: docker compose -f docker-compose.prod.yml logs api"
    fi

    # Quick check all frontends
    for port in 3000 3002 3003 3004; do
        STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:$port 2>/dev/null || echo "000")
        if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ]; then
            log "Port $port: healthy"
        else
            warn "Port $port: returned HTTP $STATUS (may still be starting)"
        fi
    done

    # Prune old images to save disk
    docker image prune -f --filter "until=48h" 2>/dev/null || true
}

# ============================================================
# CRON SETUP
# ============================================================
setup_cron() {
    log "Setting up health monitor cron..."

    # Copy logrotate config
    cp "$PROJECT_DIR/deploy/nginx-logrotate" /etc/logrotate.d/nginx-intemso 2>/dev/null || true

    # Add health monitor cron (every 5 minutes)
    CRON_CMD="*/5 * * * * bash $PROJECT_DIR/deploy/health-monitor.sh"
    (crontab -l 2>/dev/null | grep -v "health-monitor.sh"; echo "$CRON_CMD") | crontab -

    # Add daily backup cron (2 AM)
    BACKUP_CMD="0 2 * * * bash $PROJECT_DIR/deploy/backup-db.sh"
    (crontab -l 2>/dev/null | grep -v "backup-db.sh"; echo "$BACKUP_CMD") | crontab -

    log "Cron jobs configured"
}

# ============================================================
# SYSCTL HARDENING
# ============================================================
setup_sysctl() {
    if [ -f "$PROJECT_DIR/deploy/sysctl-hardening.conf" ]; then
        log "Applying sysctl hardening..."
        cp "$PROJECT_DIR/deploy/sysctl-hardening.conf" /etc/sysctl.d/99-intemso.conf
        sysctl --system > /dev/null 2>&1
    fi
}

# ============================================================
# STATUS
# ============================================================
print_status() {
    echo ""
    echo "============================================"
    echo "  Intemso Deployment Status"
    echo "============================================"
    echo ""

    # Container status
    echo "Docker Containers:"
    docker compose -f "$PROJECT_DIR/docker-compose.prod.yml" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || \
        docker ps --filter "name=intemso" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""

    # URL status
    echo "URLs:"
    echo "  Main site:       https://intemso.com"
    echo "  Student portal:  https://jobs.intemso.com"
    echo "  Employer portal: https://hire.intemso.com"
    echo "  Admin portal:    https://admin.intemso.com"
    echo "  API:             https://intemso.com/api/v1/health"
    echo ""

    # SSL status
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" 2>/dev/null | cut -d= -f2)
        echo "SSL Certificate: valid until $EXPIRY"
    else
        echo "SSL Certificate: NOT FOUND"
    fi

    echo ""
    echo "============================================"
}

# ============================================================
# RUN
# ============================================================
case "$ACTION" in
    --full)
        full_deploy
        ;;
    --update)
        update_deploy
        ;;
    --ssl)
        setup_ssl
        deploy_nginx_ssl
        print_status
        ;;
esac
