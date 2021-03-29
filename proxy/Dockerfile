FROM nginx:1.19.2-alpine

COPY  ./default.conf /etc/nginx/conf.d/default.conf
COPY ./img/ /var/www/static/
COPY ./cert/ /etc/nginx/certs/

EXPOSE 80 443


#docker push zl0i/azia-server:tagname