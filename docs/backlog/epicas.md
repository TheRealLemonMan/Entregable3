# Épicas del Producto — Checkpoint

Este documento organiza las capacidades funcionales del sistema en dos grandes épicas: la funcionalidad base existente y las nuevas capacidades de motivación y constancia correspondientes al Entregable 2 (E2).

---

## Épica 1: Gestión de Biblioteca, Sesiones y Progreso Base (Existente)

### Objetivo

Permitir a los usuarios organizar su colección de videojuegos, registrar sesiones individuales de juego y hacer seguimiento elemental a su progreso mediante logros y métricas acumuladas.

### Alcance

- **Catálogo de Videojuegos:**
  - Registro, consulta, edición y eliminación de videojuegos en la biblioteca.
  - Clasificación por plataforma, género y estado de juego (Jugando, Pausado, Completado, Abandonado).
  - Asociación de portada visual o asignación de arte gráfico de respaldo.
- **Logros Embebidos:**
  - Creación de objetivos específicos para cada videojuego.
  - Marcado manual de logros obtenidos o pendientes directamente desde la vista del juego.
- **Diario de Partidas:**
  - Registro de sesiones de juego con fecha, duración en minutos, porcentaje de avance alcanzado y notas libres.
  - Listado cronológico global y filtrado por videojuego.
  - Eliminación individual de partidas registradas.
- **Resumen Básico:**
  - Cálculo de horas totales acumuladas, total de partidas, última fecha jugada y último porcentaje de avance reportado.
- **Integridad de Datos Base:**
  - Eliminación de partidas asociadas en cascada cuando se elimina el videojuego principal.

---

## Épica 2 (E2): Metas Semanales, Rachas e Hitos de Dedicación

### Objetivo

Incentivar la regularidad, la planificación consciente del tiempo y el sentido de logro continuo de los usuarios a través de metas semanales configurables, seguimiento de días consecutivos de juego (rachas) e hitos acumulativos por videojuego.

### Alcance

- **Gestión de Metas Semanales:**
  - Establecimiento, actualización y desactivación de una meta semanal de horas dedicada a un videojuego.
  - Visualización del progreso semanal en curso (tiempo acumulado frente al objetivo fijado).
  - Manejo de metas superadas (tope visual al 100 % manteniendo las horas reales completas).
  - Aplicación de la meta activa a toda la semana corriente ante modificaciones a mitad de período.
- **Sistema de Rachas Diarias:**
  - Conteo de días consecutivos de actividad de juego basados en el huso horario oficial (UTC-5).
  - Reglas de preservación de la racha (vigente si ayer hubo actividad; rota únicamente ante la ausencia de partidas hoy y ayer).
  - Consolidación de múltiples sesiones en una misma jornada como un solo día de racha.
  - Atribución de sesiones nocturnas al día calendario en que iniciaron.
- **Hitos Acumulativos Dinámicos:**
  - Definición de marcas o hitos de dedicación basados en metas de horas acumuladas para un juego.
  - Verificación dinámica del estado de los hitos (alcanzado o pendiente) según el tiempo acumulado real.
  - Retroceso automático del estado del hito en caso de eliminaciones o correcciones de partidas.
- **Coherencia con el Ciclo de Vida del Juego:**
  - Desactivación automática de metas semanales cuando un juego pasa a estado _Completado_ o _Abandonado_.
  - Restricción de activación de metas a títulos en estados activos.
  - Eliminación en cascada de metas e hitos vinculados al remover un videojuego de la biblioteca.
- **Validación de Fechas y Límites de Negocio:**
  - Bloqueo de registro de partidas con fechas u horas futuras.
  - Recálculo retroactivo transparente de rachas y metas ante ediciones de fechas de sesiones pasadas.
