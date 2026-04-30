FROM ubuntu
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt install -y nginx openssl && \
    apt clean
RUN apt install -y bash
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/CN=localhost"

RUN rm /etc/nginx/sites-enabled/default

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443


ENTRYPOINT ["nginx", "-g", "daemon off;"]