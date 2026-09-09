# React + Vite

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
