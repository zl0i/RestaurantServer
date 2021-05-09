FROM nginx:1.19.2-alpine

COPY ./ssl/ /etc/ssl/ 
COPY ./prod.conf /etc/nginx/conf.d/default.conf
COPY ./static/ /var/www/static/


EXPOSE 80 443
