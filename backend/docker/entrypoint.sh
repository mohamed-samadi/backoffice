#!/bin/bash
set -e

echo "▶ Attente de la base de données..."
until php artisan db:monitor --databases=mysql 2>/dev/null; do
  echo "  ⏳ DB pas encore prête, attente 2s..."
  sleep 2
done

echo "▶ Migrations..."
php artisan migrate --force

echo "▶ Liens symboliques storage..."
php artisan storage:link --quiet 2>/dev/null || true

echo "▶ Cache config/routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Laravel prêt"

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
