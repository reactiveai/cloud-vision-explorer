FROM nginx

COPY ./nginx/nginx.conf /etc/nginx
COPY ./nginx/ssl/* /etc/nginx/conf.d/
COPY ./build/prod /opt/www

EXPOSE 80
EXPOSE 443
