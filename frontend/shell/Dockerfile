FROM node:22-alpine AS build

WORKDIR /app

ARG CATALOG_URL=http://localhost:3001
ARG BORROWING_URL=http://localhost:3002
ARG USERS_URL=http://localhost:3003

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]