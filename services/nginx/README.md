# Nginx / Service Proxy

Reverse proxy for TechStories. Terminates TLS when `ENABLE_SSL=true` and routes traffic in hybrid or external (AWS ALB) mode.

Config is generated at container start by [docker-entrypoint.sh](./docker-entrypoint.sh) from [default.conf.template](./default.conf.template).

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SSL` | `false` | Set to exact `true` to listen on 443 with TLS |
| `PROXY_MODE` | `hybrid` | `hybrid` (host app + quotes API) or `external` (single upstream, e.g. AWS ALB) |
| `TECHSTORIES_UPSTREAM` | `host.docker.internal:3000` | Next.js upstream (hybrid) or ALB URL/host (external) |
| `QUOTES_UPSTREAM` | `quotes_api:3001` | Quotes API upstream (hybrid only) |
| `EXTERNAL_HOST` | _(empty)_ | Host header for external mode; defaults to host parsed from `TECHSTORIES_UPSTREAM` |

When `ENABLE_SSL=true`, the container uses `/etc/nginx/certs/cert.pem` and `/etc/nginx/certs/key.pem`. If not mounted, it polls GCP instance metadata (Instruqt `ssl-certificate` / `ssl-certificate-key` attributes) for up to 30 attempts.

## Hybrid mode (default)

TechStories runs on the host (`npm run dev` / `npm run start`); db and quotes_api run in Docker Compose.

```yaml
service-proxy:
  build: ./services/nginx
  ports:
    - "443:443"
  environment:
    - ENABLE_SSL=${ENABLE_SSL:-true}
  extra_hosts:
    - "host.docker.internal:host-gateway"
  volumes:
    - ./certs:/etc/nginx/certs:ro  # optional, for local testing
  depends_on:
    - quotes_api
```

Set on the host app:

```bash
NEXTAUTH_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"
NEXT_PUBLIC_QUOTES_API_URL="${NEXTAUTH_URL}/services/quotes"
```

## External mode (AWS + ALB)

Run on lab-host only; proxy to the TechStories ALB over HTTP:

```yaml
service-proxy:
  build: ./services/nginx
  ports:
    - "443:443"
  environment:
    - ENABLE_SSL=true
    - PROXY_MODE=external
    - TECHSTORIES_UPSTREAM=http://your-alb-dns-name.region.elb.amazonaws.com
    - EXTERNAL_HOST=your-alb-dns-name.region.elb.amazonaws.com
```

CloudFormation must set `NEXTAUTH_URL` to the learner-facing HTTPS URL (`https://lab-host.${_SANDBOX_ID}.instruqt.io`), not the ALB URL.

## Local testing

Generate a self-signed cert:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/key.pem -out certs/cert.pem -days 365 \
  -subj "/CN=localhost"
```

Then start compose with `ENABLE_SSL=true` and mount `./certs:/etc/nginx/certs:ro`.

## Datadog nginx check (optional)

Port 81 exposes `/nginx_status/` for autodiscovery:

```yaml
com.datadoghq.ad.instances: '[{"nginx_status_url": "http://%%host%%:81/nginx_status/"}]'
```

See the root [README.md](../../README.md#enable-ssltls) for full deployment scenarios.
