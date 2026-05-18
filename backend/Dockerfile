FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    git \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    nginx \
    oniguruma-dev \
    supervisor \
    unzip \
    zip \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install \
    bcmath \
    exif \
    gd \
    mbstring \
    pcntl \
    pdo_mysql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize \
  && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R ug+rw storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint

RUN chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 80

ENTRYPOINT ["docker-entrypoint"]
