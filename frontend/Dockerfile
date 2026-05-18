FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG VITE_API_URL=/api
ARG VITE_STORAGE_URL=/storage
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STORAGE_URL=${VITE_STORAGE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 80

ENTRYPOINT ["docker-entrypoint"]
