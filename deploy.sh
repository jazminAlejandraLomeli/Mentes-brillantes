#!/usr/bin/env bash
# ------------------------------------------------------------
#  Actualiza el sitio en Hostinger después de hacer `git push`.
#  Uso (por SSH, dentro de la carpeta del proyecto):  bash deploy.sh
# ------------------------------------------------------------
set -e

PHP_BIN="${PHP_BIN:-php}"   # si el php de la consola es viejo: PHP_BIN=/opt/alt/php84/usr/bin/php bash deploy.sh

echo "→ Descargando cambios…"
git pull --ff-only

echo "→ Instalando dependencias de PHP…"
"$PHP_BIN" "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction

echo "→ Actualizando la base de datos…"
"$PHP_BIN" artisan migrate --force

echo "→ Optimizando…"
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan optimize

echo "✅ Listo."
