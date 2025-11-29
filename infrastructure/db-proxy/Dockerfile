FROM haproxy:2.8.11-alpine

USER root
RUN apk add --no-cache postgresql-client
RUN mkdir -p /var/run/haproxy && chown haproxy:haproxy /var/run/haproxy

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# Drop privileges: haproxy user exists in base image
USER haproxy
