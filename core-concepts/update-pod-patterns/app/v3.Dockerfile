FROM node:20-alpine

WORKDIR /app

COPY server-v3.js .

EXPOSE 8080

ENTRYPOINT ["node", "server-v3.js"]