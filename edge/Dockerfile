FROM nginx:alpine
RUN mkdir -p /etc/nginx/flags /var/cache/nginx/assets
COPY nginx.conf /etc/nginx/nginx.conf
COPY maintenance.html /usr/share/nginx/maintenance/maintenance.html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/__edge_health || exit 1
