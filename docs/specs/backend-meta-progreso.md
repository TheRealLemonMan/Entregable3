# Especificación Técnica: Backend — Metas, Progreso Semanal y Rachas (`backend-meta-progreso`)

## 1. Contexto y Tickets que Cubre

Esta especificación detalla el diseño técnico, contratos y responsabilidades de las capas del backend para implementar el núcleo de metas, seguimiento de progreso semanal, evaluación de rachas y manejo de hitos, abarcando los siguientes tickets del backlog de E2:

- **T-01: Modelo Meta e Hitos:** Esquema y modelo Mongoose, tipos TypeScript e índice de unicidad para meta activa.
- **T-02: Funciones de Dominio Puras + Tests:** Lógica de negocio aislada en `src/dominio/` (semana lunes-domingo UTC-5, racha actual, mejor racha y evaluación de hitos).
- **T-03: Endpoint de Progreso Semanal:** Exposición de métricas agregadas semanales y rachas por videojuego.
- **T-04: CRUD de Metas y Control de 409 Conflict:** Creación, edición y desactivación de metas, previniendo duplicidad y validando el estado del videojuego.
- **T-05: Cascada al Eliminar:** Eliminación en cascada de metas e hitos vinculados al remover un videojuego.
- **T-06: Middleware errorHandler Integral:** Soporte centralizado y robusto para códigos HTTP 400, 404, 409 y 500 con trazabilidad `requestId`.

---

## 2. Decisiones de Modelado y Arquitectura

### 2.1 Por qué `Meta` se referencia por separado de `Videojuego`

El documento `Videojuego` encapsula la información descriptiva y de catálogo de un título (nombre, género, plataforma, estado y logros fijos del juego). Las metas semanales, en cambio, poseen un ciclo de vida propio, independiente y evolutivo:

- Un jugador puede definir una meta, desactivarla temporalmente o reemplazarla en semanas posteriores.
- Mantener `Meta` en su propia colección vinculada mediante `videojuego: ObjectId` permite conservar un histórico de metas pasadas sin saturar el documento del videojuego.
- Facilita la aplicación de un índice único condicional a nivel de base de datos (`{ videojuego: 1, activa: 1 }` donde `activa === true`), garantizando por restricción de base de datos que jamás coexistan dos metas activas para un mismo título.

### 2.2 Por qué los `Hitos` se embeben dentro de `Meta`

Los hitos de dedicación representan marcas u objetivos cuantitativos subordinados directamente a la meta configurada para ese título (por ejemplo: alcanzar 5 h, 15 h, 30 h):

- No tienen existencia ni relevancia fuera del contexto de la meta a la que pertenecen.
- Su cardinalidad es acotada y pequeña (típicamente entre 1 y 5 hitos por meta).
- Embeberlos como un arreglo de subdocumentos (`[{ nombre, horasObjetivo }]`) permite crearlos, validarlos y leerlos de manera atómica junto con la meta en una única operación, sin incurrir en colecciones adicionales ni joins innecesarios.

### 2.3 Por qué el estado "alcanzado" se calcula dinámicamente en tiempo de ejecución

El estado de cumplimiento de un hito **no se persiste** como un booleano en la base de datos (`alcanzado: boolean` no se almacena):

- Si se persistiera dicho valor, cualquier alteración en el diario de partidas (por ejemplo, corregir la duración de una sesión o eliminar una partida por error) dejaría el estado del hito desincronizado e incoherente frente a la realidad de las horas jugadas.
- Al calcularse dinámicamente mediante una función pura en `src/dominio/` comparando las `horasTotales` acumuladas contra `horasObjetivo`, el estado del hito siempre refleja la verdad matemática del historial vigente en tiempo real.
- Si las horas descienden, el hito pasa inmediatamente a estar pendiente sin requerir procesos de sincronización ni eventos reactivos propensos a fallos.

---

## 3. Reglas DEBE / NO DEBE

### DEBE (Requisitos obligatorios)

- **DEBE** ubicar toda la lógica matemática y temporal de corte de semana (lunes 00:00:00 a domingo 23:59:59 UTC-5), cálculo de rachas diarias y evaluación de hitos exclusivamente en `backend/src/dominio/` mediante funciones puras libres de efectos secundarios.
- **DEBE** acompañar cada función de `src/dominio/` con pruebas unitarias automatizadas exhaustivas que verifiquen todos los casos borde definidos en el PRD.
- **DEBE** computar las partidas según la fecha calendario oficial de su inicio en hora de Ecuador (UTC-5), asignando partidas que cruzan medianoche al día en que empezaron.
- **DEBE** contar múltiples partidas en un mismo día como 1 único día de actividad para el cálculo de rachas, sumando la totalidad de su duración para la meta semanal.
- **DEBE** mantener la racha activa si el día de ayer tuvo actividad, rompiéndola (0 días) únicamente si no se registraron partidas ni hoy ni ayer.
- **DEBE** aplicar la meta semanal activa a toda la semana corriente, aun cuando haya sido editada o activada a mitad de semana.
- **DEBE** limitar el indicador visual porcentual al 100 % cuando las horas jugadas superen la meta, manteniendo el valor real de horas completas sin truncar.
- **DEBE** responder con código HTTP 409 (Conflict) si se intenta crear o activar una meta para un videojuego que ya tiene una meta activa.
- **DEBE** responder con código HTTP 400 (Bad Request) si se intenta crear o activar una meta en un videojuego en estado "completado" o "abandonado".
- **DEBE** desactivar automáticamente la meta activa de un videojuego si su estado se actualiza a "completado" o "abandonado".
- **DEBE** eliminar en cascada todas las metas e hitos asociados cuando un videojuego es eliminado.
- **DEBE** incluir el encabezado y campo `requestId` en todas las respuestas de error procesadas por `errorHandler`.

### NO DEBE (Restricciones e invariantes)

- **NO DEBE** acoplar la capa de `src/dominio/` con Mongoose, Express, modelos de base de datos ni operaciones asíncronas de entrada/salida.
- **NO DEBE** permitir el registro de partidas con fecha u hora posterior al instante actual (UTC-5).
- **NO DEBE** permitir hitos con valores de `horasObjetivo` duplicados dentro de la misma meta.
- **NO DEBE** persistir el estado de desbloqueo de los hitos como campo booleano en la base de datos.
- **NO DEBE** emitir código HTTP 500 ante colisiones de claves únicas (`MongoServerError code 11000`) o identificadores malformados; deben resolverse como 409 o 400 según corresponda.
- **NO DEBE** leer ni modificar variables de archivos `.env` ni `.env.local`.

---

## 4. Tabla Criterio → Verificación

| Criterio de Aceptación | Escenario de Negocio                                            | Tipo de Verificación              | Método y Detalle de Verificación                                                                                                                     |
| ---------------------- | --------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CA-01.1**            | Creación válida de meta con hitos en juego activo               | Test unitario / curl              | POST a `/api/videojuegos/:id/metas` con payload válido; verificar status 201 y documento persistido en BD con `activa: true`.                        |
| **CA-01.2**            | Intento de crear segunda meta activa para el mismo juego (409)  | Test de integración / curl        | POST a `/api/videojuegos/:id/metas` cuando ya existe meta activa; verificar status 409 y mensaje descriptivo de conflicto.                           |
| **CA-01.3**            | Intento de fijar meta en juego completado/abandonado            | Test de integración               | POST a `/api/videojuegos/:id/metas` para un juego con `estado: "completado"`; verificar status 400 y mensaje de validación.                          |
| **CA-01.4**            | Hitos con horas objetivo duplicadas                             | Test unitario de validación       | POST con hitos `[{ horasObjetivo: 10 }, { horasObjetivo: 10 }]`; verificar rechazo 400 por umbrales duplicados.                                      |
| **CA-02.1**            | Cambio de meta a mitad de semana aplica a toda la semana        | Test unitario de dominio          | Invocar función pura de progreso semanal con partidas previas y nueva meta; verificar que el porcentaje evalúa toda la semana contra el nuevo valor. |
| **CA-02.2**            | Desactivación manual de meta                                    | Test de integración / curl        | PATCH a `/api/metas/:id/desactivar`; verificar que `activa` cambia a `false` y status 200.                                                           |
| **CA-02.3**            | Desactivación automática al pasar juego a completado/abandonado | Test de integración               | PUT a `/api/videojuegos/:id` cambiando estado a "completado"; verificar que la meta activa asociada pasa a `activa: false`.                          |
| **CA-03.1**            | Varias partidas en un mismo día cuentan como 1 día jugado       | Test unitario de dominio          | Enviar lista con 3 partidas en la misma fecha (ej. martes); verificar que la función pura devuelve `diasJugados: 1` y la suma de horas de las 3.     |
| **CA-03.2**            | Partida que cruza medianoche pertenece al día de inicio (UTC-5) | Test unitario de dominio          | Evaluar partida iniciada a las 23:30 de un viernes que finaliza sábado; verificar que el día computado es viernes.                                   |
| **CA-03.3**            | Meta superada con tope visual al 100 %                          | Test unitario de dominio          | Meta de 4h y acumuladas 6h; verificar que `porcentajeVisual` es exactamente 100 y `horasJugadas` reporta 6.0.                                        |
| **CA-03.5**            | Rechazo de partidas con fecha futura                            | Test de integración               | POST a `/api/partidas` con fecha del día de mañana; verificar status 400 de error de validación.                                                     |
| **CA-04.1**            | Racha incrementada al registrar partida hoy                     | Test unitario de dominio          | Secuencia de fechas que incluye ayer y hoy; verificar que la racha actual se incrementa en 1 día.                                                    |
| **CA-04.2**            | Racha sigue viva si ayer hubo juego pero hoy aún no             | Test unitario de dominio          | Secuencia de fechas consecutivas que termina en ayer (sin registro hoy); verificar que la racha no cae a cero y cuenta los días hasta ayer.          |
| **CA-04.3**            | Racha rota por inactividad de hoy y ayer                        | Test unitario de dominio          | Secuencia donde la última partida fue hace 2 días o más; verificar que `rachaActual` es 0.                                                           |
| **CA-04.4**            | Cálculo correcto de mejor racha histórica                       | Test unitario de dominio          | Historial con racha pasada de 6 días y racha actual de 2 días; verificar `mejorRacha: 6` y `rachaActual: 2`.                                         |
| **CA-05.1**            | Desbloqueo dinámico de hito al alcanzar horas                   | Test unitario de dominio          | Invocar función evaluadora con 15.5 horas acumuladas e hito de 15h; verificar `alcanzado: true`.                                                     |
| **CA-05.2**            | Revocación dinámica de hito si bajan las horas                  | Test unitario de dominio          | Invocar función evaluadora con 13.0 horas acumuladas e hito de 15h; verificar `alcanzado: false`.                                                    |
| **CA-06.1**            | Eliminación en cascada de metas e hitos al borrar juego         | Test de integración               | Crear juego, partidas y meta con hitos; DELETE a `/api/videojuegos/:id`; verificar que `MetaModel.find({ videojuego: id })` retorna vacío.           |
| **T-06 (409)**         | Captura de `MongoServerError code 11000` en errorHandler        | Test de integración de middleware | Provocar duplicidad intencional en índice único; verificar que la API responde HTTP 409 con `{ error, requestId }` y no 500.                         |

---

## 5. Tabla Ticket → Archivos

| Ticket   | Responsabilidad Técnica                                          | Archivos Creados o Modificados                                                                                                                                                                                                                                                                                                                                                                           |
| -------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T-01** | Modelo `Meta`, interfaz de dominio e índices                     | • `backend/src/models/meta.model.ts` (Nuevo)<br>• `backend/src/types/domain.ts` (Modificado)                                                                                                                                                                                                                                                                                                             |
| **T-02** | Lógica de dominio pura (semana, rachas, hitos) y tests unitarios | • `backend/src/dominio/fechas.ts` (Nuevo)<br>• `backend/src/dominio/progresoSemanal.ts` (Nuevo)<br>• `backend/src/dominio/rachas.ts` (Nuevo)<br>• `backend/src/dominio/hitos.ts` (Nuevo)<br>• `backend/src/dominio/fechas.test.ts` (Nuevo)<br>• `backend/src/dominio/progresoSemanal.test.ts` (Nuevo)<br>• `backend/src/dominio/rachas.test.ts` (Nuevo)<br>• `backend/src/dominio/hitos.test.ts` (Nuevo) |
| **T-03** | Servicio, controlador y ruta para progreso semanal y rachas      | • `backend/src/services/progreso.service.ts` (Nuevo)<br>• `backend/src/controllers/progreso.controller.ts` (Nuevo)<br>• `backend/src/routes/videojuegos.routes.ts` (Modificado)                                                                                                                                                                                                                          |
| **T-04** | CRUD de metas, validaciones de estado y control 409              | • `backend/src/services/metas.service.ts` (Nuevo)<br>• `backend/src/controllers/metas.controller.ts` (Nuevo)<br>• `backend/src/routes/metas.routes.ts` (Nuevo)<br>• `backend/src/app.ts` (Modificado: registro de rutas de metas)<br>• `backend/src/services/videojuegos.service.ts` (Modificado: desactivación al completar/abandonar)                                                                  |
| **T-05** | Borrado en cascada de metas e hitos al eliminar videojuego       | • `backend/src/services/videojuegos.service.ts` (Modificado: inclusión de `MetaModel.deleteMany`)                                                                                                                                                                                                                                                                                                        |
| **T-06** | Soporte de 409 Conflict, validaciones y mapeo en `errorHandler`  | • `backend/src/services/errors.ts` (Modificado: clase `ConflictError`)<br>• `backend/src/middlewares/errorHandler.ts` (Modificado: captura de `ConflictError` y `code 11000`)                                                                                                                                                                                                                            |
