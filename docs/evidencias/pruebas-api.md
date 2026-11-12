# Evidencias de Pruebas de API Backend — Entregable 2 (E2)

Este documento detalla la matriz de pruebas manuales y solicitudes `curl` diseñadas para verificar el correcto funcionamiento de los nuevos endpoints del backend, cubriendo los 6 escenarios críticos de lógica de negocio, manejo de errores y preservación de integridad referencial.

---

## 1. Tabla Resumen de Escenarios Evaluados

| #        | Escenario                                                      | Método y Endpoint                           | Entrada / Condición                                                             | Código HTTP Esperado | Criterio / Regla de Negocio Validada                                                                                                |
| -------- | -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- | :------------------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| **E-01** | **Videojuego sin partidas**                                    | `GET /api/videojuegos/:id/progreso-semanal` | Videojuego nuevo o con 0 partidas registradas                                   |       `200 OK`       | Valores neutros seguros: `horasJugadas: 0`, `diasJugados: 0`, `porcentaje: 0`, `rachaActual: 0`, `mejorRacha: 0`, hitos pendientes. |
| **E-02** | **Videojuego con ≥ 5 partidas en días distintos y racha rota** | `GET /api/videojuegos/:id/progreso-semanal` | 5 partidas en días consecutivos pasados; sin partidas hoy ni ayer               |       `200 OK`       | **RN-01**: `rachaActual: 0` al transcurrir hoy y ayer sin juego; `mejorRacha: 5` reconoce el récord histórico acumulado.            |
| **E-03** | **Respuesta 400 (ID malformado)**                              | `GET /api/videojuegos/:id/progreso-semanal` | Parámetro `:id` no convertible a BSON (`"id-invalido-123"`)                     |  `400 Bad Request`   | Captura centralizada en `errorHandler.ts` emitiendo error de formato con identificador `requestId`.                                 |
| **E-04** | **Respuesta 404 (ID inexistente)**                             | `GET /api/videojuegos/:id/progreso-semanal` | ObjectId de 24 caracteres válido pero inexistente en base de datos              |   `404 Not Found`    | Lanza `NotFoundError` informando que el recurso solicitado no fue encontrado.                                                       |
| **E-05** | **Respuesta 409 (Segunda meta activa)**                        | `POST /api/metas`                           | Videojuego con meta activa previa; se intenta registrar otra con `activa: true` |    `409 Conflict`    | **RN-04 / T-04**: Conflicto capturado por validación en servicio o índice único `{ videojuego: 1, activa: 1 }` de MongoDB.          |
| **E-06** | **Eliminación en cascada sin metas huérfanas**                 | `DELETE /api/videojuegos/:id`               | Videojuego que posee partidas registradas y una meta con hitos                  |   `204 No Content`   | **RN-08 / T-05**: Borrado simultáneo de partidas y metas en `videojuegos.service.ts`; cero registros residuales.                    |

---

## 2. Detalle Exhaustivo de Pruebas y Comandos `curl`

---

### E-01: Videojuego sin partidas

**Objetivo:**  
Verificar que un videojuego recién creado que posee una meta configurada pero aún no registra ninguna partida devuelva métricas en cero sin provocar fallos de división ni excepciones en la lógica de dominio.

#### Solicitud `curl`:

```bash
curl -X GET "http://localhost:5000/api/videojuegos/6732386a9f4c3a1b5d120001/progreso-semanal" \
  -H "Accept: application/json"
```

#### Respuesta esperada:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Request-Id: 4f1a23b9-8c01-49b8-a6e3-5dc112000001

{
  "meta": {
    "_id": "6732387e9f4c3a1b5d120002",
    "horasSemanaDeseadas": 5,
    "diasSemanaDeseados": 4,
    "activa": true
  },
  "progresoSemanal": {
    "horasJugadas": 0,
    "horasSemanaDeseadas": 5,
    "diasJugados": 0,
    "diasSemanaDeseados": 4,
    "porcentajeReal": 0,
    "porcentajeVisual": 0
  },
  "rachas": {
    "rachaActual": 0,
    "mejorRacha": 0
  },
  "hitos": [
    {
      "nombre": "Primeros pasos",
      "horasRequeridas": 10,
      "alcanzado": false
    }
  ]
}
```

---

### E-02: Videojuego con al menos 5 partidas en días distintos y racha rota

**Objetivo:**  
Demostrar el cumplimiento estricto de la regla **RN-01**: la racha actual se rompe y cae a 0 si no se ha jugado ni hoy ni ayer, pero el algoritmo preserva el récord histórico en `mejorRacha`.

#### Preparación (Secuencia de 5 partidas pasadas consecutivas):

- Día 1: `2024-11-01T15:00:00-05:00` (60 min)
- Día 2: `2024-11-02T15:00:00-05:00` (60 min)
- Día 3: `2024-11-03T15:00:00-05:00` (60 min)
- Día 4: `2024-11-04T15:00:00-05:00` (60 min)
- Día 5: `2024-11-05T15:00:00-05:00` (60 min)
  _(Transcurren varios días de inactividad; fecha de evaluación actual: posterior al 07 de noviembre)._

#### Solicitud `curl`:

```bash
curl -X GET "http://localhost:5000/api/videojuegos/6732386a9f4c3a1b5d120001/progreso-semanal" \
  -H "Accept: application/json"
```

#### Respuesta esperada:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-store
X-Request-Id: 8e2b910f-712c-4f90-880a-938210330002

{
  "meta": {
    "_id": "6732387e9f4c3a1b5d120002",
    "horasSemanaDeseadas": 5,
    "diasSemanaDeseados": 4,
    "activa": true
  },
  "progresoSemanal": {
    "horasJugadas": 0,
    "horasSemanaDeseadas": 5,
    "diasJugados": 0,
    "diasSemanaDeseados": 4,
    "porcentajeReal": 0,
    "porcentajeVisual": 0
  },
  "rachas": {
    "rachaActual": 0,
    "mejorRacha": 5
  },
  "hitos": [
    {
      "nombre": "Explorador",
      "horasRequeridas": 5,
      "alcanzado": true
    },
    {
      "nombre": "Veterano",
      "horasRequeridas": 15,
      "alcanzado": false
    }
  ]
}
```

---

### E-03: Respuesta 400 (ID malformado)

**Objetivo:**  
Verificar que el middleware centralizado intercepte errores de formato de identificador BSON y retorne `400 Bad Request` en lugar de una caída no controlada (500).

#### Solicitud `curl`:

```bash
curl -i -X GET "http://localhost:5000/api/videojuegos/id-invalido-123/progreso-semanal"
```

#### Respuesta esperada:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
X-Request-Id: a3b7190c-33df-402a-9bc1-12a760b90003

{
  "error": "El ID proporcionado no tiene un formato válido.",
  "requestId": "a3b7190c-33df-402a-9bc1-12a760b90003"
}
```

---

### E-04: Respuesta 404 (ID inexistente)

**Objetivo:**  
Comprobar que un identificador sintácticamente válido pero que no se corresponde con ningún documento de la base de datos sea rechazado con `404 Not Found`.

#### Solicitud `curl`:

```bash
curl -i -X GET "http://localhost:5000/api/videojuegos/507f1f77bcf86cd799439011/progreso-semanal"
```

#### Respuesta esperada:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
X-Request-Id: b4c8201d-44ea-413b-acd2-23b871ca0004

{
  "error": "Videojuego no encontrado.",
  "requestId": "b4c8201d-44ea-413b-acd2-23b871ca0004"
}
```

---

### E-05: Respuesta 409 (Intento de crear una segunda meta activa)

**Objetivo:**  
Verificar que la regla de negocio de **máximo una meta activa por videojuego** y el índice único parcial `{ videojuego: 1, activa: 1 }` detengan la creación concurrente y emitan `409 Conflict`.

#### Solicitud `curl`:

```bash
curl -i -X POST "http://localhost:5000/api/metas" \
  -H "Content-Type: application/json" \
  -d '{
    "videojuego": "6732386a9f4c3a1b5d120001",
    "horasSemanaDeseadas": 8,
    "diasSemanaDeseados": 5,
    "activa": true,
    "hitos": [
      { "nombre": "Marca diez", "horasRequeridas": 10 }
    ]
  }'
```

#### Respuesta esperada:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8
X-Request-Id: c5d9312e-55fb-424c-bde3-34c982db0005

{
  "error": "Ya existe una meta activa para este videojuego. Desactívala antes de registrar otra.",
  "requestId": "c5d9312e-55fb-424c-bde3-34c982db0005"
}
```

---

### E-06: Eliminación de videojuego sin dejar metas huérfanas

**Objetivo:**  
Confirmar que al suprimir un videojuego (`DELETE /api/videojuegos/:id`), la función `eliminarVideojuego` elimine simultáneamente en cascada todas las partidas y metas vinculadas a ese `_id`.

#### Paso 1: Solicitud de eliminación `curl`

```bash
curl -i -X DELETE "http://localhost:5000/api/videojuegos/6732386a9f4c3a1b5d120001"
```

#### Respuesta esperada del borrado:

```http
HTTP/1.1 204 No Content
X-Request-Id: d6ea423f-66ac-435d-cef4-45da93ec0006
```

#### Paso 2: Verificación de ausencia de metas huérfanas

Al intentar consultar las metas del videojuego eliminado o su detalle:

```bash
curl -i -X GET "http://localhost:5000/api/videojuegos/6732386a9f4c3a1b5d120001/metas"
```

#### Respuesta esperada tras la eliminación:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
X-Request-Id: e7fb5340-77bd-446e-df05-56eb04fd0007

{
  "error": "El videojuego no existe.",
  "requestId": "e7fb5340-77bd-446e-df05-56eb04fd0007"
}
```

_(Asimismo, la colección `metas` en base de datos confirma que `MetaModel.countDocuments({ videojuego: ObjectId("6732386a9f4c3a1b5d120001") }) === 0`, garantizando una cascada limpia y sin referencias rotas)._
