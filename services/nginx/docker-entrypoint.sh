#!/bin/sh
set -e

export TECHSTORIES_UPSTREAM=${TECHSTORIES_UPSTREAM:-host.docker.internal:3000}
export QUOTES_UPSTREAM=${QUOTES_UPSTREAM:-quotes_api:3001}
export PROXY_MODE=${PROXY_MODE:-hybrid}
export EXTERNAL_HOST=${EXTERNAL_HOST:-}

ENABLE_SSL=${ENABLE_SSL:-false}

if [ "$ENABLE_SSL" = "true" ]; then
    CERT_FILE=/etc/nginx/certs/cert.pem
    KEY_FILE=/etc/nginx/certs/key.pem

    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        echo "No certificate/key found at /etc/nginx/certs, polling GCP instance metadata"
        mkdir -p /etc/nginx/certs
        METADATA_URL="http://metadata.google.internal/computeMetadata/v1/instance/attributes"
        cert_ready=0
        for i in $(seq 1 30); do
            if curl -sf -H "Metadata-Flavor: Google" \
                "$METADATA_URL/ssl-certificate" -o "$CERT_FILE" 2>/dev/null \
                && curl -sf -H "Metadata-Flavor: Google" \
                "$METADATA_URL/ssl-certificate-key" -o "$KEY_FILE" 2>/dev/null \
                && grep -q 'BEGIN CERTIFICATE' "$CERT_FILE" \
                && grep -q 'BEGIN' "$KEY_FILE"; then
                echo "SSL certificate fetched successfully"
                cert_ready=1
                break
            fi
            echo "Certificate not yet available, retrying in 5 seconds... (attempt $i/30)"
            rm -f "$CERT_FILE" "$KEY_FILE"
            sleep 5
        done

        if [ "$cert_ready" -ne 1 ]; then
            rm -f "$CERT_FILE" "$KEY_FILE"
        fi
    fi

    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        echo "ERROR: ENABLE_SSL=true but $CERT_FILE and/or $KEY_FILE not found, and they could not be downloaded from GCP instance metadata. Mount a certificate and key into /etc/nginx/certs, or set ENABLE_SSL=false." >&2
        exit 1
    fi

    SSL_LISTEN_BLOCK="listen 443 ssl;
    ssl_certificate     ${CERT_FILE};
    ssl_certificate_key ${KEY_FILE};"
else
    SSL_LISTEN_BLOCK=""
fi

export SSL_LISTEN_BLOCK

if [ "$PROXY_MODE" = "external" ]; then
    upstream_host="${EXTERNAL_HOST:-${TECHSTORIES_UPSTREAM#http://}}"
    upstream_host="${upstream_host#https://}"
    upstream_host="${upstream_host%%/*}"

    LOCATION_BLOCKS=$(cat <<EOF
    location / {
        proxy_set_header Host ${upstream_host};
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://${upstream_host};
    }
EOF
)
else
    LOCATION_BLOCKS=$(cat <<EOF
    location /services/quotes/ {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        rewrite ^/services/quotes/(.*)\$ /\$1 break;
        proxy_pass http://${QUOTES_UPSTREAM};
    }

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://${TECHSTORIES_UPSTREAM};
    }
EOF
)
fi

export LOCATION_BLOCKS

envsubst '$SSL_LISTEN_BLOCK $LOCATION_BLOCKS' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
