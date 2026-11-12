# Auditoría de trazabilidad y cierre — E2

**Fecha de revisión:** 11 de noviembre de 2026  
**Alcance:** Metas semanales, progreso, rachas, hitos y hallazgos P-01 a P-03.

## Trazabilidad de punta a punta

| Requisito del PRD                                                    | Historia y criterios                          | Ticket                        | Spec                                                                                        | Verificación                                                                                                                                                      | Código relacionado                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 a RN-06, CN-01 a CN-03: semanas, horas, rachas, hitos y fechas | H-03 a H-05; CA-03.x, CA-04.x y CA-05.x       | T-02, T-03, T-07, T-08 y T-10 | [Backend](./specs/backend-meta-progreso.md) y [frontend](./specs/frontend-progreso-meta.md) | Tests de dominio en [progreso.test.ts](../backend/src/dominio/progreso.test.ts); escenarios E-01/E-02 de la [matriz API](./evidencias/pruebas-api.md)             | [Dominio](../backend/src/dominio/); [progreso.service.ts](../backend/src/services/progreso.service.ts); [ProgresoSemanalCard.tsx](../frontend/src/components/ProgresoSemanalCard.tsx); [GameDetailPage.tsx](../frontend/src/pages/GameDetailPage.tsx)   |
| RN-07, RN-08, CN-04 y CN-05: ciclo de vida, unicidad y cascada       | H-01, H-02 y H-06; CA-01.x, CA-02.x y CA-06.x | T-01, T-04, T-05 y T-09       | [Backend](./specs/backend-meta-progreso.md) y [frontend](./specs/frontend-progreso-meta.md) | Los escenarios E-05/E-06 están descritos en la [matriz API](./evidencias/pruebas-api.md) como verificaciones manuales previstas                                   | [meta.model.ts](../backend/src/models/meta.model.ts); [metas.service.ts](../backend/src/services/metas.service.ts); [videojuegos.service.ts](../backend/src/services/videojuegos.service.ts); [MetaModal.tsx](../frontend/src/components/MetaModal.tsx) |
| Respuesta HTTP y trazabilidad de errores                             | CA-01.2 y requisitos de error del backend     | T-06 y T-12                   | [Backend](./specs/backend-meta-progreso.md), reglas de códigos y `requestId`                | [errorHandler.test.ts](../backend/src/middlewares/errorHandler.test.ts) verifica 400, 404, `ConflictError`, duplicidad MongoDB 11000 y el cuerpo de respuesta 409 | [errorHandler.ts](../backend/src/middlewares/errorHandler.ts); [errors.ts](../backend/src/services/errors.ts)                                                                                                                                           |
| Rechazo temprano de IDs malformados                                  | CA de endpoints con `:id`                     | T-11                          | [Backend](./specs/backend-meta-progreso.md), restricción de IDs y errores                   | [routeParam.test.ts](../backend/src/controllers/routeParam.test.ts) verifica IDs válidos, malformados y vacíos                                                    | [routeParam.ts](../backend/src/controllers/routeParam.ts); controladores que consumen `routeParam`                                                                                                                                                      |

La relación documental PRD → historia/criterio → ticket → spec está registrada en los documentos enlazados. El backlog asigna archivos por ticket y los tests identifican T-11/T-12 en sus suites. La matriz de API especifica escenarios de integración manual con `curl`; es una guía de verificación y no se toma como prueba de que esos comandos se hayan ejecutado en esta revisión.

## Estado de los hallazgos del diagnóstico

| Hallazgo                                     | Resolución                                                                                                                                   | Evidencia revisada                                                                          | Estado                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| **P-01 — Ausencia de tests automatizados**   | Se agregó Vitest y una suite del backend para dominio, validación de parámetros y manejo de errores.                                         | Ejecución de `npm --prefix backend test`: **3 archivos aprobados, 20/20 tests aprobados**.  | **Resuelto para el alcance de E2.** |
| **P-02 — Validación preventiva de ObjectId** | T-11 valida el parámetro antes de delegar al servicio/Mongoose y devuelve un `BadRequestError` (400).                                        | `backend/src/controllers/routeParam.ts` y `backend/src/controllers/routeParam.test.ts`.     | **Resuelto.**                       |
| **P-03 — Manejo explícito de 409 Conflict**  | T-12 agrega `ConflictError` y traduce errores MongoDB `11000` a 409. El cuerpo probado contiene `success`, `message`, `error` y `requestId`. | `backend/src/middlewares/errorHandler.ts` y `backend/src/middlewares/errorHandler.test.ts`. | **Resuelto.**                       |

## Resultado de pruebas

Comando ejecutado desde la raíz:

```text
npm --prefix backend test
Test Files  3 passed (3)
Tests       20 passed (20)
```

La suite automatizada cubre los tests existentes de dominio, validación de parámetros y middleware de errores. La matriz API documenta comprobaciones manuales adicionales; no se atribuye a la suite automatizada una cobertura de integración que no figura entre esos tests.

## Documentos revisados

- [Diagnóstico](./diagnostico.md)
- [PRD E2](./prd/prd.md)
- [Épicas](./backlog/epicas.md)
- [Backlog e historias/tickets](./backlog/E2-metas-y-rachas.md)
- [Spec de backend](./specs/backend-meta-progreso.md)
- [Spec de frontend](./specs/frontend-progreso-meta.md)
- [Matriz de pruebas de API](./evidencias/pruebas-api.md)
- [Bitácora](./bitacora.md)
