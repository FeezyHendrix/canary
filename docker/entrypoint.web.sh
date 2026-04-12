#!/bin/sh
set -e

API_URL="${API_URL:-http://localhost:3001}"

find /usr/share/nginx/html/assets -name '*.js' -exec sed -i "s|__CANARY_API_URL__|${API_URL}|g" {} +

exec nginx -g 'daemon off;'
