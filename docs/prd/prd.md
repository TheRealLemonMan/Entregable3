# PRD — Entregable 2 (E2): Metas, Rachas e Hitos de Juego

## 1. Problema

Los jugadores dedicados a menudo pierden la constancia o el sentido de propósito al distribuir su tiempo entre múltiples títulos o enfrentarse a juegos extensos. Sin un marco de objetivos claros a corto y mediano plazo:

- No logran sostener hábitos de juego saludables y continuos.
- Desconocen si están progresando al ritmo deseado semana tras semana.
- Pierden motivación al no visualizar pequeños triunfos periódicos ni recompensas por su disciplina diaria.

La versión inicial del sistema permite catalogar videojuegos y registrar sesiones aisladas, pero carece de mecanismos motivacionales para planificar metas semanales, incentivar la regularidad diaria (rachas) y celebrar marcas acumulativas (hitos).

---

## 2. Usuarios

- **Gamer Disciplinado / Completista:** Busca terminar su catálogo de juegos pendientes (_backlog_), necesita definir cuántas horas semanales dedicará a cada título y valora ver reflejada su constancia día a día.
- **Jugador Casual / Ocasional:** Dispone de tiempo limitado, desea mantener un ritmo regular sin saturarse y requiere retroalimentación clara sobre si cumplió su compromiso semanal.

---

## 3. Objetivo del Producto

Proporcionar un sistema integral de metas semanales, cálculo de rachas diarias y reconocimiento de hitos acumulados por videojuego, que fomente el progreso sostenido y entregue visibilidad clara sobre el cumplimiento de los hábitos de juego de cada usuario.

---

## 4. Métrica de Éxito

- **Hábito Semanal Sostenido:** El usuario alcanza o supera su meta semanal de horas en al menos **3 de cada 4 semanas consecutivas** en sus videojuegos activos.

---

## 5. Alcance

- Definición, ajuste y desactivación de metas semanales de horas de juego por título.
- Seguimiento visual del progreso semanal en curso (tiempo acumulado vs. meta definida).
- Medición de la racha de días consecutivos de juego a nivel general y por título.
- Configuración y desbloqueo dinámico de hitos por volumen de horas dedicadas.
- Reglas claras de transición ante cambios de estado de un videojuego (jugando, completado, abandonado, etc.).
- Comportamiento consistente ante eliminación de registros o partidas en cascada.

---

## 6. No-Alcance

- Elementos sociales, clasificaciones públicas (_leaderboards_) o comparativas entre distintos usuarios.
- Recompensas económicas, canjes externos o integración con APIs de terceros (Steam, PlayStation Network, Xbox Live).
- Notificaciones push o recordatorios por correo electrónico.
- Gráficos complejos o analítica predictiva avanzada.

---

## 7. Reglas de Negocio

### RN-01: Estado de la Racha y Evaluación del Día Actual

- La racha de días jugados se mantiene activa si el usuario registró al menos una partida en el día de ayer, incluso si el día de hoy aún no ha registrado ninguna.
- La racha se incrementa cuando el usuario registra una partida en el día de hoy.
- La racha se rompe (vuelve a cero) únicamente si no existen partidas registradas ni en el día de hoy ni en el día de ayer (es decir, transcurrió un día completo sin actividad).

### RN-02: Múltiples Partidas en un Mismo Día

- Registrar más de una partida en una misma fecha calendario cuenta como **1 único día** a efectos del conteo de la racha.
- La duración y horas de todas las partidas realizadas en ese día se acumulan en su totalidad para el avance de la meta semanal y los hitos.

### RN-03: Partidas que Cruzan la Medianoche y Zona Horaria

- Toda partida pertenece y se computa en el día calendario en el que **inició**, tomando como referencia exclusiva la hora legal de **Ecuador (UTC-5)**.
- Una partida iniciada a las 23:30 y finalizada a las 01:00 computa su tiempo y su día en la fecha de inicio (23:30), sin fraccionarse entre dos jornadas.

### RN-04: Cambio de Meta a Mitad de Semana

- Si el usuario modifica la meta de horas a mitad de una semana en curso, dicha nueva meta rige retroactivamente para evaluar **toda la semana actual completa** (de lunes a domingo).
- Las horas acumuladas previamente en la semana no se alteran, pero su porcentaje de cumplimiento se evalúa contra el nuevo valor configurado.

### RN-05: Representación Visual de Meta Superada

- Cuando el tiempo jugado en la semana excede la meta configurada, el indicador porcentual visual en pantalla se fija en un máximo de **100 %**.
- El total de horas reales acumuladas continúa mostrándose sin recortes (por ejemplo: _"7.5 h de 5 h planificadas"_).

### RN-06: Evaluación Dinámica de Hitos

- El estado de cumplimiento de un hito se calcula de forma dinámica en función del tiempo acumulado real.
- Si por edición o eliminación de partidas el total de horas acumuladas desciende por debajo del umbral exigido por el hito, este pierde inmediatamente su estado de "alcanzado" y vuelve a estar pendiente.

### RN-07: Desactivación por Estado del Videojuego

- Un videojuego en estado **Completado** o **Abandonado** no puede tener una meta semanal activa.
- Si un juego pasa a cualquiera de estos dos estados, cualquier meta activa asociada se desactiva de forma automática.
- Para volver a fijar una meta, el videojuego debe retornar previamente a un estado activo (por ejemplo, _Jugando_).

### RN-08: Eliminación en Cascada de Metas e Hitos

- Al eliminar un videojuego del catálogo, se eliminan definitivamente todas sus metas semanales (activas o históricas) y todos sus hitos configurados, evitando registros huérfanos.

---

## 8. Casos Borde y Decisiones Adicionales de Negocio

### CN-01: Partidas con Fecha Futura

- No está permitido registrar ni programar partidas con fecha u hora posterior al momento actual (según el huso horario oficial UTC-5). El sistema rechazará cualquier intento de registrar eventos en el futuro.

### CN-02: Semana en Curso Incompleta

- Una semana en curso no se marca como "incumplida" ni se penaliza prematuramente mientras los días de la semana sigan transcurriendo. El estado final de cumplimiento semanal se consolida únicamente al término del domingo (23:59:59 UTC-5).

### CN-03: Edición o Reubicación de Partidas a Otra Fecha

- Si una partida existente es modificada para cambiar su fecha o duración, el sistema recalcula en tiempo real las rachas de los días involucrados, el progreso de las semanas afectadas y la validez de los hitos.

### CN-04: Hitos con el Mismo Umbral u Objetivo

- No se permite definir dos o más hitos con el mismo valor cuantitativo de objetivo para un mismo videojuego. Cada hito debe representar una marca única y progresiva de tiempo dedicado.

### CN-05: Registro Histórico de Metas Desactivadas

- Al sustituir, cumplir o desactivar una meta, el sistema preserva el registro histórico de las semanas previas evaluadas bajo esa meta anterior para fines de consulta del rendimiento histórico del usuario.

---

## 9. Supuestos y Puntos Abiertos

### Supuestos

- La semana de medición inicia los días lunes a las 00:00:00 y concluye los domingos a las 23:59:59 según el huso horario oficial de Ecuador (UTC-5).
- El usuario opera principalmente con un único huso horario y sus registros representan sesiones de juego reales y manuales.
- Las metas semanales se expresan en unidades de tiempo (horas) con soporte para fracciones decimales (por ejemplo, 2.5 horas).

### Puntos Abiertos

- Definir si en futuras fases se admitirá pausar temporalmente una racha (modo vacaciones o descanso planificado) sin penalización.
- Evaluar si las semanas históricas sin meta establecida deben computarse o excluirse de la métrica general de éxito.
