import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Empty, ErrorMessage, Loading } from "../components/Feedback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { deletePartida, getPartidas } from "../services/partidasApi";
import { Partida, Videojuego } from "../types";

export function PartidasPage() {
  const [sessions, setSessions] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<Partida | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setSessions(await getPartidas()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar las sesiones."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function removeSession() {
    if (!sessionToDelete) return;
    try { await deletePartida(sessionToDelete._id); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible eliminar la sesión."); }
    finally { setSessionToDelete(null); }
  }

  return <>
    <section className="page-heading"><div><span className="eyebrow">DIARIO DE SESIONES</span><h1>Tu historial<span className="title-dot">.</span></h1><p>Cada sesión es un paso más en la aventura.</p></div><Link className="button button-primary" to="/partidas/nueva">＋ Registrar sesión</Link></section>
    {loading ? <Loading message="Cargando historial..." variant="sessions" /> : error ? <ErrorMessage message={error} onRetry={() => void load()} /> :
      sessions.length === 0 ? <Empty title="Sin sesiones todavía" detail="Registra una sesión y empieza a construir tu historial." /> :
        <section className="all-sessions">{sessions.map((session) => {
          const game = typeof session.videojuego === "object" ? session.videojuego as Videojuego : null;
          return <article className="all-session-card" key={session._id}><div className="session-date"><strong>{new Date(session.fecha).toLocaleDateString("es", { timeZone: "UTC", day: "2-digit" })}</strong><span>{new Date(session.fecha).toLocaleDateString("es", { timeZone: "UTC", month: "short", year: "numeric" })}</span></div><div className="all-session-game"><span className="eyebrow">{game?.plataforma || "VIDEOJUEGO"}</span><h2>{game ? <Link to={`/videojuegos/${game._id}`}>{game.nombre}</Link> : "Videojuego no disponible"}</h2><p>{session.notas || "Sesión de juego"}</p></div><div className="session-metric"><strong>{session.duracionMinutos}<small> min</small></strong><span>DURACIÓN</span></div><div className="session-metric"><strong>{session.porcentajeAvance}<small>%</small></strong><span>AVANCE</span></div><button className="icon-button" aria-label="Eliminar sesión" onClick={() => setSessionToDelete(session)}>×</button></article>;
        })}</section>}
    <ConfirmDialog open={Boolean(sessionToDelete)} title="¿Eliminar esta sesión?" description="La sesión se eliminará permanentemente del historial." confirmLabel="Eliminar sesión" onConfirm={removeSession} onCancel={() => setSessionToDelete(null)} />
  </>;
}
