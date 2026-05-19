#!/usr/bin/env sh
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.__VITE_API_URL__ = "${API_URL:-}";
EOF

api_proxy_url="${API_PROXY_URL:-http://backend}"
api_proxy_url="${api_proxy_url%/}"
sed -i "s|__API_PROXY_URL__|${api_proxy_url}|g" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
