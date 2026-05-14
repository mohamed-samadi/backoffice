FROM php:8.2-fpm-alpine

# Install required PHP extensions and dependencies
RUN apk add --no-cache \
    git curl zip unzip netcat-openbsd \
    libpng-dev oniguruma-dev libxml2-dev libzip-dev \
    nginx supervisor \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel
RUN chmod -R 775 storage bootstrap/cache \
    && mkdir -p storage/app/public \
    && chown -R www-data:www-data /var/www/html

# Copy Docker configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]