# API de articulos de calzado

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

## Base de datos

La colección se crea automáticamente en MongoDB con el nombre `articulos`.
