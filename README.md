# Checkpoint — Diario Gamer

**Checkpoint — Diario de Progreso Gamer** es una aplicación web full-stack para llevar una biblioteca personal de videojuegos, registrar sesiones de juego y consultar el progreso, logros y tiempo acumulado de cada aventura. La interfaz está en español, es adaptable a escritorio y móvil y consume una API REST tipada.

## Funcionalidades

- Crear, consultar, editar y eliminar videojuegos con plataforma, género, estado, logros y URL externa de portada.
- Filtrar la biblioteca por plataforma, género y estado.
- Marcar logros obtenidos directamente desde el detalle.
- Registrar y eliminar sesiones con fecha, duración, avance y notas.
- Consultar el resumen de sesiones, las horas jugadas y el progreso más reciente.
- Mostrar estados de carga, error recuperable y colección vacía.

## Arquitectura

El repositorio contiene dos aplicaciones desacopladas:

### Backend (`backend/`)

API REST construida con Node.js, Express, TypeScript y Mongoose, organizada en capas:

- **Routes** (`src/routes/`): declara los endpoints y conecta cada ruta con un controlador.
- **Controllers** (`src/controllers/`): interpreta solicitudes HTTP, llama servicios y establece respuestas/status.
- **Services** (`src/services/`): concentra reglas de negocio y consultas a modelos.
- **Models** (`src/models/`): define esquemas e interfaces persistidas en MongoDB.
- **Middlewares** (`src/middlewares/`): asigna IDs de solicitud, registra tiempos, adapta funciones asíncronas y centraliza errores.
- **Config** (`src/config/`): valida el entorno y conecta con MongoDB.

### Frontend (`frontend/`)

SPA con React, TypeScript, Vite y React Router DOM. La capa `src/services/` centraliza las llamadas HTTP y las páginas no realizan solicitudes de red directamente. La presentación utiliza CSS modular de la aplicación con estilos responsive, estados accesibles y soporte para `prefers-reduced-motion`; **no se emplea Tailwind CSS**.

## Modelo de datos y justificación

### Videojuego

El documento `Videojuego` contiene:

- `nombre`: string requerido y recortado.
- `portadaUrl`: URL externa opcional.
- `plataforma`: `PC`, `PlayStation`, `Xbox`, `Switch` o `Movil`.
- `genero`: `accion`, `rol`, `estrategia`, `puzzle`, `deportes` u `otro`.
- `estado`: `jugando`, `pausado`, `completado` o `abandonado`.
- `logros`: subdocumentos embebidos `{ nombre, obtenido }`.
- Timestamps automáticos `createdAt` y `updatedAt`.

### Partida

Cada documento `Partida` almacena una referencia `ObjectId` al videojuego (`ref: "Videojuego"`), fecha, duración mínima de un minuto, avance de 0 a 100, notas opcionales y timestamps. La lista general usa `populate("videojuego")` para mostrar el juego relacionado.

### Por qué los logros se embeben

Los **logros** tienen un ciclo de vida acotado y dependiente del videojuego: no existen por separado de su juego y normalmente se consultan o actualizan desde la pantalla de detalle. Embebidos, se cargan junto al juego y su estado se modifica de forma atómica dentro del documento. Su tamaño y cantidad son controlados por el catálogo de logros propio de cada título.

### Por qué las partidas se referencian

Las **partidas** crecen sin límite práctico a lo largo del tiempo y se consultan, ordenan, eliminan y agregan de manera independiente. Guardarlas embebidas haría que el documento creciera continuamente y pudiera alcanzar el límite BSON de **16 MB** por documento. Una colección independiente permite paginar o consultar el historial y hacer agregaciones sin cargar/modificar el documento principal; la referencia conserva la relación con el videojuego.

## Resumen de progreso

El servicio que implementa `GET /api/videojuegos/:id/resumen` primero comprueba que exista el videojuego. Después obtiene sus partidas ordenadas por fecha descendente y calcula:

1. `totalPartidas`: número de sesiones asociadas.
2. `minutosTotales = suma(partida.duracionMinutos)`.
3. `horasTotales = Number((minutosTotales / 60).toFixed(1))`.
4. `ultimaPartida`: fecha de la primera partida de la lista ordenada, serializada con `toISOString()`, o `null` si no existen sesiones.
5. `porcentajeAvanceActual`: avance de esa misma sesión cronológicamente más reciente, o `0` si no existen sesiones.

El orden descendente por `fecha` asegura que el avance presentado corresponde a la última sesión registrada según su fecha de juego, no al orden de creación del documento.

## API REST

Todos los endpoints están bajo el prefijo `/api`.

| Método | Ruta | Uso |
|---|---|---|
| GET | `/health` | Comprueba que el servidor responde. |
| GET | `/videojuegos` | Lista juegos; acepta filtros opcionales `plataforma`, `genero` y `estado`. |
| GET | `/videojuegos/:id` | Detalle de un videojuego. |
| POST | `/videojuegos` | Crea un videojuego. |
| PUT | `/videojuegos/:id` | Actualiza sus datos. |
| DELETE | `/videojuegos/:id` | Elimina el juego y sus partidas asociadas. |
| PATCH | `/videojuegos/:id/logros/:logroId` | Actualiza `obtenido` del logro embebido. |
| GET | `/videojuegos/:id/partidas` | Historial del videojuego. |
| GET | `/videojuegos/:id/resumen` | Resumen calculado de progreso. |
| GET | `/partidas` | Lista partidas con el videojuego populado. |
| POST | `/partidas` | Registra una partida después de validar la referencia. |
| DELETE | `/partidas/:id` | Elimina una partida. |

El backend responde con 400 para validación e IDs mal formados, 404 para recursos o referencias inexistentes y 500 para errores inesperados. Cada solicitud obtiene un UUID en `X-Request-Id`, también incluido en las respuestas de error, y el logger registra método, ruta, status y duración.

## Requisitos

- Node.js 20 o superior y npm.
- MongoDB Atlas o una instancia MongoDB accesible.
- Git para clonar el repositorio.

## Ejecución local

### 1. Obtener el código

```bash
git clone <URL_DEL_REPOSITORIO>
cd <CARPETA_DEL_REPOSITORIO>
```

### 2. Configurar y arrancar el backend

Desde `backend/`:

```bash
npm install
cp .env.example .env
```

En Windows PowerShell, para copiar el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

Edita `backend/.env` y define:

| Variable | Requerida | Descripción |
|---|---|---|
| `PORT` | No | Puerto del servicio; predeterminado `5000`. |
| `MONGODB_URI` | Sí | URI de conexión a MongoDB. Usa credenciales propias fuera del repositorio. |
| `CLIENT_ORIGIN` | No | Origen(es) frontend permitidos por CORS, separados por comas. Por defecto `http://localhost:5173`. |

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El health check local está en `http://localhost:5000/api/health`.

### 3. Configurar y arrancar el frontend

En otra terminal, desde `frontend/`:

```bash
npm install
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

`frontend/.env` contiene `VITE_API_URL`, la URL base del backend sin `/api`. En local se usa `http://localhost:5000`; Vite utiliza ese mismo valor como fallback si la variable no está definida.

```bash
npm run dev
```

La aplicación estará en `http://localhost:5173`.

### Compilar y ejecutar producción local

Ejecuta en cada carpeta de aplicación:

```bash
npm run build
```

Para probar la compilación del backend: `cd backend && npm start`. Para previsualizar el build del frontend: `cd frontend && npm run preview`.

## Despliegue en Render

La base de datos debe ser accesible desde Render. En MongoDB Atlas, autoriza el acceso de red para el servicio desplegado y utiliza una URI con permisos mínimos apropiados. No guardes credenciales en Git ni en archivos `.env.example`; define secretos desde **Environment** en Render.

### 1. Backend — Web Service

1. En Render selecciona **New → Web Service** y conecta el repositorio.
2. Configura **Root Directory** como `backend`.
3. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Añade las variables:
   - `MONGODB_URI`: URI real de MongoDB Atlas (secreto).
   - `CLIENT_ORIGIN`: URL exacta del Static Site frontend, por ejemplo `https://tu-frontend.onrender.com`.
   - `PORT`: Render administra el puerto de servicio; la aplicación respeta `PORT` y usa `5000` como fallback.
5. Despliega y verifica `https://<servicio-backend>.onrender.com/api/health`.

### 2. Frontend — Static Site

1. En Render selecciona **New → Static Site** y conecta el mismo repositorio.
2. Configura **Root Directory** como `frontend`.
3. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Define `VITE_API_URL` con la URL pública del Web Service, sin añadir `/api`, por ejemplo `https://tu-backend.onrender.com`.
5. Despliega y prueba la Biblioteca y la recarga directa de una ruta de React Router. `public/_redirects` se copia a `dist/_redirects` y configura el fallback SPA `/* /index.html 200`.
6. Añade la URL pública del Static Site a `CLIENT_ORIGIN` en el servicio backend y vuelve a desplegar el backend si cambiaste el valor.

### URLs de despliegue

- Backend Web Service: **pendiente de despliegue** — `https://________________________________`
- Frontend Static Site: **pendiente de despliegue** — `https://________________________________`
