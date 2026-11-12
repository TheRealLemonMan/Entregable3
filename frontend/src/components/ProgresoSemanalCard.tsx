import { CSSProperties } from "react";
import { ProgresoSemanal } from "../types";

interface ProgresoSemanalCardProps {
  progreso: ProgresoSemanal | null;
  juegoCompletadoOAbandonado: boolean;
  onConfigurarMeta: () => void;
}

export function ProgresoSemanalCard({
  progreso,
  juegoCompletadoOAbandonado,
  onConfigurarMeta,
}: ProgresoSemanalCardProps) {
  const tieneMetaActiva = Boolean(progreso?.meta && progreso.meta.activa);

  return (
    <section className="section-block" aria-labelledby="progreso-semanal-heading">
      <div className="section-title">
        <div>
          <span className="eyebrow">CONSTANCIA Y METAS</span>
          <h2 id="progreso-semanal-heading">
            Progreso semanal y rachas<span className="title-dot">.</span>
          </h2>
        </div>
        {tieneMetaActiva && (
          <button
            type="button"
            className="button button-secondary"
            onClick={onConfigurarMeta}
            disabled={juegoCompletadoOAbandonado}
          >
            Editar meta
          </button>
        )}
      </div>

      {!tieneMetaActiva ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            ◎
          </span>
          <h2>Sin meta semanal activa</h2>
          <p>
            {juegoCompletadoOAbandonado
              ? "Este videojuego está completado o abandonado, por lo que no puede tener una meta activa."
              : "Establece cuántas horas deseas jugar cada semana y define hitos para motivar tu avance."}
          </p>
          {!juegoCompletadoOAbandonado && (
            <button
              type="button"
              className="button button-primary"
              style={{ marginTop: "14px" }}
              onClick={onConfigurarMeta}
            >
              ＋ Definir meta semanal
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span>HORAS EN LA SEMANA</span>
              <strong>{progreso?.progresoSemanal.horasJugadas.toFixed(1)}h</strong>
              <div
                className="metric-track"
                role="progressbar"
                aria-label="Porcentaje de meta semanal cumplido"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progreso?.progresoSemanal.porcentajeVisual ?? 0}
              >
                <span
                  style={
                    {
                      "--progress": `${progreso?.progresoSemanal.porcentajeVisual ?? 0}%`,
                    } as CSSProperties
                  }
                />
              </div>
              <small>
                {progreso?.progresoSemanal.horasJugadas.toFixed(1)} h de{" "}
                {progreso?.progresoSemanal.horasSemanaDeseadas.toFixed(1)} h planificadas (
                {progreso?.progresoSemanal.porcentajeVisual}%)
              </small>
            </article>

            <article className="stat-card">
              <span>DÍAS JUGADOS</span>
              <strong>
                {progreso?.progresoSemanal.diasJugados} /{" "}
                {progreso?.progresoSemanal.diasSemanaDeseados}
              </strong>
              <small>meta: {progreso?.progresoSemanal.diasSemanaDeseados} días por semana</small>
            </article>

            <article className="stat-card">
              <span>RACHA ACTUAL</span>
              <strong style={{ color: "var(--accent)" }}>
                {progreso?.rachas.rachaActual}{" "}
                <small style={{ font: "inherit", color: "inherit", fontSize: "16px" }}>
                  {progreso?.rachas.rachaActual === 1 ? "día" : "días"}
                </small>
              </strong>
              <small>
                {progreso?.rachas.rachaActual && progreso.rachas.rachaActual > 0
                  ? "¡Constancia activa!"
                  : "Registra una partida hoy"}
              </small>
            </article>

            <article className="stat-card">
              <span>MEJOR RACHA</span>
              <strong>
                {progreso?.rachas.mejorRacha}{" "}
                <small style={{ font: "inherit", color: "var(--muted)", fontSize: "16px" }}>
                  {progreso?.rachas.mejorRacha === 1 ? "día" : "días"}
                </small>
              </strong>
              <small>récord histórico consecutivo</small>
            </article>
          </div>

          <div style={{ marginTop: "24px" }}>
            <div className="section-title" style={{ marginBottom: "12px" }}>
              <div>
                <span className="eyebrow">MARCAS DE DEDICACIÓN</span>
                <h3 style={{ margin: "4px 0 0", font: "600 18px var(--display)" }}>
                  Hitos por horas acumuladas
                </h3>
              </div>
            </div>

            {!progreso?.hitos || progreso.hitos.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "12px" }}>
                No definiste hitos para esta meta. Edita la meta para añadir objetivos de horas
                acumuladas.
              </p>
            ) : (
              <div className="achievement-list">
                {progreso.hitos.map((hito, idx) => (
                  <div
                    key={`${hito.nombre}-${idx}`}
                    className={`achievement-row ${hito.alcanzado ? "achievement-done" : ""}`}
                    style={{ cursor: "default" }}
                  >
                    <span
                      className="checkbox-custom"
                      aria-hidden="true"
                      style={{ pointerEvents: "none" }}
                    >
                      {hito.alcanzado ? "✓" : "○"}
                    </span>
                    <span style={{ textDecoration: hito.alcanzado ? "none" : "none" }}>
                      <strong>{hito.nombre}</strong> —{" "}
                      <span style={{ color: "var(--muted)" }}>
                        {hito.horasRequeridas}h requeridas
                      </span>
                    </span>
                    <small>{hito.alcanzado ? "DESBLOQUEADO" : "PENDIENTE"}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
