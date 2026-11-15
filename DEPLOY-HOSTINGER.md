# Subir la demo a Hostinger (plan Business)

Guía para publicar la demo en un **subdominio**, por ejemplo
`https://demo.tudominio.com`. Los mismos pasos sirven después para el sitio
real de un cliente (solo cambia el `.env`, ver el final).

> En los comandos, cambia `tudominio.com` por tu dominio y `u123456789` por tu
> usuario de Hostinger (aparece en hPanel → Avanzado → Acceso SSH).

---

## 0. En tu Mac: subir la última versión a GitHub

```bash
npm run build
git add -A
git commit -m "Versión para la demo"
git push
```

> `npm run build` es obligatorio antes de cada `push`: Hostinger no compila
> React, usa los archivos ya compilados de `public/build`.

---

## 1. En hPanel

### 1.1 Crear el subdominio
**Dominios → Subdominios → Crear subdominio** → escribe `demo`.
Anota la **carpeta** que te asigna (algo como
`public_html/demo` o `domains/demo.tudominio.com/public_html`). La usarás en el paso 4.

### 1.2 Versión de PHP: 8.4 o más nueva
**Avanzado → Configuración de PHP** → elige **PHP 8.4** (o 8.5).
El proyecto necesita **8.4.1 o más nueva**.
En la pestaña de extensiones, que estén activas: `gd`, `exif`, `fileinfo`, `intl`, `pdo_mysql`.

### 1.3 Base de datos
**Bases de datos → Bases de datos MySQL** → crea una, por ejemplo `demo`.
Anota los tres datos: nombre de la base, usuario y contraseña
(Hostinger les pone un prefijo, ej. `u123456789_demo`).

### 1.4 SSH
**Avanzado → Acceso SSH → Activar.** Anota la IP y el puerto (normalmente `65002`).

### 1.5 Si tu repositorio de GitHub es privado
**Avanzado → Git** → copia la **clave SSH** que te muestra y agrégala en GitHub:
tu repo → **Settings → Deploy keys → Add deploy key** (solo lectura).
Luego clonarás con la dirección `git@github.com:...` en lugar de `https://`.

---

## 2. Conectarte y descargar el proyecto

Desde la Terminal de tu Mac:

```bash
ssh -p 65002 u123456789@IP_DE_HOSTINGER
```

Ya dentro del servidor:

```bash
cd ~/domains/tudominio.com
```

```bash
git clone https://github.com/jazminAlejandraLomeli/Mentes-brillantes.git demo-app
```

```bash
cd demo-app
```

Revisa la versión de PHP de la consola (debe decir 8.4 o más):

```bash
php -v
```

> Si dice una versión vieja, usa la ruta completa en todos los comandos,
> por ejemplo `/opt/alt/php84/usr/bin/php` en lugar de `php`.

## 3. Instalar y configurar

```bash
composer install --no-dev --optimize-autoloader
```

```bash
cp .env.demo.example .env
```

```bash
nano .env
```

Cambia lo que dice **CAMBIAR**: `APP_URL` (tu subdominio con `https://`) y
los 3 datos de la base de datos. Guarda con `Ctrl + O`, Enter, y sal con `Ctrl + X`.

```bash
php artisan key:generate
```

```bash
php artisan migrate --seed --force
```

```bash
php artisan storage:link
```

```bash
php artisan optimize
```

## 4. Que el subdominio muestre la carpeta `public`

El subdominio debe mostrar `demo-app/public`, no la carpeta completa.
Reemplaza la carpeta que creó Hostinger (paso 1.1) por un acceso directo.

Ejemplo si la carpeta es `public_html/demo`:

```bash
cd ~/domains/tudominio.com
```

```bash
mv public_html/demo public_html/demo_original
```

```bash
ln -s ~/domains/tudominio.com/demo-app/public public_html/demo
```

> Si tu carpeta del paso 1.1 era otra (ej. `domains/demo.tudominio.com/public_html`),
> usa esa ruta en los dos comandos de arriba.

## 5. Candado de seguridad (https)

**Seguridad → SSL** → instala el certificado gratis para `demo.tudominio.com`.
Puede tardar unos minutos en activarse.

## 6. Reinicio automático cada noche

**Avanzado → Cron Jobs** → crea uno que se ejecute **cada minuto** con este comando:

```bash
/usr/bin/php /home/u123456789/domains/tudominio.com/demo-app/artisan schedule:run
```

Laravel se encarga de correr `demo:reset` a las **3:00 am**: borra lo que
subieron los visitantes y vuelve a cargar los datos de ejemplo.

Para reiniciarla a mano (por ejemplo, justo antes de presentarla):

```bash
cd ~/domains/tudominio.com/demo-app && php artisan demo:reset
```

---

## 7. Revisar que todo funcione

- [ ] `https://demo.tudominio.com` abre la página con el aviso negro de **demo** arriba
- [ ] Se ven las imágenes (si no, repite `php artisan storage:link`)
- [ ] `/login` muestra el acceso de demostración y entra al panel
- [ ] Subir una foto en Galería funciona
- [ ] El botón de WhatsApp abre el chat

## Problemas comunes

| Lo que ves | Qué hacer |
|---|---|
| **Error 500** | Revisa `storage/logs/laravel.log`. Casi siempre es el `.env` (datos de la base) |
| Página en blanco o sin estilos | Faltó `npm run build` antes del `push`, o no se subió `public/build` |
| Se ve la lista de carpetas o el código | El subdominio no apunta a `public` (paso 4) |
| Las fotos no cargan | `php artisan storage:link` y revisa que `APP_URL` tenga tu subdominio con `https` |
| `composer` dice que la versión de PHP no alcanza | Usa la ruta de PHP 8.4 (`/opt/alt/php84/usr/bin/php`) |
| "Access denied" de la base | Al nombre o al usuario les falta el prefijo `u123456789_` |

---

## Actualizar la demo después de hacer cambios

En tu Mac: `npm run build`, commit y push a `main`. **Ya no hay que entrar al servidor**:
GitHub Actions corre las pruebas y, si pasan, entra a Hostinger y corre `deploy.sh`
(`.github/workflows/deploy.yml`). El avance se ve en GitHub → pestaña **Actions**.

Para desplegar a mano (sin push): GitHub → Actions → **deploy** → **Run workflow**,
o por SSH:

```bash
cd ~/domains/tudominio.com/demo-app && bash deploy.sh
```

> El deploy automático necesita 3 secretos en GitHub (Settings → Secrets and
> variables → Actions): `SSH_PRIVATE_KEY`, `SSH_HOST` (`usuario@ip`) y
> `SSH_KNOWN_HOSTS`. La llave pública correspondiente va en hPanel → Acceso SSH → Claves SSH.

---

## Para el sitio real de un cliente (no demo)

Mismos pasos, con estas diferencias en el `.env`:

- `APP_DEMO=false` ← **importante**: así no se muestra el acceso ni se reinicia nada
- `APP_URL` con su dominio real
- El correo de Hostinger configurado (ver el bloque de correo en `.env.example`)
- `ADMIN_EMAIL` y una `ADMIN_PASSWORD` segura; que el cliente la cambie al entrar
- En el paso 3, en lugar de `migrate --seed`, crea la base **sin datos de ejemplo**:

```bash
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=SettingsSeeder --force
```
