#!/bin/sh

# Generate config.js with API_URL at runtime
cat > /usr/share/nginx/html/config.js << EOF
window.__VITE_API_URL__ = '${API_URL:-http://localhost:8000}';
EOF

echo "✨ Configuration générée"
echo "   API_URL: ${API_URL:-http://localhost:8000}"

# Start nginx
exec nginx -g "daemon off;"
