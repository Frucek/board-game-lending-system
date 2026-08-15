FROM node:22-alpine AS build

WORKDIR /app

ARG CATALOG_URL=http://localhost:3001
ARG BORROWING_URL=http://localhost:3002
ARG USERS_URL=http://localhost:3003

ENV CATALOG_URL=$CATALOG_URL
ENV BORROWING_URL=$BORROWING_URL
ENV USERS_URL=$USERS_URL

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]