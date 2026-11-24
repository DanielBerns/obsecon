#!/usr/bin/env bash
set -euo pipefail

# Simple static deployment script for https://obsecon.unp.edu.ar
#
# Usage:
#   DEPLOY_TARGET="usuario@servidor.unp.edu.ar:/var/www/obsecon.unp.edu.ar/" ./deploy.sh
#   DEPLOY_TARGET="usuario@servidor.unp.edu.ar:/var/www/obsecon.unp.edu.ar/" ./deploy.sh --dry-run
#
# Optionally store DEPLOY_TARGET (and DEPLOY_SSH_PORT) in a local .env.deploy file (gitignored).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "${SCRIPT_DIR}/.env.deploy" ]]; then
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR}/.env.deploy"
fi

if [[ -z "${DEPLOY_TARGET:-}" ]]; then
  echo "Error: define DEPLOY_TARGET (ej. usuario@servidor.unp.edu.ar:/var/www/obsecon.unp.edu.ar/)" >&2
  echo "Puedes pasarlo por entorno o guardarlo en .env.deploy" >&2
  exit 1
fi

SSH_PORT="${DEPLOY_SSH_PORT:-22}"
RSYNC_ARGS=(
  -avz
  --delete
  --exclude=".git/"
  --exclude=".gitignore"
  --exclude=".env.deploy"
  --exclude="deploy.sh"
  --exclude="README.md"
  -e "ssh -p ${SSH_PORT}"
)

if [[ "${1:-}" == "--dry-run" ]]; then
  RSYNC_ARGS+=(--dry-run)
  echo "Modo simulacion (--dry-run): no se modificaran archivos en el servidor."
fi

rsync "${RSYNC_ARGS[@]}" "${SCRIPT_DIR}/" "${DEPLOY_TARGET}"
echo "Despliegue finalizado hacia ${DEPLOY_TARGET}"
