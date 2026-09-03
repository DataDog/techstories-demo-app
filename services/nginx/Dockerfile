FROM nginx:1.25-alpine

RUN apk add --no-cache gettext curl

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY status.conf /etc/nginx/conf.d/status.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
