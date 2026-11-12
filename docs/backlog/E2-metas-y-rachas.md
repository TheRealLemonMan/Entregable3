# Backlog — Entregable 2 (E2): Metas y Rachas

Este documento define las historias de usuario (siguiendo el formato INVEST), los criterios de aceptación en formato formal (DADO / CUANDO / ENTONCES) cubriendo todas las reglas de negocio del PRD, y la descomposición técnica en tickets (T-01 a T-12) con sus respectivas _Definition of Done_ (DoD) y dependencias. Concluye con la resolución y justificación de la deuda técnica identificada en el diagnóstico.

---

## 1. Historias de Usuario

### H-01: Crear meta con hitos

**Como** jugador comprometido con mi biblioteca,  
**quiero** definir una meta semanal de horas y registrar hitos acumulativos para un videojuego activo,  
**para** establecer un objetivo claro de dedicación y celebrar marcas de progreso.

- **I (Independiente):** Se puede implementar y probar de manera aislada respecto a la visualización de rachas.
- **N (Negociable):** La cantidad de hitos iniciales puede variar o ser opcional.
- **V (Valiosa):** Habilita la motivación del usuario al estructurar su tiempo de juego.
- **E (Estimable):** Alcance delimitado a la configuración y validación de la meta y sus hitos.
- **S (Small / Pequeña):** Enfocada puntualmente en la creación y validación de una meta por juego.
- **T (Testeable):** Verificable mediante pruebas unitarias y de integración de creación.

#### Criterios de Aceptación:

- **CA-01.1 (Creación exitosa):**  
  **DADO** un videojuego en estado "jugando" que no posee una meta semanal activa,  
  **CUANDO** el usuario define una meta semanal válida de horas (ej. 5 horas) con hitos opcionales de horas acumuladas,  
  **ENTONCES** el sistema registra la meta como activa y almacena los hitos asociados.
- **CA-01.2 (Unicidad de meta activa - RN-04 / 409):**  
  **DADO** un videojuego que ya cuenta con una meta semanal activa,  
  **CUANDO** el usuario intenta crear una nueva meta activa para el mismo juego,  
  **ENTONCES** el sistema rechaza la operación informando conflicto (409) debido a que ya existe una meta vigente.
- **CA-01.3 (Restricción por estado del videojuego - RN-07):**  
  **DADO** un videojuego en estado "completado" o "abandonado",  
  **CUANDO** el usuario intenta registrar una meta para dicho título,  
  **ENTONCES** el sistema rechaza la solicitud indicando que solo títulos en curso pueden tener metas activas.
- **CA-01.4 (Hitos con objetivo único - CN-04):**  
  **DADO** el formulario de creación de meta,  
  **CUANDO** el usuario ingresa dos hitos con el mismo valor de horas acumuladas (ej. dos hitos de 10 horas),  
  **ENTONCES** el sistema rechaza el registro exigiendo que cada hito tenga un umbral numérico distinto.

---

### H-02: Editar y desactivar meta

**Como** jugador cuyos hábitos y disponibilidad cambian,  
**quiero** modificar las horas de mi meta semanal o desactivarla voluntariamente,  
**para** mantener mis objetivos alineados a mi tiempo disponible real sin perder la coherencia de mi progreso.

- **I (Independiente):** Gestiona el ciclo de vida de una meta ya existente.
- **N (Negociable):** Se puede desactivar manual o automáticamente por cambio de estado del juego.
- **V (Valiosa):** Evita la frustración ante metas irreales o juegos pausados.
- **E (Estimable):** Involucra actualización de campos y transiciones de estado.
- **S (Small):** Delimitada a mutaciones de metas existentes.
- **T (Testeable):** Se evalúan los estados resultantes y la aplicación retroactiva en la semana.

#### Criterios de Aceptación:

- **CA-02.1 (Cambio de meta a mitad de semana - RN-04):**  
  **DADO** que el usuario acumuló 3 horas jugadas entre lunes y miércoles bajo una meta de 6 horas,  
  **CUANDO** el jueves modifica su meta semanal a 4 horas,  
  **ENTONCES** toda la semana corriente se evalúa contra la nueva meta de 4 horas (alcanzando el 75 % de avance).
- **CA-02.2 (Desactivación voluntaria):**  
  **DADO** una meta semanal activa,  
  **CUANDO** el usuario decide desactivarla,  
  **ENTONCES** la meta pasa a estado inactivo y no se computa para futuras semanas.
- **CA-02.3 (Desactivación automática por cambio de estado - RN-07):**  
  **DADO** un videojuego con una meta semanal activa,  
  **CUANDO** el usuario actualiza el estado del juego a "completado" o "abandonado",  
  **ENTONCES** la meta semanal asociada se desactiva automáticamente.
- **CA-02.4 (Conservación del histórico de metas - CN-05):**  
  **DADO** que una meta fue desactivada o reemplazada,  
  **CUANDO** se consulta el histórico de metas del juego,  
  **ENTONCES** el registro anterior permanece archivado para auditoría y consulta histórica.

---

### H-03: Ver horas y días de la semana frente a la meta

**Como** jugador en seguimiento de su rutina,  
**quiero** visualizar el total de horas jugadas en la semana actual y los días en que jugué en comparación con mi meta,  
**para** saber con precisión cuánto me falta para cumplir mi compromiso semanal.

- **I (Independiente):** Puede ser consultado en cualquier momento a partir de las partidas registradas.
- **N (Negociable):** El formato del componente (barra, porcentaje, desglose diario).
- **V (Valiosa):** Proporciona retroalimentación instantánea del progreso semanal.
- **E (Estimable):** Requiere cálculo de corte semanal lunes a domingo.
- **S (Small):** Lectura y cálculo puro de la semana en curso.
- **T (Testeable):** Validable con conjuntos conocidos de partidas.

#### Criterios de Aceptación:

- **CA-03.1 (Múltiples partidas en un mismo día - RN-02):**  
  **DADO** que el usuario registró dos partidas el mismo martes (una de 45 min y otra de 75 min),  
  **CUANDO** consulta el progreso de la semana,  
  **ENTONCES** el sistema contabiliza 1 único día jugado (martes) y suma la totalidad de las 2.0 horas al avance semanal.
- **CA-03.2 (Partida que cruza la medianoche - RN-03):**  
  **DADO** una partida iniciada el viernes a las 23:15 y finalizada el sábado a las 00:45 (hora oficial Ecuador UTC-5),  
  **CUANDO** se calcula la distribución semanal,  
  **ENTONCES** la totalidad de la duración y el día jugado se asignan al viernes.
- **CA-03.3 (Meta superada con tope visual - RN-05):**  
  **DADO** una meta semanal de 4 horas en la cual el usuario ha acumulado 6 horas reales,  
  **CUANDO** se presenta el resumen de progreso semanal,  
  **ENTONCES** el indicador visual de porcentaje muestra exactamente 100 %, pero el texto numérico detalla "6.0 h de 4.0 h".
- **CA-03.4 (Semana en curso incompleta - CN-02):**  
  **DADO** que nos encontramos en día miércoles y el usuario aún no alcanza la meta semanal,  
  **CUANDO** observa el estado de la semana,  
  **ENTONCES** la semana se muestra en progreso y no se marca como incumplida ni fallida.
- **CA-03.5 (Partidas con fecha futura prohibidas - CN-01):**  
  **DADO** el formulario de registro de partidas,  
  **CUANDO** el usuario intenta ingresar una fecha u hora posterior al momento actual (UTC-5),  
  **ENTONCES** el sistema impide el guardado con un mensaje de validación claro.

---

### H-04: Ver racha actual y mejor racha

**Como** jugador que valora la constancia,  
**quiero** conocer cuántos días consecutivos llevo jugando (racha actual) y cuál ha sido mi récord histórico (mejor racha),  
**para** motivarme a no interrumpir mi hábito diario de juego.

- **I (Independiente):** Algoritmo autónomo de análisis de fechas de juego.
- **N (Negociable):** Visualización como badge numérico o contador destacado.
- **V (Valiosa):** Factor central de gamificación y retención del hábito.
- **E (Estimable):** Función pura de cálculo sobre fechas únicas.
- **S (Small):** Consulta y presentación de dos valores numéricos.
- **T (Testeable):** Altamente testeable con diversas secuencias temporales.

#### Criterios de Aceptación:

- **CA-04.1 (Racha vigente habiendo jugado hoy - RN-01):**  
  **DADO** que el usuario jugó ayer y acaba de registrar una partida hoy,  
  **CUANDO** consulta su racha,  
  **ENTONCES** la racha actual se incrementa en 1 día reflejando la actividad de hoy.
- **CA-04.2 (Racha viva sin haber jugado hoy aún - RN-01):**  
  **DADO** que el usuario jugó ayer pero hoy aún no ha registrado ninguna partida,  
  **CUANDO** visualiza su racha actual,  
  **ENTONCES** la racha sigue considerándose viva, manteniendo el conteo acumulado hasta el día de ayer.
- **CA-04.3 (Racha rota por inactividad - RN-01):**  
  **DADO** que el usuario no registró ninguna partida ni hoy ni en el día de ayer,  
  **CUANDO** consulta el sistema,  
  **ENTONCES** la racha actual se muestra en 0 días.
- **CA-04.4 (Cálculo de mejor racha histórica):**  
  **DADO** un historial con una secuencia pasada de 5 días seguidos y una secuencia actual de 2 días,  
  **CUANDO** se visualiza el panel de rachas,  
  **ENTONCES** el sistema muestra "Racha actual: 2 días" y "Mejor racha: 5 días".
- **CA-04.5 (Recálculo por edición de fechas de partidas - CN-03):**  
  **DADO** un conjunto de partidas registradas,  
  **CUANDO** el usuario edita o traslada una partida a otra fecha,  
  **ENTONCES** la racha actual y la mejor racha se recalculan automáticamente con el nuevo calendario.

---

### H-05: Ver hitos alcanzados

**Como** jugador enfocado en metas a largo plazo,  
**quiero** visualizar qué hitos de tiempo acumulado he desbloqueado y cuáles tengo pendientes,  
**para** reconocer mi progreso global en el videojuego.

- **I (Independiente):** Depende únicamente de las horas totales y los hitos configurados.
- **N (Negociable):** Estilo visual de lista de hitos (medallas, checkmarks).
- **V (Valiosa):** Refuerza el compromiso de largo plazo en juegos extensos.
- **E (Estimable):** Comparación directa de horas acumuladas vs. umbral de cada hito.
- **S (Small):** Componente de visualización con estados booleanos derivados.
- **T (Testeable):** Casos de prueba de adición y substracción de horas.

#### Criterios de Aceptación:

- **CA-05.1 (Desbloqueo de hito por horas acumuladas - RN-06):**  
  **DADO** un hito configurado para las 15 horas de juego acumuladas,  
  **CUANDO** el total de horas jugadas en el videojuego alcanza o supera las 15.0 horas,  
  **ENTONCES** el hito se muestra con estado visual alcanzado ("DESBLOQUEADO").
- **CA-05.2 (Revocación dinámica de hito por eliminación de partidas - RN-06):**  
  **DADO** un videojuego con 16 horas acumuladas y un hito de 15 horas previamente alcanzado,  
  **CUANDO** el usuario elimina una partida de 2 horas (reduciendo el total acumulado a 14 horas),  
  **ENTONCES** el hito pierde dinámicamente su condición de alcanzado y pasa a mostrarse como "PENDIENTE".

---

### H-06: No dejar metas huérfanas al eliminar un juego

**Como** administrador de mi propia biblioteca,  
**quiero** que al borrar un videojuego se limpien automáticamente sus metas e hitos relacionados,  
**para** preservar la consistencia de mi base de datos sin datos residuales.

- **I (Independiente):** Puede ejecutarse al dispararse la acción de eliminación.
- **N (Negociable):** Requiere confirmación explícita previa por parte del usuario.
- **V (Valiosa):** Integridad referencial y limpieza de datos.
- **E (Estimable):** Extensión de la lógica de eliminación existente.
- **S (Small):** Encadenamiento de borrado en cascada.
- **T (Testeable):** Verificación directa de ausencia de registros tras el borrado.

#### Criterios de Aceptación:

- **CA-06.1 (Eliminación en cascada total - RN-08):**  
  **DADO** un videojuego que posee partidas registradas, una meta semanal activa e hitos configurados,  
  **CUANDO** el usuario confirma la eliminación de dicho videojuego,  
  **ENTONCES** el sistema elimina el juego, todas sus partidas, su meta semanal y todos sus hitos asociados.
- **CA-06.2 (Ausencia de registros huérfanos):**  
  **DADO** que un juego ha sido eliminado,  
  **CUANDO** se consultan las metas o resúmenes de la aplicación,  
  **ENTONCES** no existe ningún registro huérfano ni referencia rota en el sistema.

---

## 2. Tabla de Tickets de Implementación (T-01 a T-12)

| ID       | Qué hace                                                                                                                                                                                                                                                         | Definition of Done (DoD)                                                                                                                                                                                                                                                                                                                      | Dependencias |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **T-01** | **Modelo Meta e Hitos**<br>Diseño y creación del esquema y modelo de persistencia para `Meta` (videojuego ref, horasSemanales, activa, fechaInicio, timestamps) y subdocumento `Hito` (nombre, horasObjetivo).                                                   | • Esquema con validaciones numéricas (`horasSemanales > 0`, `horasObjetivo > 0`).<br>• Índice único compuesto `{ videojuego: 1, activa: 1 }` cuando `activa === true` para garantizar máximo una meta activa por título.<br>• Tipos e interfaces de TypeScript declarados en capa compartida/dominio.                                         | Ninguna      |
| **T-02** | **Funciones de dominio puras + Tests**<br>Implementación en `src/dominio/` de funciones puras para cálculo de semana (lunes a domingo, UTC-5), estado de racha actual y mejor racha (RN-01, RN-02, RN-03), y evaluación dinámica de hitos (RN-06).               | • Cobertura de tests unitarios exhaustivos con Jest/Vitest.<br>• Casos de prueba para cruce de medianoche, partidas múltiples en un mismo día, racha viva de ayer y racha rota.<br>• Cero efectos secundarios ni dependencias de frameworks externos en `src/dominio/`.                                                                       | Ninguna      |
| **T-03** | **Endpoint y servicio de progreso semanal y rachas**<br>Lógica en servicio y controlador para calcular y devolver el estado actual de la meta, progreso de la semana (horas, días jugados, porcentaje tope 100 %) y rachas de un videojuego.                     | • Endpoint `GET /api/videojuegos/:id/progreso-semanal` disponible y tipado.<br>• Aplica la meta activa a toda la semana corriente (RN-04) y limita visualmente al 100 % (RN-05).<br>• Manejo de caso cuando el juego no tiene meta configurada (valores nulos o neutros claros).                                                              | T-01, T-02   |
| **T-04** | **CRUD de Metas y control de concurrencia / 409**<br>Endpoints y servicios para crear (`POST /api/videojuegos/:id/metas`), editar (`PUT /api/metas/:id`) y desactivar metas (`PATCH /api/metas/:id/desactivar`). Control de juego completado/abandonado (RN-07). | • Validación de estado del videojuego antes de crear/activar meta (RN-07).<br>• Respuesta con código HTTP 409 si ya existe una meta activa para el videojuego.<br>• Respuestas 201 en creación, 200 en actualización y validaciones de datos requeridos.                                                                                      | T-01, T-06   |
| **T-05** | **Cascada de eliminación de metas e hitos**<br>Ampliación del servicio de eliminación de videojuegos (`eliminarVideojuego`) para suprimir en cascada las metas e hitos vinculados al juego.                                                                      | • Al eliminar un juego, se ejecuta `MetaModel.deleteMany({ videojuego: id })`.<br>• Test de integración que confirma la inexistencia de metas residuales tras la eliminación.<br>• Se mantiene la cascada previa de partidas sin regresiones.                                                                                                 | T-01         |
| **T-06** | **Middleware errorHandler integral (400, 404, 409, 500)**<br>Actualización centralizada de `errorHandler.ts` para capturar errores de unicidad/duplicidad de MongoDB (`code 11000` → 409 Conflict), validaciones de esquema (400) y formatos de ID (400).        | • Pruebas automatizadas del middleware verificando mapeo a 400, 404, 409 y 500.<br>• Mapeo transparente de errores de conflicto con mensaje legible.<br>• Preservación del identificador de trazabilidad `requestId` en todas las respuestas.                                                                                                 | Ninguna      |
| **T-07** | **Cliente de API frontend (`metasApi.ts`)**<br>Creación del módulo de servicios cliente para interactuar con los endpoints de metas y progreso semanal.                                                                                                          | • Métodos `getProgresoSemanal`, `createMeta`, `updateMeta`, `desactivarMeta` debidamente tipados.<br>• Integración con el `apiClient` base respetando manejo de errores y códigos de respuesta.                                                                                                                                               | T-03, T-04   |
| **T-08** | **Componente visual de progreso semanal y rachas en UI**<br>Construcción del bloque de interfaz en la vista de detalle del videojuego siguiendo tokens y lineamientos de `DESIGN.md`.                                                                            | • Visualización de horas acumuladas vs. meta, porcentaje con tope al 100 % (barra `.metric-track`).<br>• Indicadores de racha actual y mejor racha con tipografía y badges oficiales.<br>• Lista de hitos con indicador visual de alcanzado / pendiente.<br>• Accesibilidad WCAG (foco visible, contraste y atributos ARIA correspondientes). | T-07         |
| **T-09** | **Formulario de configuración y edición de Meta e Hitos**<br>Pantalla o modal para registrar/editar horas semanales y agregar/quitar hitos numéricos únicos.                                                                                                     | • Inputs adaptados a estilos del sistema (fondo `#131720`, validación numérica `min="0.5"`).<br>• Validación en cliente que impida hitos con valores duplicados (CN-04).<br>• Bloqueo y mensaje informativo si el juego está completado o abandonado.                                                                                         | T-07, T-08   |
| **T-10** | **Sincronización y refresco reactivo tras cambios en partidas**<br>Garantizar que al crear, editar o eliminar una partida, los componentes de meta semanal, racha e hitos refresquen sus métricas inmediatamente.                                                | • Tras registrar o eliminar una partida desde el detalle o historial, se reejecuta la consulta de progreso.<br>• Si la eliminación provoca caída de horas, los hitos correspondientes pasan a pendientes de inmediato.<br>• Sin desfases de estado en la interfaz del usuario.                                                                | T-08, T-09   |
| **T-11** | **Pago de deuda técnica: Validación anticipada de ObjectId (P-02)**<br>Creación de un middleware o función de guardia `validateObjectId` que verifique `Types.ObjectId.isValid(id)` antes de transferir el control a los servicios de Mongoose.                  | • Los parámetros `:id` malformados (ej. `"123"`, `"abc"`) devuelven 400 antes de ejecutar queries a la base de datos.<br>• Mensaje de error consistente y uniforme en todos los controladores de rutas con parámetros.<br>• Tests unitarios de controladores validando el rechazo temprano.                                                   | Ninguna      |
| **T-12** | **Pago de deuda técnica: Mapeo y pruebas de 409 Conflict (P-03)**<br>Formalización de la clase de error `ConflictError` y su captura en `errorHandler.ts`, asociándolo a índices únicos de Mongoose (metas y juegos).                                            | • Clase `ConflictError` disponible para lanzar conflictos de lógica de negocio.<br>• Intercepción de `MongoServerError` con código `11000` emitiendo status 409.<br>• Suite de pruebas dedicada que valida que colisiones de unicidad nunca deriven en error 500.                                                                             | T-06         |

---

## 3. Deuda Técnica Diferida del Diagnóstico

Durante la auditoría del proyecto base se identificaron oportunidades de mejora en el manejo de solicitudes y respuestas de error. A continuación se detalla su resolución y planificación dentro de la presente iteración:

### P-02: Ausencia de validación preventiva de ObjectId

- **Diagnóstico original:** Los controladores tomaban los parámetros de ruta mediante `routeParam(req, "id")` y los pasaban directamente a las consultas de Mongoose (`findById`). Si el identificador no cumplía el formato BSON (24 caracteres hexadecimales), el sistema dependía de que Mongoose arrojara un `CastError` para que el `errorHandler` devolviera 400. Aunque el código de estado final era 400, la solicitud atravesaba innecesariamente la capa de controladores y servicios hasta la base de datos.
- **Resolución planificada (Ticket T-11):** Se implementa una guarda de validación anticipada en los controladores / middlewares de ruta (`isValidObjectId`). Si el parámetro no es válido, se emite inmediatamente una respuesta 400 de solicitud incorrecta, aliviando la carga en la base de datos y estandarizando los mensajes de error de parámetros de ruta.
- **Justificación:** Previene ejecuciones y conversiones innecesarias en Mongoose, acelera el tiempo de respuesta para peticiones defectuosas y otorga robustez a toda la API frente a entradas no válidas.

### P-03: Inexistencia de manejo explícito de 409 Conflict

- **Diagnóstico original:** El middleware `errorHandler.ts` original no contemplaba la captura de excepciones por duplicidad de claves (`MongoServerError` con código `11000`), ni existía una clase de error `ConflictError`. En la Épica 1 no existían índices de unicidad activos, por lo que no se producían fallos evidentes; sin embargo, cualquier colisión futura habría resultado en un error genérico 500 (Internal Server Error) en lugar del estándar REST 409 (Conflict).
- **Resolución planificada (Ticket T-06 y T-12):** Con la incorporación del modelo de `Meta` en la Épica 2 —donde existe la restricción de negocio de máximo una meta activa por videojuego—, se hace imprescindible la captura formal del error 11000 y la disponibilidad de `ConflictError`. El `errorHandler` identificará este código y emitirá HTTP 409 acompañado de un mensaje claro para el cliente.
- **Justificación:** Garantiza la adherencia a las convenciones REST, otorga feedback adecuado al frontend ante dobles envíos o condiciones de carrera al crear metas y salvaguarda la integridad de los datos evitando caídas no controladas a nivel de servidor.
