# Cómo dar de alta a un cliente nuevo

Este sistema es **marca blanca**: el mismo código sirve para cualquier maestra,
centro de regularización o taller. Cada cliente tiene **su propia copia**, con
su propia base de datos y su propio dominio o subdominio.

Para un cliente nuevo **no hay que tocar código**: solo `config/site.json`,
el archivo `.env` y, desde su panel, el logo y los colores.

---

## 1. Copiar el proyecto

```bash
git clone <tu-repositorio> nombre-del-cliente
cd nombre-del-cliente
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## 2. Llenar `config/site.json`

Es el único archivo con los datos del negocio. Se puede editar en el servidor
(por ejemplo, desde el Administrador de archivos de Hostinger) y el cambio
se ve al instante.

| Campo | Qué es | Ejemplo |
|---|---|---|
| `business.name` | Nombre corto del negocio | `Pequeños Genios` |
| `business.full_name` | Nombre completo (título de la pestaña y redes) | `Pequeños Genios by Ana` |
| `business.owner` | Nombre de quien usa el panel ("¡Hola, Ana!") | `Ana` |
| `business.tagline` | Frase corta del pie de página | `Clases de inglés para niños` |
| `business.teacher` | Nombre debajo del logo (si no sube logo) | `Lic. Ana Pérez` |
| `business.signature` | Firma de los WhatsApp | `Ana de Pequeños Genios` |
| `whatsapp.phone` | Celular a 10 dígitos | `3312345678` |
| `whatsapp.default_message` | Mensaje del botón de WhatsApp de la página | `¡Hola! Quiero informes 🌟` |
| `social.*` | Instagram, Facebook, TikTok (vacío = no se muestra) | `https://instagram.com/...` |
| `categories` | Tipos de servicio (ver abajo) | |
| `hero` | Frase grande de bienvenida. Las palabras entre `*asteriscos*` se resaltan | `Aprende *inglés* jugando` |
| `highlights` | Las 3 tarjetas de "por qué elegirnos" | |

### Categorías de servicios

```json
"categories": [
    { "key": "kids", "label": "Inglés para niños", "color": "primary" },
    { "key": "teens", "label": "Inglés para adolescentes", "color": "secondary" },
    { "key": "summer", "label": "Curso de verano", "color": "accent" }
]
```

- `key`: identificador interno, sin espacios ni acentos. **No lo cambies** si ya hay servicios con él.
- `label`: lo que se ve en la página.
- `color`: `primary`, `secondary` o `accent` (los colores del tema).

### Salón con varios maestros

```json
"features": { "multi_teacher": true }
```

Al encenderlo aparece **Clases → Maestros** en el panel. Ahí se da de alta a
cada maestro con su color. Al agendar, se elige alumno **y** maestro; la agenda
muestra el color de cada maestro y se puede filtrar por él. El aviso de "se
enciman clases" solo cuenta las del mismo maestro. En los mensajes de WhatsApp
se puede usar `{maestro}`, por ejemplo: *"…la clase de {alumno} con {maestro}…"*.

Con `false` (una sola maestra, como Mentes Brillantes) no aparece nada de esto.

> Todos usan el mismo login del panel. Cada ficha de maestro ya trae un campo
> `user_id` para que, si algún día se necesitan logins separados por maestro,
> se liguen sin perder las clases agendadas.

### Iconos de las tarjetas "por qué elegirnos"

`heart`, `sparkles`, `message`, `book`, `star` o `users`.

## 3. Llenar el `.env`

```env
APP_NAME="Pequeños Genios by Ana"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://pequenosgenios.com

DB_DATABASE=...        # la base de datos que creaste en hPanel
DB_USERNAME=...
DB_PASSWORD=...

MAIL_USERNAME=hola@pequenosgenios.com   # correo creado en hPanel
MAIL_PASSWORD=...

ADMIN_NAME="Ana"
ADMIN_EMAIL=ana@correo.com              # con el que entrará al panel
ADMIN_PASSWORD=una-contraseña-temporal  # pídele que la cambie en "Mi cuenta"
```

## 4. Crear la base de datos (sin datos de ejemplo)

```bash
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=SettingsSeeder --force
php artisan storage:link
npm run build
php artisan optimize
```

> ⚠️ **No corras `php artisan db:seed` sin `--class`** en un cliente real:
> eso carga los alumnos, servicios y fotos de ejemplo de Mentes Brillantes.

## 5. Lo que hace el cliente desde su panel

Entra a `https://su-dominio.com/login` y en **Personalizar**:

1. **Colores, letras y logo** → sube su logo (PNG con fondo transparente se ve
   mejor). Se genera solo el icono de la pestaña del navegador. Elige una
   combinación pastel o sus propios colores.
2. **Mensajes de WhatsApp** → ajusta los textos de recordatorio, cancelación y
   cambio de horario.
3. En **Mi página web** carga sus banners, servicios, eventos y fotos.

## Checklist rápido

- [ ] `config/site.json` con los datos del cliente (sin "Mentes Brillantes")
- [ ] `.env` con dominio, base de datos, correo y usuario admin
- [ ] Migraciones + `AdminUserSeeder` + `SettingsSeeder` (sin datos de ejemplo)
- [ ] El cliente subió su logo y eligió sus colores
- [ ] Probar el botón de WhatsApp y "¿Olvidaste tu contraseña?"
