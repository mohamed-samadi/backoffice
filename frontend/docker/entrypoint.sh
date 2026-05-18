#!/usr/bin/env sh
set -e

cat > /usr/share/nginx/html/config.js <<EOF
window.__VITE_API_URL__ = "${API_URL:-}";
EOF

exec nginx -g "daemon off;"
