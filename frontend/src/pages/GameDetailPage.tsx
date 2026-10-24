import { CSSProperties, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Empty, ErrorMessage, Loading } from "../components/Feedback";
import { GameCover } from "../components/GameCover";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { deletePartida } from "../services/partidasApi";
import { deleteVideojuego, getPartidasByVideojuego, getResumenVideojuego, getVideojuegoById, toggleLogro } from "../services/videojuegosApi";
import { Partida, Resumen, Videojuego } from "../types";

export function GameDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<Videojuego | null>(null);
  const [sessions, setSessions] = useState<Partida[]>([]);
  const [summary, setSummary] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<{ title: string; description: string; confirmLabel: string; action: () => Promise<void> } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [gameData, summaryData, sessionData] = await Promise.all([
        getVideojuegoById(id), getResumenVideojuego(id), getPartidasByVideojuego(id),
      ]);
      setGame(gameData); setSummary(summaryData); setSessions(sessionData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar el detalle.");
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function handleAchievement(logroId: string, obtenido: boolean) {
    try { setGame(await toggleLogro(id, logroId, obtenido)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible actualizar el logro."); }
  }

  async function removeSession(session: Partida) {
    try { await deletePartida(session._id); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar la sesión."); }
  }

  async function removeGame() {
    try {
      await deleteVideojuego(id);
      navigate("/");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar el videojuego."); }
  }

  if (loading) return <Loading message="Cargando progreso..." variant="detail" />;
  if (error && !game) return <ErrorMessage message={error} onRetry={() => void load()} />;
  if (!game || !summary) return <Empty title="Videojuego no encontrado" detail="No se encontró el videojuego solicitado." />;
  return (
    <>
      <Link className="back-link" to="/">← Volver a biblioteca</Link>
      {error && <ErrorMessage message={error} onRetry={() => void load()} />}
      <section className="detail-hero">
        <div className="detail-art art-2"><GameCover url={game.portadaUrl} className="cover-image" fallbackClassName="detail-fallback" symbol="△" alt={`Portada de ${game.nombre}`} /></div>
        <div className="detail-info"><span className="eyebrow">{game.plataforma.toUpperCase()} / {game.genero.toUpperCase()}</span><h1>{game.nombre}<span className="title-dot">.</span></h1><span className={`status-pill status-${game.estado}`}>{game.estado}</span>
          <div className="detail-actions"><Link className="button button-secondary" to={`/videojuegos/${id}/editar`}>Editar juego</Link><button className="button button-ghost danger-text" onClick={() => setPendingConfirmation({ title: `¿Eliminar “${game.nombre}”?`, description: "El videojuego y todas sus sesiones asociadas se eliminarán permanentemente.", confirmLabel: "Eliminar videojuego", action: removeGame })}>Eliminar</button><Link className="button button-primary" to={`/partidas/nueva?videojuego=${id}`}>＋ Registrar sesión</Link></div>
        </div>
      </section>
      <section className="section-block"><div className="section-title"><div><span className="eyebrow">TU RECORRIDO</span><h2>Resumen de progreso</h2></div></div>
        <div className="stats-grid">
          <Stat label="SESIONES" value={summary.totalPartidas} suffix="" hint="partidas registradas" />
          <Stat label="TIEMPO JUGADO" value={summary.horasTotales} suffix="h" decimals={2} hint="horas totales" />
          <Stat label="ÚLTIMA SESIÓN" value={summary.ultimaPartida ? new Date(summary.ultimaPartida).toLocaleDateString("es", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" }) : "—"} hint="fecha más reciente" />
          <Stat label="AVANCE ACTUAL" value={summary.porcentajeAvanceActual} suffix="%" progress={summary.porcentajeAvanceActual} hint="último porcentaje registrado" />
        </div>
      </section>
      <section className="section-block"><div className="section-title"><div><span className="eyebrow">COLECCIONABLES</span><h2>Logros <span className="muted-count">{game.logros.filter((item) => item.obtenido).length}/{game.logros.length}</span></h2></div></div>
        {game.logros.length === 0 ? <Empty title="Sin logros registrados" detail="Edita el juego para añadir objetivos a tu recorrido." /> :
          <div className="achievement-list">{game.logros.map((logro) => <label className={`achievement-row ${logro.obtenido ? "achievement-done" : ""}`} key={logro._id}><input type="checkbox" checked={logro.obtenido} onChange={(event) => void handleAchievement(logro._id, event.target.checked)} /><span className="checkbox-custom" aria-hidden="true">{logro.obtenido ? "✓" : ""}</span><span>{logro.nombre}</span><small>{logro.obtenido ? "DESBLOQUEADO" : "PENDIENTE"}</small></label>)}</div>}
      </section>
      <section className="section-block"><div className="section-title"><div><span className="eyebrow">HISTORIAL</span><h2>Sesiones recientes</h2></div><Link className="text-link" to={`/partidas/nueva?videojuego=${id}`}>＋ Añadir sesión</Link></div>
        {sessions.length === 0 ? <Empty title="Aún no hay sesiones" detail="Registra tu primera partida para seguir el progreso." /> :
          <div className="session-list">{sessions.map((session) => <article className="session-row" key={session._id}><div className="session-date"><strong>{new Date(session.fecha).toLocaleDateString("es", { timeZone: "UTC", day: "2-digit" })}</strong><span>{new Date(session.fecha).toLocaleDateString("es", { timeZone: "UTC", month: "short", year: "numeric" })}</span></div><div className="session-notes"><strong>{session.notas || "Sesión de juego"}</strong><span>{session.duracionMinutos} min jugados</span></div><div className="session-progress"><strong>{session.porcentajeAvance}%</strong><span>AVANCE</span></div><button className="icon-button" aria-label="Eliminar sesión" onClick={() => setPendingConfirmation({ title: "¿Eliminar esta sesión?", description: "La sesión se eliminará permanentemente del historial.", confirmLabel: "Eliminar sesión", action: () => removeSession(session) })}>×</button></article>)}</div>}
      </section>
      <ConfirmDialog open={Boolean(pendingConfirmation)} title={pendingConfirmation?.title ?? ""} description={pendingConfirmation?.description ?? ""} confirmLabel={pendingConfirmation?.confirmLabel ?? "Confirmar"} onConfirm={async () => { await pendingConfirmation?.action(); setPendingConfirmation(null); }} onCancel={() => setPendingConfirmation(null)} />
    </>
  );
}

function Stat({ label, value, suffix = "", decimals = 0, progress, hint }: { label: string; value: number | string; suffix?: string; decimals?: number; progress?: number; hint: string }) {
  return <article className="stat-card"><span>{label}</span><strong>{typeof value === "number" ? <AnimatedNumber value={value} decimals={decimals} /> : value}{suffix}</strong>{progress !== undefined && <div className="metric-track" role="progressbar" aria-label="Porcentaje de avance" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ "--progress": `${progress}%` } as CSSProperties} /></div>}<small>{hint}</small></article>;
}

function AnimatedNumber({ value, decimals }: { value: number; decimals: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }
    const duration = 850;
    const start = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 4;
      setDisplayValue(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{displayValue.toFixed(decimals)}</>;
}
