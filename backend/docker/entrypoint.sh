#!/bin/bash
set -e

echo "🚀 Application Laravel"
echo "====================="

echo "⏳ Attente de la base de données..."
until nc -z db 3306 2>/dev/null; do
  echo "  ⏳ MySQL pas encore prête..."
  sleep 2
done
echo "✅ MySQL prête"

echo "🔄 Lancement des migrations..."
php artisan migrate --force
echo "✅ Migrations terminées"

echo "🔗 Configuration des liens symboliques..."
php artisan storage:link --quiet 2>/dev/null || true
echo "✅ Liens symboliques OK"

echo "💾 Cache des configs..."
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
echo "✅ Cache OK"

echo ""
echo "✨ Application prête !"
echo ""

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
