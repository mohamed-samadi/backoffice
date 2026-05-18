#!/usr/bin/env sh
set -e

cd /var/www/html

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rw storage bootstrap/cache

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ "${RUN_COMPOSER_INSTALL:-false}" = "true" ] || [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist
fi

php artisan storage:link --quiet || true
php artisan config:clear --quiet || true
php artisan cache:clear --quiet || true

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
  php artisan db:seed --force
fi

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
