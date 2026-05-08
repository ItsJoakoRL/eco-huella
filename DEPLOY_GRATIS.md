# Deploy gratis de EcoHuella

Esta guia deja la app publica con links gratis:

- Frontend: Vercel, por ejemplo `https://ecohuella.vercel.app`
- Backend: Render, por ejemplo `https://ecohuella-api.onrender.com`
- Base de datos: MongoDB Atlas Free

## 1. Subir el proyecto a GitHub

Vercel y Render trabajan mejor conectados a un repositorio.

1. Crea un repositorio en GitHub.
2. Sube este proyecto.
3. No subas archivos `.env`; ya estan ignorados por `.gitignore`.

## 2. Crear MongoDB Atlas Free

1. Entra a `https://cloud.mongodb.com`.
2. Crea una cuenta o inicia sesion.
3. Crea un proyecto.
4. Crea un cluster gratis.
5. En `Database Access`, crea un usuario de base de datos.
6. En `Network Access`, permite conexiones. Para pruebas gratis, puedes usar `0.0.0.0/0`.
7. En el cluster, toca `Connect`.
8. Elige `Drivers`.
9. Copia la URL `mongodb+srv://...`.
10. Cambia `<password>` por la password real del usuario.
11. Asegurate de que la URL apunte a la base `eco-huella`.

Ejemplo:

```text
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/eco-huella?retryWrites=true&w=majority
```

## 3. Publicar backend en Render

1. Entra a `https://render.com`.
2. Crea cuenta o inicia sesion.
3. Toca `New` y despues `Web Service`.
4. Conecta GitHub y elige este repositorio.
5. Configura:

```text
Name: ecohuella-api
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

6. En `Environment`, agrega:

```text
MONGODB_URI=tu_url_de_mongodb_atlas
JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRE=7d
NODE_ENV=production
```

7. Deploy.
8. Cuando termine, Render te dara un link parecido a:

```text
https://ecohuella-api.onrender.com
```

9. Prueba:

```text
https://ecohuella-api.onrender.com/api/health
```

Si responde `Backend running`, esta bien.

## 4. Inicializar datos en la base

Cuando el backend ya este conectado a MongoDB Atlas:

1. En Render, entra al servicio `ecohuella-api`.
2. Busca `Shell`.
3. Ejecuta:

```bash
npm run seed
```

Esto crea usuarios de prueba, preguntas y parametros iniciales.

## 5. Publicar frontend en Vercel

1. Entra a `https://vercel.com`.
2. Crea cuenta o inicia sesion.
3. Toca `Add New` y despues `Project`.
4. Importa el mismo repositorio de GitHub.
5. Configura:

```text
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. En `Environment Variables`, agrega:

```text
VITE_API_BASE_URL=https://ecohuella-api.onrender.com/api
```

Cambia `ecohuella-api.onrender.com` por el link real que te dio Render.

7. Deploy.
8. Vercel te dara un link parecido a:

```text
https://ecohuella.vercel.app
```

## 6. Importante sobre planes gratis

- Render Free puede dormirse si nadie usa la API por un rato. La primera carga puede tardar.
- Vercel Free sirve muy bien para el frontend.
- MongoDB Atlas Free alcanza para pruebas y presentaciones.
- Para usar `https://ecohuella.com`, igual necesitarias comprar ese dominio.

## Fuentes oficiales

- Vercel con Vite: `https://vercel.com/docs/frameworks/vite`
- Variables de entorno en Vercel: `https://vercel.com/docs/projects/environment-variables`
- Render Web Services: `https://render.com/docs/web-services`
- Render Node/Express: `https://render.com/docs/deploy-node-express-app`
- MongoDB Atlas connection string: `https://www.mongodb.com/docs/atlas/driver-connection/`
