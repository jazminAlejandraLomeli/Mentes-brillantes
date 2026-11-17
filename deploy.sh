#!/usr/bin/env bash
# ------------------------------------------------------------
#  Actualiza el sitio en Hostinger después de hacer `git push`.
#  Uso (por SSH, dentro de la carpeta del proyecto):  bash deploy.sh
#  GitHub Actions lo corre solo en cada push a main (.github/workflows/deploy.yml).
# ------------------------------------------------------------
set -e
cd "$(dirname "$0")"

# La consola de Hostinger usa PHP 8.3 por defecto; el proyecto necesita 8.4+
if [ -z "$PHP_BIN" ]; then
  if [ -x /opt/alt/php85/usr/bin/php ]; then PHP_BIN=/opt/alt/php85/usr/bin/php; else PHP_BIN=php; fi
fi

echo "→ PHP: $("$PHP_BIN" -r 'echo PHP_VERSION;')"

echo "→ Descargando cambios…"
git pull --ff-only

echo "→ Instalando dependencias de PHP…"
# Hostinger desactiva proc_open para los sitios web; Composer lo necesita en la consola
"$PHP_BIN" -d disable_functions= "$(command -v composer)" install --no-dev --optimize-autoloader --no-interaction

echo "→ Actualizando la base de datos…"
"$PHP_BIN" artisan migrate --force

# Enlace para que se vean las fotos que se suben desde el panel.
# Con PHP 8.5 Hostinger bloquea symlink() y `artisan storage:link` falla,
# así que se crea con la consola.
if [ ! -e public/storage ]; then
  echo "→ Creando el enlace de las fotos (public/storage)…"
  ln -s "$PWD/storage/app/public" public/storage
fi

echo "→ Optimizando…"
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan optimize

echo "✅ Listo."
