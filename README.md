# Checkpoint — Diario de Progreso Gamer

**Checkpoint** es mi aplicación full-stack para registrar qué videojuegos estoy jugando, cuánto tiempo les dedico y qué avance real alcanzo en cada sesión. La diseñé para resolver el problema de dispersar ese seguimiento entre notas, listas y recuerdos: ahora puedo organizar mi biblioteca, marcar logros y consultar un historial cronológico desde una sola interfaz.

## Qué implementé

- Una biblioteca filtrable por plataforma, género y estado.
- Alta, edición y eliminación de videojuegos, con portada por URL externa.
- Logros embebidos que puedo marcar directamente desde el detalle.
- Registro y eliminación de sesiones, con fecha, duración, avance y notas.
- Historial global y por videojuego, además de un resumen calculado en el servidor.
- Una SPA responsive con estados visibles de carga, error recuperable y colección vacía.

## Guía de Navegación y Uso de la Aplicación

### Exploro mi biblioteca

Al abrir `/`, llego a **Biblioteca**, que también está disponible desde el enlace **Biblioteca** de la navegación superior. En la barra **FILTRAR** uso los selectores **Plataforma**, **Género** y **Estado**; cada uno comienza en **Todos** y puedo combinar criterios para reducir la lista. Las tarjetas muestran la portada —o el arte abstracto de respaldo—, el nombre, la plataforma, el género y el número de logros.

Desde una tarjeta abro el detalle seleccionando el nombre del videojuego. También puedo entrar a **Editar** o iniciar su eliminación desde **Eliminar**, que solicita confirmación antes de borrar el juego y sus sesiones.

### Registro y edición de un videojuego

El botón **Añadir videojuego** abre `/videojuegos/nuevo`. Allí completo el nombre, la plataforma, el género y el estado; también puedo pegar una **URL de la portada / imagen** y agregar logros iniciales con **Añadir logro**. Para guardar uso **Crear videojuego** y para salir sin guardar, **Cancelar**.

Para modificar un título existente uso **Editar** en su tarjeta o **Editar juego** desde su detalle. La ruta es `/videojuegos/:id/editar`; al completar los cambios, el botón **Guardar cambios** vuelve al detalle del título.

### Consulto el detalle y actualizo mi progreso

En `/videojuegos/:id` consulto la información del título, su portada y estado. El bloque **Resumen de progreso** presenta cuatro métricas calculadas por la API:

| Métrica en pantalla | Qué muestra |
|---|---|
| **SESIONES** | Cantidad de partidas registradas. |
| **TIEMPO JUGADO** | Horas acumuladas, redondeadas a un decimal por el backend. |
| **ÚLTIMA SESIÓN** | Fecha de la partida cronológicamente más reciente. |
| **AVANCE ACTUAL** | Porcentaje guardado en esa última sesión. |

Al abrir el detalle, la interfaz consulta el videojuego, el resumen y el historial; por eso refleja las sesiones guardadas en esa carga. Después de registrar una partida, regreso al detalle y sus métricas se vuelven a consultar. No implementé actualización en vivo mediante WebSocket.

En **Logros** marco o desmarco la casilla de cada objetivo. La acción actualiza directamente el subdocumento embebido del videojuego. En **Sesiones recientes** reviso fecha, notas, duración y avance; puedo eliminar una sesión con el botón correspondiente y confirmo la acción en el diálogo.

Para registrar una sesión desde el detalle uso **＋ Registrar sesión** o **＋ Añadir sesión**. Ambos llevan a `/partidas/nueva?videojuego=:id` con ese juego preseleccionado. En el formulario indico la **Fecha de sesión**, **Duración (minutos)**, ajusto **Porcentaje de avance**, añado **Notas** opcionales y guardo con **Guardar sesión**. Si accedo desde la lista global, selecciono el videojuego en el formulario.

### Recorro todas mis sesiones

El enlace superior **Sesiones** abre `/partidas`, donde veo **Tu historial** con las partidas ordenadas cronológicamente, el videojuego y su plataforma, las notas, la duración y el avance. Desde esta pantalla uso **＋ Registrar sesión** para crear una sesión sin salir primero de la lista. Cada entrada se puede eliminar; la aplicación pide confirmación antes de hacerlo.

### Estados de carga, error y vacío

En las pantallas conectadas a la API diseñé estados explícitos para que el recorrido sea comprensible mientras llegan los datos o si algo falla:

- **Carga:** muestro skeletons para la biblioteca, el detalle, el historial global y los formularios.
- **Error:** presento el mensaje devuelto por la operación y, cuando corresponde, el botón **Reintentar** para volver a consultar o guardar.
- **Vacío:** en la biblioteca muestro **Todavía no hay juegos**; el historial global muestra **Sin sesiones todavía**; y el detalle indica si aún no existen sesiones o logros para ese videojuego. Si intento registrar una sesión sin juegos, ofrezco **Añadir videojuego**.

## Decisiones de modelado: datos embebidos y referenciados

Diseñé `Videojuego` para guardar sus datos propios: nombre, URL de portada opcional, plataforma, género, estado, logros y timestamps. Definí los valores permitidos mediante enums de TypeScript y validaciones del esquema Mongoose.

### Por qué embebí `logros`

Modelé `logros` como subdocumentos `{ nombre, obtenido }` dentro de `Videojuego`. En mi dominio, los logros se leen siempre junto con la ficha del juego, no tienen ciclo de vida independiente y no justifican una colección aparte. Además, cada juego tiene un conjunto finito y acotado de objetivos. Embebidos, puedo obtener y actualizar un logro como parte del documento al que pertenece.

### Por qué referencié `Partida`

Guardé cada `Partida` en su propia colección y la vinculé con el videojuego mediante un `ObjectId`. El historial puede crecer de forma ilimitada a lo largo de meses o años; también necesito consultarlo independientemente, por ejemplo para recorrer mis sesiones recientes o todo mi historial semanal. Mantener las sesiones separadas evita que el documento principal se sature y se acerque al límite BSON de 16 MB. La referencia me permite consultar, ordenar, eliminar y agregar las partidas sin cargar todos esos datos dentro de cada videojuego.

## Cómo calculo el resumen de progreso

Implementé la lógica en `backend/src/services/videojuegos.service.ts`, no en el cliente. Así, el cálculo usa una única regla para cualquier consumidor de la API y la interfaz solo presenta un resultado calculado por el backend.

Para el videojuego solicitado, primero verifico que exista y luego consulto sus partidas ordenadas cronológicamente por `fecha` descendente. A partir de esa lista:

```text
totalPartidas = cantidad de partidas
minutosTotales = suma de duracionMinutos
horasTotales = Math.round((minutosTotales / 60) * 10) / 10
ultimaPartida = fecha de la primera partida ordenada, en formato ISO
porcentajeAvanceActual = porcentajeAvance de esa misma partida
```

Si todavía no existen partidas, devuelvo `totalPartidas: 0`, `horasTotales: 0`, `ultimaPartida: null` y `porcentajeAvanceActual: 0`. Ordenar por `fecha` descendente hace que la última sesión cronológica —no necesariamente el documento creado más recientemente— determine la fecha y el avance actuales. Cuando dos sesiones tienen la misma fecha, uso `createdAt` y `_id` descendentes como desempate para que la sesión insertada más recientemente aparezca primero.

Para probar y demostrar las métricas, recomiendo registrar cada sesión en días distintos, por ejemplo en días consecutivos. El formulario maneja la fecha con granularidad `YYYY-MM-DD`, así que dos sesiones del mismo día comparten el mismo valor de `fecha` y el orden cronológico por `fecha: -1` no basta por sí solo para distinguir cuál ocurrió después dentro de ese día. El desempate por inserción mantiene un resultado determinista; aun así, usar fechas distintas hace más evidente en la demostración por qué una sesión es la más reciente y qué `porcentajeAvanceActual` debe reflejarse.

## Arquitectura

Separé el código para mantener claras las responsabilidades y que cada capa pueda evolucionar sin mezclar acceso HTTP, reglas de negocio y persistencia.

```text
backend/
└── src/
    ├── config/        # Variables de entorno y conexión a MongoDB
    ├── models/        # Esquemas e interfaces Mongoose
    ├── services/      # Reglas de negocio y consultas
    ├── controllers/   # Adaptación de req/res y status HTTP
    ├── routes/        # Endpoints Express
    ├── middlewares/   # requestId, logger, asyncHandler y errores
    ├── types/         # Tipos de dominio
    ├── app.ts
    └── server.ts

frontend/
└── src/
    ├── services/      # Cliente HTTP y funciones de videojuegos/partidas
    ├── pages/         # Biblioteca, detalle, formularios e historial
    ├── components/    # Layout, portadas, skeletons y diálogos
    ├── types.ts
    └── App.tsx        # Rutas React Router
```

En el backend, el flujo es **Routes → Controllers → Services → Models**. En el frontend, las **páginas consumen servicios de API desacoplados** y componen componentes reutilizables; ninguna página hace `fetch` directamente. Construí la SPA con React, TypeScript, Vite y React Router DOM, y usé CSS modular de la aplicación para los estilos responsive.

## API REST

Todos mis endpoints usan el prefijo `/api`.

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/health` | Verifico que el servicio esté disponible. |
| `GET` | `/videojuegos` | Listo videojuegos y acepto filtros opcionales de plataforma, género y estado. |
| `GET` | `/videojuegos/:id` | Obtengo el detalle de un videojuego. |
| `POST` | `/videojuegos` | Creo un videojuego. |
| `PUT` | `/videojuegos/:id` | Actualizo un videojuego. |
| `DELETE` | `/videojuegos/:id` | Elimino el juego y sus partidas asociadas. |
| `PATCH` | `/videojuegos/:id/logros/:logroId` | Marco o alterno un logro embebido. |
| `GET` | `/videojuegos/:id/partidas` | Consulto el historial de un juego. |
| `GET` | `/videojuegos/:id/resumen` | Obtengo el resumen calculado en el servicio. |
| `GET` | `/partidas` | Listo partidas con el videojuego asociado mediante `populate`. |
| `POST` | `/partidas` | Creo una partida después de validar que exista su videojuego. |
| `DELETE` | `/partidas/:id` | Elimino una partida. |

## Manejo centralizado de errores

Centralicé el mapeo de errores en `backend/src/middlewares/errorHandler.ts`. Cada solicitud recibe un UUID que envío en el header `X-Request-Id`; también lo incluyo en errores y lo uso para relacionar la respuesta con el log de método, ruta, estado y duración.

| Error | HTTP | Qué hago |
|---|---:|---|
| Validación de esquema de Mongoose | `400` | Devuelvo el error de validación. |
| `CastError` por ID o valor incompatible | `400` | Indico que el valor no tiene el formato esperado. |
| Recurso o videojuego referenciado inexistente | `404` | Respondo que el recurso no fue encontrado. |
| Error inesperado de servidor o base de datos | `500` | Registro el detalle en servidor y devuelvo un mensaje con `requestId`. |

## Instalación y ejecución local

### Requisitos

- Node.js 20 o superior y npm.
- MongoDB Atlas o una instancia MongoDB accesible.
- Git.

### 1. Clono el repositorio

```bash
git clone https://github.com/TheRealLemonMan/Entregable3.git
cd Entregable3
```

### 2. Configuro y ejecuto el backend

```bash
cd backend
npm install
```

Copio `backend/.env.example` como `backend/.env` y configuro mis valores:

```dotenv
PORT=5000
MONGODB_URI=<mi_uri_de_mongodb>
CLIENT_ORIGIN=http://localhost:5173
```

`MONGODB_URI` es obligatoria. No subo mi `.env` ni credenciales al repositorio; `.gitignore` excluye esos archivos.

Inicio el servidor de desarrollo desde `backend/`:

```bash
npm run dev
```

Compruebo la API en `http://localhost:5000/api/health`.

### 3. Configuro y ejecuto el frontend

En otra terminal:

```bash
cd frontend
npm install
```

Copio `frontend/.env.example` como `frontend/.env`. La variable `VITE_API_URL` define la URL base del backend, sin el sufijo `/api`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Si no la defino, el cliente usa de forma segura `http://localhost:5000`. Inicio Vite desde `frontend/`:

```bash
npm run dev
```

Abro `http://localhost:5173`.

### 4. Compilo las aplicaciones

Desde cada carpeta (`backend/` y `frontend/`) ejecuto:

```bash
npm run build
```

Para arrancar la compilación del servidor uso `npm start` desde `backend/`. Para previsualizar la compilación de Vite uso `npm run preview` desde `frontend/`.

## Despliegue en Render

### Backend — Web Service

1. Creo un **Web Service** conectado a mi repositorio y establezco `backend` como **Root Directory**.
2. Configuro **Build Command** como `npm install && npm run build` y **Start Command** como `npm start`.
3. En las variables de entorno del servicio defino:
   - `MONGODB_URI`: mi URI de Atlas, como secreto de Render.
   - `CLIENT_ORIGIN`: origen público exacto del Static Site, por ejemplo `https://checkpoint-gamer-app.onrender.com`.
   - `PORT`: Render lo proporciona; mi aplicación lo lee y utiliza `5000` solo como valor predeterminado.
4. Verifico el despliegue con `/api/health`.

### Frontend — Static Site

1. Creo un **Static Site** conectado al mismo repositorio y establezco `frontend` como **Root Directory**.
2. Configuro **Build Command** como `npm install && npm run build` y **Publish Directory** como `dist`.
3. Defino `VITE_API_URL` con la URL pública del Web Service, sin `/api`, por ejemplo `https://checkpoint-backend-api.onrender.com`.
4. En **Settings → Redirects/Rewrites** del Static Site, agrego una regla con acción **Rewrite**, source `/*` y destination `/index.html`. Render no importa automáticamente el archivo `public/_redirects`, así que esta regla del dashboard es necesaria para recargar rutas de React Router. Mantengo `frontend/public/_redirects` en el proyecto para proveedores que sí admiten ese formato.
5. Despliego y pruebo tanto la navegación como la recarga directa de rutas. Si Render asigna otros dominios, actualizo `CLIENT_ORIGIN` y `VITE_API_URL` con las URLs efectivas y vuelvo a desplegar los servicios correspondientes.

### Enlaces de entrega

Estas son las URLs previstas para la entrega; si Render asigna dominios distintos, reemplazaré las URLs públicas después del despliegue.

- **Frontend en Producción:** [https://checkpoint-gamer-app.onrender.com](https://checkpoint-gamer-app.onrender.com)
- **Backend API en Producción:** [https://checkpoint-backend-api.onrender.com](https://checkpoint-backend-api.onrender.com)
- **Repositorio GitHub:** [TheRealLemonMan/Entregable3](https://github.com/TheRealLemonMan/Entregable3)
