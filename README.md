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
