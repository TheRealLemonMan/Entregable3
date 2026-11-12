# DESIGN.md — Identidad Visual de Checkpoint

> Documento de referencia para diseño y desarrollo de la interfaz.
> **Nunca duplicar aquí código fuente.** Si un token cambia, se actualiza en `styles.css` primero y luego aquí.

---

## 1. Colores — Tokens

Todos los colores del proyecto se definen en `:root` dentro de `frontend/src/styles.css`.
**No usar ningún hex que no esté listado aquí** (ver sección "No hacemos").

### Tokens CSS

| Token            | Valor hex | Uso                                                                                                                                     |
| ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--bg`           | `#10131b` | Fondo base de toda la app                                                                                                               |
| `--panel`        | `#171b26` | Tarjetas, formularios, listas                                                                                                           |
| `--panel-raised` | `#1d2230` | Paneles elevados sobre `--panel` (p. ej. preview de portada)                                                                            |
| `--line`         | `#2a3040` | Bordes, divisores, separadores de sección                                                                                               |
| `--muted`        | `#858b9b` | Textos secundarios, pies de campo, etiquetas OPCIONAL                                                                                   |
| `--accent`       | `#b8f36b` | Acento principal: verde lima. Botón primario, punto activo, foco, barras de progreso, `title-dot`, `eyebrow`, logros obtenidos, spinner |
| `--accent-ink`   | `#17200e` | Texto que va **sobre** `--accent` (botón primario, brand-mark)                                                                          |

### Colores de apoyo (sin token, uso puntual y controlado)

| Valor                 | Dónde aparece                                        |
| --------------------- | ---------------------------------------------------- |
| `#9dc9ff`             | Estado `completado` en status pill                   |
| `#f2a1a8`             | Texto "Eliminar" en acciones de peligro              |
| `#873c47` / `#a34753` | Fondo botón `button-danger` / hover                  |
| `#fff1f1`             | Texto sobre `button-danger`                          |
| `#381e26` / `#ffc4c8` | Fondo / texto del bloque de error (`feedback-error`) |
| `#687080`             | Texto del footer                                     |

### Gradiente de fondo del `body`

```css
background: radial-gradient(ellipse at 18% 0%, #1b2030 0, var(--bg) 40rem);
```

Gradiente radial sutil en la esquina superior izquierda; el resto del fondo es `--bg`.

### Gradientes de las portadas de arte

Cuando un juego no tiene portada, se muestra un fondo degradado con símbolo tipográfico.
Hay 5 variantes de gradiente (`.game-art` default, `.art-1` … `.art-4`) en tonos fríos oscuros
(azul-grisáceo, violeta-pizarra, verde-oliva, rojo-pizarra, verde-azulado).

---

## 2. Tipografía

Tres familias importadas de Google Fonts. **No agregar otras fuentes.**

### Familias y tokens

| Token CSS                         | Familia         | Pesos usados       | Rol                                                                                         |
| --------------------------------- | --------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| _(sin token, es la familia base)_ | `DM Sans`       | 400, 500, 600, 700 | Cuerpo de texto, párrafos, botones, etiquetas de campo                                      |
| `--display`                       | `Space Grotesk` | 400, 500, 600, 700 | Títulos h1/h2, números en stat-card, nombres de juego en tarjeta                            |
| `--mono`                          | `DM Mono`       | 400, 500           | Etiquetas en mayúsculas (`eyebrow`), metadatos, pie de campo `OPCIONAL`, contadores, footer |

### Escala tipográfica

| Elemento                                  | Font shorthand / tamaño                                        | Peso    |
| ----------------------------------------- | -------------------------------------------------------------- | ------- |
| `h1` (títulos de página)                  | `Space Grotesk`, 42 px, l-h 1.15, tracking -1.7 px             | 600     |
| `h1` mobile (< 620 px)                    | 35 px                                                          | 600     |
| `h2` de sección                           | `Space Grotesk`, 23 px                                         | 600     |
| `h2` de tarjeta juego                     | `Space Grotesk`, 20 px                                         | 600     |
| `h2` sesiones globales                    | `Space Grotesk`, 17 px                                         | 600     |
| Stat-card valor                           | `Space Grotesk`, 26 px                                         | 600     |
| Sesión fecha (número día)                 | `Space Grotesk`, 19 px                                         | 600     |
| Sesión métrica valor                      | `Space Grotesk`, 19 px                                         | 600     |
| Cuerpo / labels de campo                  | `DM Sans`, 12–14 px                                            | 400–600 |
| `eyebrow`                                 | `DM Mono`, 10 px, tracking 1.5 px, uppercase, color `--accent` | 400     |
| Metadatos mono (footer, contadores, pill) | `DM Mono`, 8–9 px, tracking ≥ 0.5 px                           | 400     |
| Nombre de marca (topbar)                  | `Space Grotesk`, 20 px, tracking -0.7 px                       | 700     |
| Sub-marca (`small` bajo el logo)          | `DM Mono`, 9 px, tracking 1.1 px                               | 400     |

### `title-dot`

El carácter `.` que remata los títulos principales lleva `color: var(--accent)`.
Se escribe en JSX como `<span className="title-dot">.</span>` dentro del `<h1>` o `<h2>`.

---

## 3. Espaciado y Layout

### Shell y breakpoints

| Breakpoint | Padding lateral del shell |
| ---------- | ------------------------- |
| ≥ 901 px   | 56 px                     |
| 621–900 px | 28 px                     |
| ≤ 620 px   | 17 px                     |

Ancho máximo del shell: **1440 px**, centrado.

### Espaciado base (valores frecuentes)

| Uso                                          | Valor                              |
| -------------------------------------------- | ---------------------------------- |
| Separación entre secciones (`section-block`) | `margin-top: 48 px` (38 px mobile) |
| Padding interior de tarjetas / paneles       | 17–25 px                           |
| Gap de la cuadrícula de juegos               | 20 px (13 px en móvil)             |
| Gap de las cuadrículas de stats              | 12 px (8 px en móvil)              |
| Separación entre acciones del formulario     | 10 px                              |
| Gap del topbar (nav)                         | 34 px (15 px en móvil)             |
| Altura del topbar                            | 88 px (72 px en móvil)             |

### Cuadrículas

| Cuadrícula           | Columnas escritorio | Columnas tablet | Columnas móvil |
| -------------------- | ------------------- | --------------- | -------------- |
| Biblioteca de juegos | 3                   | 2               | 1              |
| Stats de resumen     | 4                   | 4               | 2              |
| Formulario           | 2                   | 2               | 1              |

### Radio de borde

| Elemento                                 | `border-radius`        |
| ---------------------------------------- | ---------------------- |
| Tarjetas, filtros, paneles grandes       | 8 px                   |
| Stat-card, session-row, achievement-list | 7 px                   |
| Botones                                  | 6 px                   |
| Inputs, selects                          | 5 px                   |
| Modal de confirmación                    | 10 px                  |
| Brand-mark (logo)                        | 10 px 10 px 10 px 3 px |
| Checkbox personalizado                   | 4 px                   |
| Barra de progreso, spinner               | 999 px (pill)          |

---

## 4. Componentes

### 4.1 Botones

Clase base: `.button` → `min-height: 42 px`, `font-size: 12 px`, `font-weight: 700`, `border-radius: 6 px`.

| Variante       | Clase               | Fondo                  | Texto                      | Borde     | Hover                         |
| -------------- | ------------------- | ---------------------- | -------------------------- | --------- | ----------------------------- |
| **Primario**   | `.button-primary`   | `--accent` (`#b8f36b`) | `--accent-ink` (`#17200e`) | —         | Fondo `#c9ff80`, sube 1 px    |
| **Secundario** | `.button-secondary` | `#252a37`              | hereda                     | `#41485a` | Borde `#778091`               |
| **Ghost**      | `.button-ghost`     | transparente           | `#a6abba`                  | `--line`  | Texto `#fff`, borde `#596173` |
| **Peligro**    | `.button-danger`    | `#873c47`              | `#fff1f1`                  | —         | Fondo `#a34753`               |
| **Pequeño**    | `.button-small`     | `#2b303b`              | hereda                     | `#434a5a` | —                             |

Estado deshabilitado: `opacity: 0.6`, `cursor: wait`.

### 4.2 Tarjeta de Videojuego (`.game-card`)

- Fondo `--panel`, borde `--line`, `border-radius: 8 px`.
- **Hover:** `border-color: #b8f36b66`, eleva 4 px (`translate 0 -4 px`), escala `1.02`, sombra con glow verde.
- Portada: `height: 174 px`, `object-fit: cover` (`.cover-image`), con fallback de arte abstracto y símbolo tipográfico.
- Status pill: posición absoluta `top/right: 13 px`, fondo semitransparente `#10131bd1`, texto en `DM Mono` 9 px uppercase.
  - `.status-jugando` → texto `--accent`, borde `#b8f36b55`.
  - `.status-completado` → texto `#9dc9ff`.
- Animación de entrada: `card-enter` (fade + translateY desde 13 px), con `animation-delay` escalonado hasta 8 × 65 ms.

### 4.3 Tarjeta de Stat (`.stat-card`)

- Columna flex, `min-height: 126 px`, padding 17 px, fondo `--panel`, borde `--line`, `border-radius: 7 px`.
- Etiqueta: `DM Mono` 9 px, color `#9298a6`.
- Valor: `Space Grotesk` 26 px 600.
- Hint (subtítulo): `DM Sans` 10 px, color `--muted`.
- Barra de progreso (opcional): `height: 4 px`, fondo `#2b3240`, relleno con gradiente `#7eae45 → --accent → #dcff9e`, glow `0 0 12 px #b8f36b75`, animación `progress-enter` (scaleX desde 0).

### 4.4 Barra de progreso (`.metric-track`)

```css
height: 4px;
border-radius: 999px;
background: #2b3240;
/* fill → */
background: linear-gradient(90deg, #7eae45, var(--accent), #dcff9e);
box-shadow: 0 0 12px #b8f36b75;
```

El ancho del relleno se controla con `--progress: X%` como CSS custom property en línea.
Animación de entrada: `progress-enter` 0.9 s.

### 4.5 Formulario (`.form-card`)

- Grid de 2 columnas (1 en móvil), gap 20 px, padding 25 px.
- Fondo `--panel`, borde `--line`, `border-radius: 8 px`.
- Campos (`.field`): flex columna, label 11 px 600 `DM Sans`, color `#cdd0da`.
- Inputs / selects / textarea: fondo `#131720`, borde `#303645`, texto `#e8e9ef`, 12 px, `min-height: 42 px`.
- Placeholder: `#737a89`.
- `.field-wide` → ocupa las 2 columnas (`grid-column: 1 / -1`).
- Acciones (`.form-actions`): alineadas a la derecha, separadas del contenido por borde superior `--line`.
- Input `type="range"`: `accent-color: var(--accent)`; valor numérico en `DM Mono` 12 px color `--accent` a la derecha del label.
- Preview de portada: 132 × 174 px, `border-radius: 6 px`, con etiqueta flotante `VISTA PREVIA` en `DM Mono` 8 px.

### 4.6 Modal de Confirmación (`.confirm-dialog`)

- Backdrop fijo, `z-index: 20`, fondo `#080b12b8` con `backdrop-filter: blur(8 px)`.
- Diálogo: `width: min(100%, 430 px)`, padding 26 px, fondo `#191e29`, borde `#3b4352`, `border-radius: 10 px`, sombra con glow verde sutil `0 0 38 px #b8f36b0b`.
- Título: `Space Grotesk` 23 px 600.
- Descripción: `DM Sans` 13 px, l-h 1.6, color `#a1a7b5`.
- Acciones: alineadas a la derecha, gap 9 px.
- Cierre por `Escape`, click en backdrop, o botón Cancelar; focus inicial en Cancelar.
- Animaciones: `backdrop-in/out` (fade), `dialog-in/out` (scale 0.95 + translateY 8 px).
- Durante acción en progreso: botones `disabled`, texto "Procesando...".

### 4.7 Lista de Logros (`.achievement-list` / `.achievement-row`)

- Contenedor: fondo `--panel`, borde `--line`, `border-radius: 7 px`; overflow hidden.
- Cada fila: `min-height: 56 px`, flex, padding `0 17 px`, separada por borde inferior `--line` (excepto la última).
- Checkbox: `position: absolute; opacity: 0` (oculto visualmente), con sustituto visual `.checkbox-custom` de 17 × 17 px, `border-radius: 4 px`.
  - Pendiente: borde `#596173`, fondo transparente.
  - Obtenido: borde y fondo `--accent`, texto `--accent-ink`; animación `check-pop` (bounce scale).
- Estado obtenido (`.achievement-done`): texto tachado con `text-decoration-color`, color `#9ba293`, opacidad 0.72.
- Etiqueta de estado: `DM Mono` 8 px, color `--muted` ("DESBLOQUEADO" / "PENDIENTE").

### 4.8 Fila de Sesión (`.session-row` / `.all-session-card`)

- **Sesión en detalle** (`.session-row`): flex horizontal, `min-height: 78 px`, padding `12 px 17 px`.
  - Fecha: columna flex centrada, número del día en `Space Grotesk` 19 px 600, resto en `DM Mono` 9 px uppercase.
  - Notas: flex-grow, título 12 px 500, subtítulo 10 px muted.
  - Avance: `Space Grotesk` 18 px 600, alineado a la derecha.
  - Botón eliminar (`.icon-button`): 30 × 30 px, `font-size: 21 px` (`×`); hover → texto `#ff9ea6`, fondo `#ff879014`.
- **Sesión en historial global** (`.all-session-card`): flex horizontal, `min-height: 112 px`, padding `17 px 20 px`, fondo `--panel`, borde `--line`, `border-radius: 7 px`.

### 4.9 Estados de Interfaz

#### Carga (Skeletons)

- Bloque base: `background: #222836`, `border-radius: 5 px`.
- Shimmer: gradiente pseudo-element animado `skeleton-shimmer` 1.6 s infinite.
- Variantes: `library` (6 tarjetas), `detail` (hero + stats + logros), `sessions` (4 filas), `form` (5 campos).

#### Error (`.feedback-error`)

- Fondo `#381e26`, borde `#70434a`, texto `#ffc4c8`.
- Botón Reintentar: `.button-small`.

#### Vacío (`.empty-state`)

- Borde discontinuo `#373e4c`, fondo `#171b2566`.
- Icono `◇` en `--accent` 30 px.
- Título `Space Grotesk` 18 px 600, descripción 13 px muted.

#### Spinner

- 18 × 18 px, borde 2 px (`#ffffff32`), arco superior `--accent`, rotación `spin` 0.75 s lineal infinito.

---

## 5. Tono de los Textos

### Idioma y voz

- **Español exclusivamente.** No mezclar inglés en textos de UI visibles al usuario.
- **Tuteo directo:** "Registra tu primera partida", "Añade tu primer videojuego", "¿Qué lograste en esta sesión?".
- Voz en primera persona del usuario: "Tu colección", "Tu historial", "Tu progreso, a tu ritmo".

### Mensajes cortos y accionables

- Los estados vacíos dan una instrucción concreta: _"Añade tu primer videojuego o cambia los filtros para empezar."_
- Los errores nombran la causa y ofrecen Reintentar.
- Las confirmaciones de borrado son específicas: _"El videojuego y todas sus sesiones asociadas se eliminarán permanentemente."_ — sin ambigüedad.
- Los botones describen la acción resultante: **Crear videojuego**, **Guardar cambios**, **Guardar sesión**, **Eliminar videojuego**, **Cancelar**.

### Etiquetas en mayúsculas (`eyebrow`)

Usadas como supratítulos contextuales: `TU COLECCIÓN`, `DIARIO DE SESIONES`, `TU RECORRIDO`, `COLECCIONABLES`, `HISTORIAL`, `CONFIRMAR ACCIÓN`. Siempre en `DM Mono`, 9–10 px, tracking ≥ 1 px, color `--accent`.

---

## 6. Accesibilidad

### Contraste (WCAG AA objetivo)

| Par de colores                                      | Ratio aproximado | Nivel  |
| --------------------------------------------------- | ---------------- | ------ |
| `--accent` `#b8f36b` sobre `--bg` `#10131b`         | ~ 8.5 : 1        | AAA ✅ |
| Texto cuerpo `#e9eaf0` sobre `--bg` `#10131b`       | ~ 14 : 1         | AAA ✅ |
| `--muted` `#858b9b` sobre `--panel` `#171b26`       | ~ 4.6 : 1        | AA ✅  |
| `--accent-ink` `#17200e` sobre `--accent` `#b8f36b` | ~ 9.5 : 1        | AAA ✅ |
| Error `#ffc4c8` sobre `#381e26`                     | ~ 7.1 : 1        | AAA ✅ |

> [!IMPORTANT]
> Los textos de apoyo de 8–9 px (`DM Mono` en footer, metadatos) son decorativos o redundantes; no son el único canal de información crítica.

### Foco visible

```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

El checkbox sustituto también tiene `focus-visible` propio aplicado sobre `.checkbox-custom`.
No se suprime `:focus` sin ofrecer `:focus-visible`.

### Atributos ARIA y semántica

| Patrón                    | Implementación                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Modal de confirmación     | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`                           |
| Skeletons en carga        | `role="status"`, `aria-label` con mensaje legible, texto `.sr-only`                                        |
| Barra de progreso en stat | `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`                                    |
| Arte de portada/fallback  | `aria-hidden="true"` en símbolo decorativo                                                                 |
| Selector de filtros       | Label visible con `.sr-only`                                                                               |
| Botones de icono          | `aria-label` explícito ("Eliminar sesión", "Eliminar {nombre}")                                            |
| Input de checkbox logro   | `position: absolute; opacity: 0` — el elemento real recibe foco; el sustituto visual es `.checkbox-custom` |

### `prefers-reduced-motion`

Todas las animaciones y transiciones se desactivan (`0.01 ms`) si el sistema tiene activada la preferencia de movimiento reducido.

### Clase `.sr-only`

Texto visualmente oculto pero accesible para lectores de pantalla:

```css
position: absolute;
width: 1px;
height: 1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
```

---

## 7. No hacemos

> [!CAUTION]
> Las siguientes decisiones son restricciones deliberadas de diseño. No deben romperse sin revisar este documento y el README primero.

- **Sin librerías de componentes UI.** No se usa Material UI, Chakra, shadcn/ui, Radix, Headless UI ni ninguna otra. Todos los componentes son propios.
- **Sin gráficos históricos ni charts.** No se implementan líneas de tendencia, barras de tiempo ni visualizaciones con D3, Chart.js, Recharts u otras. El resumen de progreso es tabular (cuatro stat-cards).
- **Sin colores fuera de los tokens.** No se añaden hexadecimales nuevos sin crear primero un token en `:root` de `styles.css` y documentarlo en la sección 1 de este archivo.
- **Sin fuentes adicionales.** El proyecto usa exactamente `DM Sans`, `Space Grotesk` y `DM Mono`. No se agregan otras familias.
- **Sin CSS-in-JS ni módulos CSS.** Los estilos viven en un único archivo `frontend/src/styles.css`. No se usan `styled-components`, `emotion` ni archivos `.module.css`.
- **Sin animaciones que aporten información nueva.** Las animaciones son decorativas (entrada de tarjeta, check-pop, progress-enter). Toda información crítica también está disponible en texto.
- **Sin internacionalización.** La interfaz es monolingüe en español. No se integra i18n.
