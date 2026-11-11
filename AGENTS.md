# Contexto y Reglas para Antigravity

## Proyecto

Proyecto 3 - Entregable 4 (E2): Metas y Rachas para videojuegos.

## Stack

Node.js 20, TypeScript, Express, Mongoose, React, Vite, Tailwind CSS.

## Estructura

- `backend/`: API Express, modelos, servicios, controladores, middlewares.
- `frontend/`: App React, componentes, páginas, servicios de API.
- `docs/`: prd/, backlog/, specs/, evidencias/, diagnostico.md, AUDITORIA.md, bitacora-agente.md.
- `.agent/`: rules/, skills/, workflows/.

## Comandos

- Backend: `cd backend && npm run dev` / `npm test`
- Frontend: `cd frontend && npm run dev`

## Reglas Inviolables

1. NUNCA leer ni modificar `.env` ni archivos `.env.local`.
2. NUNCA implementar funcionalidad sin spec previa en `docs/specs/`.
3. Ejecutar los tests automatizados antes de dar una tarea por terminada.
4. Lógica de semana, racha e hitos EXCLUSIVAMENTE en `src/dominio/` con funciones puras.
5. Cada commit de código nombra su ticket: `feat(E2): T-XX ...` o `fix(E2): T-XX ...`.

## Frontend

Seguir `DESIGN.md`. No duplicar su contenido aquí.
