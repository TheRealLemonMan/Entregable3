# Bitácora de trabajo con agentes — E2

**Fecha de cierre:** 11 de noviembre de 2026  
**Proyecto:** Checkpoint — Entregable 2: Metas, rachas e hitos.

Registro cronológico reconstruido a partir del diagnóstico, los documentos versionados y el historial de cambios del repositorio.

## Cronología

1. **Diagnóstico del estado inicial.** Se registraron las carencias que bloqueaban o afectaban E2: ausencia de tests automatizados (P-01), falta de validación preventiva de `ObjectId` (P-02) y manejo incompleto de conflictos `409` (P-03). También se identificaron asuntos menores que no bloqueaban el alcance.
2. **Preparación del harness.** Se configuraron las reglas compartidas de `AGENTS.md`, la referencia de `CLAUDE.md`, la skill `nueva-spec`, las reglas de seguridad y los hooks de Husky para proteger archivos de entorno y formatear archivos staged.
3. **Definición de producto.** Se redactaron el PRD E2 y las épicas; después se desglosaron las historias H-01 a H-06, criterios de aceptación y tickets T-01 a T-12 en el backlog.
4. **Especificación previa al código.** Se escribieron las specs de backend (T-01 a T-06) y frontend (T-07 a T-10), con reglas DEBE/NO DEBE, criterios de verificación y asignación de archivos.
5. **Pruebas y dominio.** Se añadieron tests para las reglas puras de progreso y se implementaron los cálculos de semana, rachas e hitos en el dominio.
6. **Backend.** Se incorporaron el modelo de metas, los endpoints y servicios de progreso y metas, el manejo centralizado de errores y la eliminación en cascada.
7. **Frontend.** Se desarrollaron el cliente API, la visualización de progreso y rachas, el formulario de metas e hitos y la actualización de datos después de cambios en partidas.
8. **Pago de deuda técnica.** T-11 añadió la validación anticipada de identificadores (P-02). T-12 formalizó `ConflictError`, el mapeo de duplicados MongoDB a HTTP 409 y sus pruebas (P-03).
9. **Verificación final.** La suite Vitest del backend se ejecutó con `npm --prefix backend test`: **3 archivos de test y 20/20 tests pasaron**. La matriz de pruebas de API también documenta escenarios `curl` para 400, 404, 409 y eliminación en cascada.

## Desvío respecto de la spec y corrección

En la revisión del backend se detectó que el flujo de parámetros todavía podía depender del `CastError` de Mongoose para rechazar un identificador malformado. Eso no cumplía la validación preventiva exigida para P-02/T-11. Se contrastó el comportamiento con el diagnóstico y el ticket, se centralizó la comprobación en `routeParam` y se añadieron tests para confirmar que un ID inválido se rechaza como `400` antes de llegar al servicio. La corrección quedó registrada en T-11.

## Referencias

- [Diagnóstico](./diagnostico.md)
- [PRD](./prd/prd.md)
- [Épicas](./backlog/epicas.md)
- [Backlog E2](./backlog/E2-metas-y-rachas.md)
- [Spec de backend](./specs/backend-meta-progreso.md)
- [Spec de frontend](./specs/frontend-progreso-meta.md)
- [Pruebas de API](./evidencias/pruebas-api.md)
