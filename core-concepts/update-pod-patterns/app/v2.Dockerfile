FROM node:20-alpine

WORKDIR /app

COPY server-v2.js .

EXPOSE 8080

ENTRYPOINT ["node", "server-v2.js"]