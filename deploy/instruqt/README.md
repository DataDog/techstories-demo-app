# Instruqt SSL integration for learning-center labs

Notes for course authors wiring TechStories HTTPS in Instruqt sandboxes.

## Prerequisites (config.yml)

On the VM that runs TechStories or the lab-host proxy:

```yaml
virtualmachines:
- name: lab-host
  allow_external_ingress:
    - http
    - https
  provision_ssl_certificate: true
```

## Hybrid labs (app on lab-host)

TechStories uses the default hybrid model: `docker compose up -d` for db, quotes_api, dd-agent, and `service-proxy`; `npm run dev` or `npm run start` on the host.

In `setup-lab-host` or `.env`:

```bash
export ENABLE_SSL=true
export NEXTAUTH_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"
export NEXT_PUBLIC_QUOTES_API_URL="${NEXTAUTH_URL}/services/quotes"
docker compose up -d
# app started separately per course provision (npm run dev / npm run start)
```

Instruqt tab:

```yaml
- title: TechStories
  type: website
  url: https://lab-host.${_SANDBOX_ID}.instruqt.io
  new_window: true
```

Use the short hostname `lab-host`, not `$HOSTNAME` (which resolves to the internal k8s FQDN).

## AWS + ALB (intro-to-monitoring-aws)

TechStories runs in AWS (HTTP behind ALB). TLS terminates on lab-host via `service-proxy` in external mode.

```bash
export ENABLE_SSL=true
export PROXY_MODE=external
export TECHSTORIES_UPSTREAM="http://${ALB_DNS}"
export EXTERNAL_HOST="${ALB_DNS}"
export TECHSTORIES_PUBLIC_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"
```

CloudFormation: pass `PublicAppUrl=${TECHSTORIES_PUBLIC_URL}` so `NEXTAUTH_URL` on EC2/ECS matches the HTTPS tab URL.

Traffic generators and headless clients must use `$TECHSTORIES_PUBLIC_URL`, not the ALB HTTP URL, or authenticated flows fail (Secure cookies).

## References

- [TechStories README — Enable SSL/TLS](../README.md#enable-ssltls)
- [services/nginx/README.md](../services/nginx/README.md)
- [Storedog PR #206](https://github.com/DataDog/storedog/pull/206)
- [learning-center PR #2076](https://github.com/DataDog/learning-center/pull/2076)
