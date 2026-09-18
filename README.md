# API de articulos de calzado

# API de artículos de calzado

Backend para gestionar artículos de calzado usando Node.js, Express y MongoDB.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` con:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/tiendaweb
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@ubyh71ha
AUTH_JWT_SECRET=<secreto-aleatorio-de-al-menos-32-caracteres>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=<hash-bcrypt-de-la-contrasena>
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:4173
```

## Ejecución

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

## Endpoints

### POST /api/auth/login

Inicia sesión con `ADMIN_EMAIL` y la contraseña correspondiente a
`ADMIN_PASSWORD_HASH`. Devuelve un token JWT válido durante 15 minutos.
Las demás rutas de la API requieren `Authorization: Bearer <token>` y rol `admin`.

Genera el hash de la contraseña sin guardarla en el código:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" "Tu contraseña segura"
```

Guarda el resultado en `ADMIN_PASSWORD_HASH` y genera `AUTH_JWT_SECRET` con un
secreto aleatorio de al menos 32 caracteres.

Para crear los 2 encargados y 8 vendedores iniciales con contraseñas aleatorias:

```bash
npm run seed:empleados
```

El comando guarda solo hashes bcrypt en la colección `empleados` y muestra las
credenciales de las cuentas nuevas una vez. Si la cuenta ya existe, conserva su
hash y no invalida su contraseña. Los encargados pueden usar todos los módulos;
los vendedores no tienen autorización para `/api/clientes`.

Las cuentas iniciales son:

- Encargados: `encargado1@tiendaweb.local`, `encargado2@tiendaweb.local`.
- Vendedores: `vendedor1@tiendaweb.local` hasta `vendedor8@tiendaweb.local`.

Las contraseñas no se pueden recuperar porque se almacenan como hashes bcrypt.
Para restablecer una cuenta concreta, define las variables solo en el entorno
local o en un shell seguro y ejecuta:

```bash
set RESET_EMAIL=encargado1@tiendaweb.local
set RESET_PASSWORD=UnaNuevaContraseñaSegura
npm run reset:empleado
```

En PowerShell usa `$env:RESET_EMAIL` y `$env:RESET_PASSWORD` en lugar de `set`.
No incluyas estos valores en Git, logs, tickets o capturas de pantalla.

### GET /api/articulos

Devuelve todos los artículos.

### GET /api/articulos/:id

Devuelve un artículo por su ID.

### POST /api/articulos

Crea un artículo.

Ejemplo de cuerpo:

```json
{
  "Articulo": "Nike Air Max",
  "ImagenArt": "https://example.com/nike.jpg",
  "Detalles": "Calzado deportivo con suela amortiguada."
}
```

### POST /api/articulos/imagen

Sube una imagen a Cloudinary. Envía un formulario `multipart/form-data` con el archivo
en el campo `imagen` (máximo 5 MB). La respuesta incluye `ImagenArt`, que puedes usar
al crear o actualizar el artículo.

Ejemplo con `curl`:

```bash
curl -X POST http://localhost:3000/api/articulos/imagen \
  -F "imagen=@./zapatilla.jpg"
```

### PUT /api/articulos/:id

Actualiza un artículo.

### DELETE /api/articulos/:id

Elimina un artículo.

### GET /api/pedidos

Devuelve todos los pedidos ordenados por fecha descendente. Si un pedido no tiene
fecha, se utiliza su fecha de creación.

## Base de datos

Las colecciones se crean automáticamente en MongoDB con los nombres `articulos`,
`clientes` y `pedidos`.
# TiendaWeb frontend

Panel administrativo construido con React y Vite para gestionar artículos, inventario, pedidos, ventas, clientes y empleados.

## Requisitos

- Node.js 20 o superior
- Un backend de TiendaWeb accesible desde el navegador

## Desarrollo local

```bash
npm install
copy .env.example .env
npm run dev
```

Configura `VITE_API_URL` con la URL pública del backend. Las variables `VITE_*` se incorporan al bundle del navegador, por lo que nunca deben contener secretos.

## Comprobaciones de producción

```bash
npm run lint
npm run test:ci
npm run build
npm run preview
```

La suite de pruebas simuladas cubre permisos por rol, filtros de inventario, estados de pedidos, carrito de ventas, payloads de venta y respuestas HTTP/autenticación. Para trabajar en modo interactivo usa `npm test`.

## CI/CD en GitHub

El workflow de `.github/workflows/ci.yml` ejecuta automáticamente lint, pruebas y build en cada push a `main` o `develop`, y en cada pull request.

El workflow de `.github/workflows/deploy.yml` ejecuta las mismas comprobaciones y publica automáticamente `dist` en GitHub Pages al hacer push a `main`. En la configuración del repositorio, selecciona **Settings > Pages > Source: GitHub Actions**.

Antes del primer despliegue, crea la variable de repositorio `VITE_API_URL` con la URL HTTPS del backend. GitHub Actions la inyecta durante el build.

El manual técnico completo está disponible en [manual-despliegue-desarrollador.html](public/manual-despliegue-desarrollador.html) y también puede descargarse desde la pantalla de inicio de sesión.

La guía específica para desplegar el frontend en Vercel y el backend en Heroku está en [manual-despliegue-vercel-heroku.html](public/manual-despliegue-vercel-heroku.html).

La guía recomendada para desplegar la API en Render, la base de datos en MongoDB Atlas y las imágenes en Cloudinary está en [manual-despliegue-render-atlas-cloudinary.html](public/manual-despliegue-render-atlas-cloudinary.html).

La guía unificada del stack completo Vercel + Render + MongoDB Atlas + Cloudinary está en [manual-despliegue-vercel-render-atlas-cloudinary.html](public/manual-despliegue-vercel-render-atlas-cloudinary.html).

## Configuración local

El frontend sube las imágenes al backend y este las almacena en Cloudinary. Copia `.env.example` como `.env` si el backend no está en `http://localhost:3000`.

En `app-TiendaWeb-backend/.env` deben existir las credenciales de Cloudinary:

```env
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@ubyh71ha
```

No coloques `CLOUDINARY_URL`, la API key ni el API secret en el `.env` del frontend: Vite expone las variables `VITE_*` al navegador.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
