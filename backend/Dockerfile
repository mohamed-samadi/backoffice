FROM php:8.2-fpm

# Extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev \
    libzip-dev zip unzip nginx supervisor \
    && docker-php-ext-install pdo_mysql mbstring \
       exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copier les fichiers Laravel
COPY . .

# Installer les dépendances
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Config Nginx
COPY backend/docker/nginx.conf /etc/nginx/sites-available/default

# Config Supervisor (nginx + php-fpm ensemble)
COPY backend/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint script
COPY backend/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
