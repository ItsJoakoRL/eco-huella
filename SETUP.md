# Eco-Huella - Full Stack

App de cálculo de huella de carbono con autenticación, CRUD y dashboard.

## Estructura del Proyecto

```
eco-huella/
├── backend/              # API Node.js + Express + MongoDB
│   ├── models/          # Modelos de datos
│   ├── controllers/      # Controladores de negocio
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware personalizado
│   ├── config/          # Configuración
│   ├── server.js        # Servidor principal
│   ├── seed.js          # Script para inicializar BD
│   ├── .env             # Variables de entorno
│   └── package.json
└── src/                 # Frontend React + Vite
    ├── components/      # Componentes React
    │   ├── features/    # Componentes de negocio
    │   ├── admin/       # Panel de admin
    │   ├── auth/        # Páginas de autenticación
    │   ├── layout/      # Componentes de layout
    │   ├── ui/          # Componentes reutilizables
    │   └── ProtectedRoute.jsx
    ├── context/         # React Context (Auth)
    ├── services/        # Servicios de API
    ├── data/            # Datos estáticos
    ├── App.jsx          # Componente principal
    └── main.jsx
```

## Requisitos Previos

- **Node.js** v20+ y **npm** v10+
- **MongoDB** corriendo localmente (o usar connection string remota en .env)

## Instalación

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
npm install
```

## Configuración

### 1. MongoDB

Si tienes MongoDB instalado localmente, asegúrate de que está corriendo:

```bash
# En Windows (si está instalado como servicio)
net start MongoDB

# O manualmente
mongod
```

### 2. Variables de Entorno (.env)

El archivo `backend/.env` ya está configurado, pero verifica:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eco-huella
JWT_SECRET=tu_clave_secreta_super_segura_aqui_cambiarla_en_produccion
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Inicializar Base de Datos

```bash
cd backend
node seed.js
```

Esto creará:
- Admin: admin@eco-huella.com / admin123456
- Usuario Test: user@eco-huella.com / user123456
- Preguntas de ejemplo
- Parámetros de emisión por defecto

## Ejecución

### Opcion recomendada - Frontend y backend juntos

```bash
npm run dev:all
```

En PowerShell de Windows, si `npm` aparece bloqueado, usar:

```powershell
npm.cmd run dev:all
```

Tambien se puede abrir `start-dev.bat`.

La app estara en: `http://localhost:8080/login`

### Opcion manual - Terminal 1 Backend

```bash
cd backend
npm run dev
# O: npm start
```

El servidor estará en: `http://localhost:5000`

### Terminal 2 - Frontend

```bash
npm run dev
```

La app estara en: `http://localhost:8080`

## Flujo de la Aplicación

1. **Landing Page** - Presenta la propuesta
2. **Login/Signup** - Autenticación de usuarios
3. **Quiz** - Responde preguntas sobre:
   - Hogar (electricidad, calefacción)
   - Transporte (km/semana, medio)
   - Alimentación (dieta, procedencia)
   - Residuos (reciclaje, reparación)
4. **Dashboard** - Visualiza:
   - Emisiones por categoría
   - Total en CO2e
   - Comparación con media
   - Planetas necesarios
5. **Admin Panel** (solo admins)
   - Gestionar preguntas del cuestionario
   - Gestionar usuarios y roles
   - Ajustar parámetros de emisión

## API Endpoints

### Autenticación

- `POST /api/auth/signup` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)
- `PUT /api/auth/profile` - Actualizar perfil (requiere token)

### Preguntas

- `GET /api/questions` - Obtener todas las preguntas
- `GET /api/questions/:id` - Obtener pregunta por ID
- `POST /api/questions` - Crear pregunta (admin)
- `PUT /api/questions/:id` - Actualizar pregunta (admin)
- `DELETE /api/questions/:id` - Eliminar pregunta (admin)

### Resultados del Quiz

- `GET /api/results` - Mis resultados (requiere token)
- `GET /api/results/:id` - Obtener resultado por ID
- `POST /api/results` - Guardar resultado del quiz
- `PUT /api/results/:id` - Actualizar resultado
- `DELETE /api/results/:id` - Eliminar resultado

### Parámetros de Emisión

- `GET /api/parameters` - Obtener todos los parámetros
- `GET /api/parameters/:category` - Obtener por categoría
- `PUT /api/parameters/:category` - Actualizar parámetros (admin)

### Gestión de Usuarios (Admin)

- `GET /api/admin/users` - Listar usuarios (admin)
- `GET /api/admin/users/:id` - Obtener usuario (admin)
- `PUT /api/admin/users/:id` - Actualizar usuario (admin)
- `DELETE /api/admin/users/:id` - Eliminar usuario (admin)
- `PATCH /api/admin/users/:id/role` - Cambiar rol (admin)

## Autenticación

La autenticación usa **JWT** (JSON Web Tokens):

1. Usuario se registra/inicia sesión
2. Backend retorna un token
3. Token se guarda en `localStorage`
4. Se envía en el header `Authorization: Bearer <token>`
5. Middleware verifica y autoriza requests

## Próximos Pasos

- [ ] Tests unitarios
- [ ] Export PDF/CSV de reportes
- [ ] Gráficos históricos de emisiones
- [ ] Integración con datos públicos de emisiones
- [ ] API para sincronizar datos entre dispositivos
- [ ] Modo offline con sync

## Desarrollo

### Scripts disponibles

**Frontend:**
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run dev:all  # Iniciar frontend y backend juntos
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Análisis estático
```

**Backend:**
```bash
npm run dev      # Servidor con watch (nodemon)
npm start        # Servidor normal
node seed.js     # Inicializar base de datos
```

## Troubleshooting

### Error: "MongoDB connection failed"

- Verifica que MongoDB está corriendo
- Comprueba el MONGODB_URI en `.env`
- Intenta crear la BD manualmente en MongoDB Compass

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
npm install
cd backend && npm install
```

### Puerto 5000 en uso

Cambia el PORT en `backend/.env`:

```env
PORT=5001
```

Y actualiza la URL de API en `src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:5001/api";
```

## Notas

- El JWT expira en 7 días (configurable en `.env`)
- Las contraseñas se hashean con bcryptjs
- Las preguntas y parámetros se pueden modificar sin tocar el código
