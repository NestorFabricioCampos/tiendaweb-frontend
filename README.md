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
