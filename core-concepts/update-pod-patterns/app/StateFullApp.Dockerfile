FROM node:20-alpine

WORKDIR /app

COPY stateFullApp.js .

EXPOSE 8080

ENTRYPOINT ["node", "stateFullApp.js"]