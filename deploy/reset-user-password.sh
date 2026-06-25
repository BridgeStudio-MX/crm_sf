#!/usr/bin/env bash
# Reset a Twenty user password on the production droplet (Postgres direct).
# Run ON the droplet from /opt/twenty after the stack is up.
#
# Usage:
#   bash reset-user-password.sh                    # list users
#   bash reset-user-password.sh user@example.com   # reset to default password
#   bash reset-user-password.sh user@example.com 'MyNewPass123'
#
# Default password: ParksIndustrial2026!

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
DEFAULT_PASSWORD='ParksIndustrial2026!'

cd "$DEPLOY_DIR"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $DEPLOY_DIR" >&2
  exit 1
fi

# shellcheck disable=SC1091
source .env

PG_USER="${PG_DATABASE_USER:-postgres}"

list_users() {
  docker compose exec -T db psql -U "$PG_USER" -d default -c \
    'SELECT email, "firstName", "lastName", "createdAt"
     FROM core."user"
     WHERE "deletedAt" IS NULL
     ORDER BY "createdAt";'
}

if [ $# -lt 1 ]; then
  echo "Usuarios registrados en este servidor:"
  list_users
  echo ""
  echo "Para resetear contraseña:"
  echo "  bash reset-user-password.sh EMAIL [NUEVA_CONTRASENA]"
  exit 0
fi

EMAIL="$1"
PASSWORD="${2:-$DEFAULT_PASSWORD}"

if [ ${#PASSWORD} -lt 8 ] || [ ${#PASSWORD} -gt 50 ]; then
  echo "ERROR: la contraseña debe tener entre 8 y 50 caracteres." >&2
  exit 1
fi

echo "Generando hash bcrypt..."
PASSWORD_HASH=$(
  docker compose exec -T server node -e \
    "console.log(require('bcrypt').hashSync(process.argv[1], 10))" \
    "$PASSWORD" | tr -d '\r\n'
)

ESCAPED_EMAIL="${EMAIL//\'/\'\'}"
ESCAPED_HASH="${PASSWORD_HASH//\'/\'\'}"

UPDATED=$(
  docker compose exec -T db psql -U "$PG_USER" -d default -t -A -c \
    "UPDATE core.\"user\"
     SET \"passwordHash\" = '${ESCAPED_HASH}'
     WHERE email = '${ESCAPED_EMAIL}' AND \"deletedAt\" IS NULL
     RETURNING email;"
)

if [ -z "$UPDATED" ]; then
  echo "ERROR: no se encontró usuario con email: $EMAIL" >&2
  echo ""
  list_users
  exit 1
fi

echo "Contraseña actualizada para: $UPDATED"
echo "Nueva contraseña: $PASSWORD"
echo ""
echo "Entra en ${SERVER_URL:-https://parks.bridgehub.mx} con Continue with Email."
