# Especificación Técnica: Frontend — Progreso Semanal, Metas y Rachas (`frontend-progreso-meta`)

## 1. Contexto y Tickets que Cubre

Esta especificación establece el diseño técnico, patrones de interfaz, contratos de cliente API y ciclo de actualización en el frontend para implementar la visualización de metas semanales, seguimiento de rachas diarias y gestión de hitos, cubriendo los siguientes tickets del backlog de E2:

- **T-07: Cliente de API Frontend (`metasApi.ts`):** Módulo de servicios desacoplado para interactuar con los endpoints de metas y progreso semanal.
- **T-08: Sección Visual de Progreso Semanal y Rachas en UI:** Componentes para representar el avance semanal (horas, días jugados, barra con tope al 100 %), contadores de racha (actual y récord histórico) y lista dinámica de hitos dentro de la vista de detalle del videojuego.
- **T-09: Formulario Modal de Configuración de Meta e Hitos:** Interfaz modal accesible para definir o editar las horas semanales y gestionar hitos numéricos únicos, con opción de desactivación.
- **T-10: Refresco Reactivo tras Cambios en Partidas:** Sincronización inmediata del estado de progreso, rachas e hitos al crear o eliminar sesiones de juego desde el detalle o historial.

---

## 2. Reglas DEBE / NO DEBE

### DEBE (Requisitos obligatorios)

- **DEBE** respetar estrictamente los tokens de color, tipografía y espaciado definidos en `DESIGN.md` (`--bg`, `--panel`, `--line`, `--muted`, `--accent`, `--accent-ink`, `--display`, `--mono`).
- **DEBE** reutilizar la clase `.metric-track` con la variable CSS en línea `--progress: X%` para la barra visual de progreso semanal, respetando el degradado de acento y sombras glow oficiales.
- **DEBE** asegurar que si el progreso supera el objetivo, el valor de `--progress` se tope visualmente en `100%`, mostrando en texto el total real sin truncar (ej. "5.5 h de 4.0 h").
- **DEBE** delegar todo el cálculo matemático de horas, porcentajes, rachas y estado de hitos al backend; el frontend únicamente consume y renderiza el payload de la API.
- **DEBE** implementar estados visuales explícitos y consistentes:
  - **Carga:** Skeleton loader animado (`.skeleton-block`) para las tarjetas de progreso, racha e hitos.
  - **Error:** Bloque de notificación accesible (`.feedback-error`) con mensaje claro y botón de reintento.
  - **Vacío:** Estado amigable (`.empty-state`) cuando el videojuego activo no tenga una meta configurada, invitando al usuario a establecer una con un botón de acción primaria.
- **DEBE** proveer accesibilidad completa según WCAG AA:
  - Foco visible con contorno `--accent` de 2 px.
  - Modal accesible con `role="dialog"`, `aria-modal="true"`, captura de foco, cierre con tecla `Escape` y click en backdrop.
  - Atributos semánticos `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"` y `aria-valuemax="100"` en la barra de progreso.
  - Etiquetas descriptivas `aria-label` en botones de iconos o acciones secundarias.
- **DEBE** deshabilitar o bloquear la opción de crear/editar metas si el videojuego se encuentra en estado "completado" o "abandonado", mostrando un mensaje explicativo.
- **DEBE** disparar una recarga en paralelo del detalle, resumen clásico y progreso semanal (`Promise.all`) tras crear o eliminar una partida desde la página de detalle.

### NO DEBE (Restricciones e invariantes)

- **NO DEBE** instalar ni utilizar ninguna librería externa de componentes de UI o estilos (sin Bootstrap, Material UI, Chakra UI, Radix, Tailwind ni CSS Modules). Todo componente y estilo debe basarse en el CSS propio de `frontend/src/styles.css`.
- **NO DEBE** instalar librerías de gráficos o visualizaciones de datos (sin Chart.js, Recharts, D3, etc.). Las métricas se representan mediante stat-cards y barras de progreso nativas.
- **NO DEBE** recalcular ni alterar localmente la racha, la pertenencia a la semana ni el estado alcanzado de los hitos en el cliente.
- **NO DEBE** permitir en el formulario de hitos la inserción de dos umbrales con el mismo valor numérico de horas.
- **NO DEBE** realizar llamadas HTTP directas con `fetch` desde los componentes React; todo consumo debe canalizarse a través de `services/metasApi.ts`.

---

## 3. Tabla Criterio → Verificación

| Criterio de Aceptación | Escenario Visual / Funcional                    | Tipo de Verificación | Método y Detalle de Verificación en Navegador                                                                                                                                 |
| ---------------------- | ----------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CA-01.1**            | Creación de meta con hitos desde el modal       | Visual / Manual      | Abrir modal en juego sin meta, ingresar horas (ej. 5h) y dos hitos (ej. 10h y 20h), guardar; verificar que aparece el bloque de meta activa y la lista de hitos pendientes.   |
| **CA-01.2**            | Conflicto por meta activa existente (409)       | Visual / Manual      | Si se intentara disparar una doble creación concurrente, comprobar que la UI captura el mensaje de conflicto y lo muestra en el banner de error sin romper la vista.          |
| **CA-01.3**            | Bloqueo de meta en juego completado/abandonado  | Visual / Manual      | En un juego con estado "completado" o "abandonado", verificar que el botón de crear meta está deshabilitado o muestra aviso de restricción.                                   |
| **CA-01.4**            | Validación de hitos con objetivos duplicados    | Visual / Manual      | En el modal de meta, intentar añadir dos hitos con el mismo valor de horas (ej. ambos 10h); verificar mensaje de error en formulario y botón deshabilitado.                   |
| **CA-02.1**            | Edición de meta a mitad de semana               | Visual / Manual      | Abrir modal de edición en juego con progreso acumulado, reducir o aumentar la meta; verificar que la barra y el porcentaje se recalculan inmediatamente contra la nueva meta. |
| **CA-02.2**            | Desactivación voluntaria de meta                | Visual / Manual      | En el modal de edición, seleccionar "Desactivar meta"; confirmar que el bloque de progreso semanal vuelve al estado vacío ("Sin meta activa").                                |
| **CA-03.1**            | Suma total de horas y días únicos en la semana  | Visual / Manual      | Registrar dos partidas en el mismo día; verificar en la stat-card de la semana que se computa 1 solo día jugado y la suma exacta de horas de ambas.                           |
| **CA-03.3**            | Meta superada con tope visual al 100 %          | Visual / Manual      | Con meta de 4h, registrar partidas que sumen 6h; verificar que la barra llega al 100 % sin desbordarse y el texto indica "6.0 h de 4.0 h".                                    |
| **CA-03.4**            | Semana incompleta en progreso                   | Visual / Manual      | Verificar que a mitad de semana con meta no alcanzada el bloque se muestra en estado "EN CURSO" y no se indica fallo o incumplimiento.                                        |
| **CA-04.1**            | Racha incrementada al registrar partida hoy     | Visual / Manual      | Registrar una partida con fecha de hoy; verificar que el badge de racha actual aumenta en 1 día.                                                                              |
| **CA-04.2**            | Racha sigue viva si ayer hubo juego pero hoy no | Visual / Manual      | En un juego con partida registrada ayer y ninguna hoy; verificar que el contador de racha muestra el total acumulado y no cero.                                               |
| **CA-04.3**            | Racha en 0 días por inactividad                 | Visual / Manual      | En un juego sin partidas en los últimos dos días; verificar que el badge de racha actual indica "0 días".                                                                     |
| **CA-04.4**            | Visualización de mejor racha histórica          | Visual / Manual      | Comprobar que junto a la racha actual se muestra la stat-card "MEJOR RACHA" con el récord histórico.                                                                          |
| **CA-05.1**            | Hito alcanzado ("DESBLOQUEADO")                 | Visual / Manual      | Cuando las horas acumuladas superan el objetivo de un hito; verificar que la fila del hito muestra el check verde y la etiqueta "DESBLOQUEADO".                               |
| **CA-05.2**            | Revocación dinámica de hito al eliminar partida | Visual / Manual      | Eliminar una partida que haga caer las horas acumuladas por debajo del hito; verificar que el hito cambia inmediatamente a "PENDIENTE".                                       |
| **CA-06.1**            | Eliminación de juego limpia vista sin errores   | Visual / Manual      | Eliminar videojuego con meta e hitos desde el detalle; confirmar que el diálogo de confirmación procede y redirige a `/` sin errores de red en consola.                       |
| **T-10**               | Refresco reactivo al añadir sesión              | Visual / Manual      | Registrar nueva sesión desde `/partidas/nueva?videojuego=:id`; al volver al detalle, verificar que horas, racha y barra se actualizan sin requerir F5 manual.                 |

---

## 4. Tabla Ticket → Archivos

| Ticket   | Responsabilidad Técnica                                                | Archivos Creados o Modificados                                                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T-07** | Tipos de datos de frontend y cliente API para metas y progreso         | • `frontend/src/types.ts` (Modificado: interfaces `Meta`, `Hito`, `ProgresoSemanal`, `MetaInput`)<br>• `frontend/src/services/metasApi.ts` (Nuevo: funciones `getProgresoSemanal`, `createMeta`, `updateMeta`, `desactivarMeta`)             |
| **T-08** | Componente de UI para visualización de progreso semanal, racha e hitos | • `frontend/src/components/ProgresoSemanalCard.tsx` (Nuevo: bloque de progreso semanal, barra, badges de racha e hitos)<br>• `frontend/src/styles.css` (Modificado: clases para badges de racha, lista de hitos de meta y estados asociados) |
| **T-09** | Formulario modal para configuración, edición y desactivación de meta   | • `frontend/src/components/MetaModal.tsx` (Nuevo: diálogo accesible con validación de hitos únicos y controles numéricos)<br>• `frontend/src/styles.css` (Modificado: estilos del modal de configuración de metas)                           |
| **T-10** | Integración reactiva en página de detalle del videojuego               | • `frontend/src/pages/GameDetailPage.tsx` (Modificado: carga coordinada de progreso semanal, integración del modal de meta y recarga tras mutaciones de partidas o metas)                                                                    |
