# 🏐 Sitio Web — Club de Voley

Aplicación completa desarrollada a partir del documento "Carpeta Virtual Club de Voley"
(historias de usuario, casos de uso y modelo de base de datos). Incluye:

- **Backend** en Node.js + Express + PostgreSQL, con autenticación por roles y envío de
  correos reales a jugadores/directores técnicos a través de **Gmail**.
- **Frontend** en HTML/CSS/JS puro (sin frameworks), listo para abrir y editar en **VS Code**.
- **Base de datos** en PostgreSQL, pensada para administrarse desde **pgAdmin**.

Ya fue probado de punta a punta (login, roles, horarios, noticias, resultados, pago de
cuota y envío de mensajes) durante el desarrollo.

---

## 1. Estructura del proyecto

```
club-voley/
├── backend/                 → API REST (Node.js + Express)
│   ├── server.js
│   ├── db.js
│   ├── schema.sql           → script para pgAdmin
│   ├── .env.example         → copiar como ".env" y completar
│   ├── middleware/auth.js
│   ├── utils/mailer.js      → envío de correos por Gmail
│   └── routes/*.routes.js
└── frontend/                 → sitio web (abrir con Live Server de VS Code)
    ├── index.html, login.html, noticias.html, horarios.html, resultados.html, galeria.html
    ├── panel-jugador.html / panel-director.html / panel-admin.html
    ├── css/style.css
    └── js/*.js
```

---

## 2. Base de datos en pgAdmin

1. Abrí **pgAdmin**, conectate a tu servidor de PostgreSQL.
2. Creá una base de datos nueva llamada `club_voley` (clic derecho en "Databases" → Create → Database).
3. Con `club_voley` seleccionada, abrí el **Query Tool**.
4. Abrí el archivo `backend/schema.sql` de este proyecto, pegá todo su contenido en el Query
   Tool y ejecutalo (▶️). Esto crea las 9 tablas (usuario, categoria, equipo, jugador,
   horario, noticia, partido, cuota, mensaje) y carga usuarios y datos de ejemplo.
5. Usuarios de prueba que quedan creados (contraseña para los tres: `123456`):
   - `admin@clubvoley.com` → Administrador
   - `director@clubvoley.com` → Director Técnico
   - `jugador@clubvoley.com` → Jugador

---

## 3. Backend en VS Code

1. Abrí la carpeta `club-voley/backend` en VS Code.
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Copiá `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
4. Completá el `.env` con los datos reales de tu PostgreSQL (usuario, contraseña, nombre
   de la base `club_voley`) y de Gmail (ver sección siguiente).
5. Iniciá el servidor:
   ```bash
   npm start
   ```
   Vas a ver: `🏐 Servidor del Club de Voley corriendo en http://localhost:3000`

---

## 4. Configurar el envío de mensajes por Gmail

El panel del Director Técnico y del Administrador permite enviar un mensaje real por correo
a jugadores/directores (uno, todos, por rol o por equipo). Para que funcione:

1. Entrá con la cuenta de Gmail del club a <https://myaccount.google.com/security> y activá
   la **verificación en 2 pasos** (si no la tenés activada).
2. Andá a <https://myaccount.google.com/apppasswords> y generá una **contraseña de
   aplicación** para "Correo".
3. En el `.env` del backend completá:
   ```
   EMAIL_USER=tuclub@gmail.com
   EMAIL_PASS=la_clave_de_16_caracteres_generada
   ```
4. Reiniciá el servidor. Cada envío queda además registrado en la tabla `mensaje` para
   auditoría (visible en el panel de Administrador → "Historial de envíos").

> Sin esta configuración, el sitio funciona igual, pero el envío de correos fallará
> (quedará registrado con estado "error" en el historial).

---

## 5. Frontend

El propio backend sirve el sitio web, así que **no hace falta ningún servidor extra**:

1. Con el backend corriendo (`npm start` dentro de `backend/`), abrí en el navegador
   <http://localhost:3000> — ahí vas a tener el sitio completo con la API funcionando.

Alternativa (Live Server de VS Code u otro servidor estático):

- Si abrís el frontend por un puerto distinto al 3000 (por ejemplo Live Server usa el 5500),
  tenés que cambiar la constante `API_BASE` en `frontend/js/api.js` a la URL completa del
  backend, por ejemplo `http://localhost:3000/api`, porque si no las llamadas a la API van a
  caer al puerto equivocado y todo fallará.
- La forma recomendada es simplemente usar <http://localhost:3000>, que ya funciona sin
  tocar nada.

---

## 6. Recorrido de la aplicación

- **Página pública** (`index.html`): noticias, horarios, resultados y galería, visibles sin
  iniciar sesión — igual que en el mapa de navegación del documento original.
- **Login / Registro** (`login.html`): los jugadores pueden auto-registrarse; directores
  técnicos y administradores los crea el Administrador desde su panel.
- **Panel Jugador**: horarios de su equipo, resultados, pago de cuota (simulado — queda
  el circuito listo para conectar un procesador de pagos real) y noticias.
- **Panel Director Técnico**: publicar noticias, cargar resultados de partidos, gestionar
  horarios de su equipo y **enviar mensajes por Gmail** a sus jugadores.
- **Panel Administrador**: gestión de usuarios y roles (HU08), equipos y categorías, y
  **mensajería masiva** por Gmail (a todos, por rol, por equipo o a una persona), con
  historial de envíos.

---

## 7. Notas y posibles mejoras futuras

- El pago de cuota está **simulado** (se marca como pagada al instante); para producción
  habría que integrar un procesador real (Mercado Pago, Stripe, etc.) en
  `backend/routes/cuotas.routes.js`.
- La galería de fotos es estática (placeholders); el documento original la marca como una
  posible ampliación futura con subida real de imágenes.
- Por simplicidad, cualquier Director Técnico o Administrador puede cargar horarios/
  resultados/noticias para cualquier equipo (no solo el propio). Si querés restringirlo
  estrictamente al equipo asignado, se puede agregar esa validación en las rutas
  correspondientes.

---

## 8. Despliegue gratis: Supabase (base de datos) + Vercel (sitio y API)

### 8.1 — Base de datos en Supabase

1. Creá una cuenta en <https://supabase.com> y creá un proyecto nuevo.
2. Abrí el **SQL Editor** del proyecto, pegá todo el contenido de `backend/schema.sql`
   y ejecutalo. Esto crea las 9 tablas y los usuarios de ejemplo.
   > ⚠️ El script hace `DROP TABLE` de todo: usalo solo en la base nueva de Supabase
   > o vas a perder los datos que tengas.
3. Andá a **Project Settings → Database → Connection string → Transaction pooler**
   (puerto 6543). Copiá los datos para las variables de entorno del paso 8.3:
   - Host: algo como `aws-0-xx-xxxx-x.pooler.supabase.com`
   - Usuario: `postgres.<referencia-del-proyecto>`
   - Contraseña: la que definiste al crear el proyecto
   - Base: `postgres`

### 8.2 — Subir el código a GitHub

Creá un repositorio en GitHub y subí el proyecto completo (`backend/`, `frontend/`, `api/`,
`vercel.json`, etc.). El `.gitignore` ya excluye `.env` y `node_modules`.

### 8.3 — Deploy en Vercel

1. Entrá a <https://vercel.com>, creá un proyecto desde tu repo de GitHub (no hace falta
   configurar nada de framework; el `vercel.json` incluido resuelve las rutas).
2. Antes del primer deploy, en **Settings → Environment Variables** cargá:

   | Variable | Valor |
   |----------|-------|
   | `DB_HOST` | host del pooler de Supabase |
   | `DB_PORT` | `6543` |
   | `DB_NAME` | `postgres` |
   | `DB_USER` | `postgres.<referencia>` |
   | `DB_PASSWORD` | contraseña de Supabase |
   | `DB_SSL` | `true` (obligatorio con Supabase) |
   | `JWT_SECRET` | una clave larga y aleatoria **distinta** a la local |
   | `EMAIL_USER` | Gmail del club |
   | `EMAIL_PASS` | contraseña de aplicación de Gmail |
   | `CORS_ORIGINS` | `https://<tu-proyecto>.vercel.app` |

3. Hacé **Deploy**. Al finalizar vas a tener el sitio y la API en
   `https://<tu-proyecto>.vercel.app` y podés iniciar sesión con los usuarios demo.

### 8.4 — Notas sobre producción

- Los usuarios demo siguen teniendo contraseña `123456`: cambiá la del admin apenas entres
  (o eliminá esos usuarios y creá los reales).
- El límite de intentos del login es por instancia en serverless: como primera barrera
  funciona, pero si querés algo robusto usá un store compartido (ej: Upstash Redis).
- Si Gmail rechaza envíos desde la nube, generá una contraseña de aplicación nueva o usá
  un servicio transaccional (Resend, Brevo) cambiando el transportador en
  `backend/utils/mailer.js`.
