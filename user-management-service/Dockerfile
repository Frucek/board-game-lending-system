FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY docs ./docs

RUN mkdir -p /data && chgrp -R 0 /data && chmod -R g+rwX /data

EXPOSE 3000

CMD ["npm", "start"]