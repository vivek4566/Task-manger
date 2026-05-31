#!/bin/bash
# Run on EC2 from repo root after server/.env exists
set -euo pipefail

if [ -z "${PUBLIC_HOST:-}" ]; then
  echo "Set your EC2 public IP first:"
  echo "  export PUBLIC_HOST=3.120.45.67"
  exit 1
fi

if [ ! -f server/.env ]; then
  echo "Create server/.env on EC2 (copy from your PC, include CLIENT_ORIGIN=http://\$PUBLIC_HOST,...)"
  exit 1
fi

export PUBLIC_API_URL="${PUBLIC_API_URL:-http://${PUBLIC_HOST}:5000}"
export PUBLIC_SOCKET_URL="${PUBLIC_SOCKET_URL:-http://${PUBLIC_HOST}:5000}"
export CLIENT_ORIGIN="${CLIENT_ORIGIN:-http://${PUBLIC_HOST},http://${PUBLIC_HOST}:80}"

echo "Deploying with:"
echo "  PUBLIC_API_URL=$PUBLIC_API_URL"
echo "  PUBLIC_SOCKET_URL=$PUBLIC_SOCKET_URL"
echo "  CLIENT_ORIGIN=$CLIENT_ORIGIN"

docker compose -f deploy/ec2/docker-compose.prod.yml up -d --build
docker compose -f deploy/ec2/docker-compose.prod.yml ps

echo ""
echo "Verify: curl http://localhost:5000/api/health"
echo "Browser: http://${PUBLIC_HOST}"
