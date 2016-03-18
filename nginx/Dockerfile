FROM nginx

COPY ./nginx.conf /etc/nginx
COPY ./htpasswd /etc/nginx
COPY ./ssl/* /etc/nginx/conf.d/

EXPOSE 80
EXPOSE 443
