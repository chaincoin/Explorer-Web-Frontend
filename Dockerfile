
FROM php:7.0-apache
COPY html /var/www/html/
RUN mv /var/www/html/htaccess /var/www/html/.htaccess 
RUN echo application/wasm           wasm >> /etc/mime.types

