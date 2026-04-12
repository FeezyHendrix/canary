#!/bin/sh
set -e

# Always run pnpm install to ensure workspace symlinks are correct
# This handles the case where volumes mount over the image's node_modules
echo "Setting up dependencies..."
pnpm install --frozen-lockfile

exec "$@"
