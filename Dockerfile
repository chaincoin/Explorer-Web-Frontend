
FROM httpd:2.4
COPY build /usr/local/apache2/htdocs/
RUN mv /usr/local/apache2/htdocs/htaccess /usr/local/apache2/htdocs/.htaccess 
RUN echo application/wasm           wasm >> /etc/mime.types

