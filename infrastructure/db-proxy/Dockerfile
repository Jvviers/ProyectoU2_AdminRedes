FROM haproxy:2.8-alpine

USER root
RUN apk add --no-cache postgresql-client

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg