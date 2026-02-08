# HTTPS with Certbot (VPS production)

This guide adds HTTPS to the app on a VPS using **Certbot** (Let's Encrypt). The gateway container is already set up to use SSL when a domain and certs are present.

## Prerequisites

- App deployed with `docker-compose.prod.yml` (gateway on ports 80 and 443).
- A domain pointing to your VPS (e.g. `app.example.com` → your server IP).
- Ports 80 and 443 open on the firewall.

## 1. Install Certbot on the VPS

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install certbot
```

## 2. Create webroot directory

Certbot will place challenge files here; nginx serves them at `/.well-known/acme-challenge/`.

```bash
sudo mkdir -p /var/www/certbot
```

## 3. Get the first certificate

**Option A – Webroot (recommended, no downtime)**  
With the stack already running and listening on 80:

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d YOUR_DOMAIN
```

Replace `YOUR_DOMAIN` with your hostname (e.g. `app.example.com`). Add `-d www.YOUR_DOMAIN` if you want a cert for both.

**Option B – Standalone (if nothing is using port 80 yet)**  
Stop the gateway first, then:

```bash
sudo certbot certonly --standalone -d YOUR_DOMAIN
```

Certbot writes certs to `/etc/letsencrypt/live/YOUR_DOMAIN/`.

## 4. Set domain and restart

On the VPS, in the **project root** (the directory that contains `docker-compose.prod.yml`), edit your **`.env`** file and add:

```env
DOMAIN_NAME=app.example.com
```

Use your real domain (e.g. `app.example.com`). If you don’t have a `.env` yet, copy `.env.example` to `.env` and add this line. Docker Compose loads `.env` from that directory automatically.

Then restart the gateway so it picks up the SSL config:

```bash
docker compose -f docker-compose.prod.yml up -d gateway
```

The entrypoint detects `/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem` and switches nginx to the HTTPS config (redirect HTTP → HTTPS, serve app over 443).

## 5. Renewal (automatic)

Certbot can renew certs automatically. Set up a cron job or systemd timer:

```bash
sudo certbot renew --webroot -w /var/www/certbot
```

Example cron (run twice daily):

```bash
sudo crontab -e
# Add:
0 0,12 * * * certbot renew --webroot -w /var/www/certbot --quiet && docker compose -f /path/to/docker-compose.prod.yml exec gateway nginx -s reload
```

Use your real path to `docker-compose.prod.yml` (e.g. `$DEPLOY_APP_DIR`). After renewal, reload nginx so it uses the new cert.

## Summary

| Step | Action |
|------|--------|
| 1 | Install Certbot on the VPS |
| 2 | `sudo mkdir -p /var/www/certbot` |
| 3 | `sudo certbot certonly --webroot -w /var/www/certbot -d YOUR_DOMAIN` |
| 4 | Set `DOMAIN_NAME=YOUR_DOMAIN` and restart gateway |
| 5 | Add `certbot renew` (+ nginx reload) to cron |

Your app will be available at **https://YOUR_DOMAIN** with HTTP redirecting to HTTPS.
