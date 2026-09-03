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

## Optional traffic generator

TechStories does not include a traffic generator in this repo. Learning-center AWS courses start the optional image `techstories-aws-traffic-generator` from `setup-lab-host` (for example [introduction-to-monitoring-aws](https://github.com/DataDog/learning-center/blob/main/courses/introduction-to-monitoring-aws/labs/03-aws-metrics-and-logs/setup-lab-host)).

Pass the **HTTPS lab-host URL** as `TECHSTORIES_URL`, matching `NEXTAUTH_URL` / `TECHSTORIES_PUBLIC_URL`:

```bash
export TECHSTORIES_PUBLIC_URL="https://lab-host.${_SANDBOX_ID}.instruqt.io"

docker run -d \
  --name techstories-traffic-generator \
  -e TECHSTORIES_URL="$TECHSTORIES_PUBLIC_URL" \
  europe-west1-docker.pkg.dev/datadog-community/training-images-docker/techstories-aws-traffic-generator:1.0.0
```

| Scenario | Wrong `TECHSTORIES_URL` | Correct `TECHSTORIES_URL` |
|----------|-------------------------|----------------------------|
| Hybrid (app on lab-host) | `http://localhost:3000` | `https://lab-host.${_SANDBOX_ID}.instruqt.io` |
| AWS + ALB | `http://${ALB_DNS}` | `https://lab-host.${_SANDBOX_ID}.instruqt.io` |

Traffic must enter through `service-proxy` on lab-host so TLS and NextAuth Secure cookies match what learners see in the Instruqt tab.

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

For background traffic, start `techstories-aws-traffic-generator` with `TECHSTORIES_URL=$TECHSTORIES_PUBLIC_URL` — see [Optional traffic generator](#optional-traffic-generator).

## References

- [TechStories README — Enable SSL/TLS](../README.md#enable-ssltls)
- [services/nginx/README.md](../services/nginx/README.md)
- [Storedog PR #206](https://github.com/DataDog/storedog/pull/206)
- [learning-center PR #2076](https://github.com/DataDog/learning-center/pull/2076)
