#!/bin/bash
# ============================================================
# SSL Setup for intemso.com via Let's Encrypt (Certbot)
# Run this on the Hetzner production server (46.224.59.126)
# ============================================================

set -euo pipefail

DOMAIN="intemso.com"
EMAIL="team@intemso.com"  # Change to your actual email

echo "=== Setting up SSL for ${DOMAIN} ==="

# 1. Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# 2. Create webroot directory for ACME challenges
mkdir -p /var/www/certbot

# 3. Temporarily configure Nginx for HTTP-only (to get initial cert)
# Back up current config
cp /etc/nginx/sites-available/intemso /etc/nginx/sites-available/intemso.bak 2>/dev/null || true

# Write a minimal HTTP-only config for cert issuance
cat > /etc/nginx/sites-available/intemso-certbot <<'EOF'
server {
    listen 80;
    server_name intemso.com www.intemso.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Waiting for SSL setup...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the temporary config
ln -sf /etc/nginx/sites-available/intemso-certbot /etc/nginx/sites-enabled/intemso
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

# 4. Obtain the certificate
echo "Requesting SSL certificate..."
certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --domain "${DOMAIN}" \
    --domain "www.${DOMAIN}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive \
    --force-renewal

# 5. Deploy the full production Nginx config
echo "Deploying production Nginx config..."
cp /etc/nginx/sites-available/intemso.bak /etc/nginx/sites-available/intemso 2>/dev/null || true
rm -f /etc/nginx/sites-available/intemso-certbot

nginx -t && systemctl reload nginx

# 6. Set up auto-renewal cron
echo "Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 7. Test renewal
certbot renew --dry-run

echo ""
echo "=== SSL setup complete! ==="
echo "  - Certificate: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
echo "  - Private key: /etc/letsencrypt/live/${DOMAIN}/privkey.pem"
echo "  - Auto-renewal: enabled via certbot.timer"
echo ""
echo "Visit https://${DOMAIN} to verify."
