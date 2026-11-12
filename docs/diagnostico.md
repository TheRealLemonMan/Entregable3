# Diagn√≥stico del Proyecto 3 - Entregable 4 (E2)

**Fecha:** 11 de noviembre de 2026
**Herramienta aprobada por el docente:** Antigravity IDE (equivalente funcional a Claude Code y Cursor).

## 1. Estado del Proyecto 3
- **Stack:** Node.js 20 + TypeScript 5.7, Express 4, Mongoose 8, MongoDB Atlas (Backend) / React 18 + Vite 6 + React Router 7 (Frontend). Desplegado en Render.
- **Endpoints actuales:** CRUD completo de videojuegos, logros embebidos, historial, resumen y partidas.
- **Lo que funciona:** Operaciones CRUD, cascada b√°sica al eliminar videojuegos, agregaciones del resumen, manejo de errores generales (400, 404, 500) y `.env.example` en ambos entornos.
- **Lo que falta:** Ausencia de tests automatizados, validaci√≥n previa expl√≠cita de ObjectId (ahora dependiente de Mongoose) y captura de errores de conflicto (409).

---

## 2. Tabla de Problemas y Decisiones para E2

| ID | Problema | Evidencia | Severidad | Decisi√≥n (Bloquea E2 / Se difiere) | Motivo |
|---|---|---|:---:|---|---|
| **P-01** | Sin tests automatizados | `backend/package.json` | Ì¥¥ Alta | **Bloquea E2** | Se instalar√° Vitest y se crear√°n los tests de dominio obligatorios (Fase 6). |
| **P-02** | Sin validaci√≥n previa de ObjectId | `routeParam.ts:4-9` | Ìø† Media | **Se difiere (Se paga en Fase 8)** | Depende actualmente del `CastError` de Mongoose; se pagar√° como deuda t√©cnica menor. |
| **P-03** | Sin 409 Conflict en errorHandler | `errorHandler.ts` | Ìø° Baja-Media | **Se difiere (Se paga en Fase 8)** | Necesario para evitar 500 en restricciones √∫nicas futuras; se pagar√° como segunda deuda. |
| **P-04** | `portadaUrl` default `""` | `videojuego.model.ts:34` | Ìø° Baja | **Se difiere** | No afecta la funcionalidad central de metas y rachas de E2. |
| **P-05** | Validaci√≥n de videojuego en partidas | `partidas.service.ts:13-16` | Ìø° Baja | **Se difiere** | Cubierto de forma gen√©rica por el manejo actual de errores. |
| **P-06** | Redondeo de decimales en frontend | `GameDetailPage.tsx:66` | Ìø° Baja | **Se difiere** | Detalle est√©tico menor que no bloquea la l√≥gica de metas. |
| **P-07** | Rama muerta en frontend API | `videojuegosApi.ts:16-21` | Ìø¢ Muy baja | **Se difiere** | C√≥digo inofensivo sin impacto en producci√≥n. |

---

## 3. Decisiones de Deuda T√©cnica (Fase 8)
Para la Fase 8, pagaremos formalmente:
1. **P-02:** Implementar validaci√≥n previa de ObjectId en el middleware de par√°metros (`routeParam.ts`) para retornar un 400 limpio.
2. **P-03:** A√±adir el manejo de c√≥digos `11000` (Duplicate Key) en el `errorHandler.ts` para devolver un c√≥digo HTTP **409 Conflict**.

---

## 4. Equivalencias Antigravity (Herramienta aprobada por el docente)
| Claude Code / Cursor | Antigravity |
|---|---|
| `AGENTS.md` | Igual (le√≠do por el agente). |
| `CLAUDE.md` con `@AGENTS.md` | Una sola l√≠nea apuntando a `@AGENTS.md`. |
| Skill en `.claude/skills/` | Creada en `.agent/skills/nueva-spec/SKILL.md` y copiada en `.claude/skills/`. |
| Hook en `.claude/settings.json` | Hooks de Git con Husky + `lint-staged` y regla en `.agent/rules/seguridad.md`. |
| Modo Planning | Modo Planning de Antigravity (con capturas de plan). |
