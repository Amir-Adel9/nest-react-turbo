#!/bin/sh
set -e

# If DOMAIN_NAME is set and certs exist, use SSL config
if [ -n "$DOMAIN_NAME" ] && [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
  envsubst '${DOMAIN_NAME}' < /etc/nginx/templates/nginx-ssl.conf.template > /etc/nginx/conf.d/default.conf
fi

exec nginx -g "daemon off;"
