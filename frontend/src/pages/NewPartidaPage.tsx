import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ErrorMessage, Loading } from "../components/Feedback";
import { createPartida } from "../services/partidasApi";
import { getVideojuegos } from "../services/videojuegosApi";
import { PartidaInput, Videojuego } from "../types";

export function NewPartidaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [games, setGames] = useState<Videojuego[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PartidaInput>({ videojuego: params.get("videojuego") || "", fecha: new Date().toISOString().slice(0, 10), duracionMinutos: 60, porcentajeAvance: 0, notas: "" });

  async function loadGames() {
    setLoading(true); setError("");
    try {
      const data = await getVideojuegos();
      setGames(data);
      if (!params.get("videojuego") && data[0]) setForm((current) => ({ ...current, videojuego: data[0]._id }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible cargar los videojuegos."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadGames(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try { await createPartida(form); navigate(form.videojuego ? `/videojuegos/${form.videojuego}` : "/partidas"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar la sesión."); }
  }

  if (loading) return <Loading message="Preparando formulario..." variant="form" />;
  return <section className="form-page">
    <Link className="back-link" to="/partidas">← Volver al historial</Link>
    <div className="form-heading"><span className="eyebrow">DIARIO DE SESIONES</span><h1>Nueva sesión<span className="title-dot">.</span></h1><p>Registra el tiempo y el progreso de tu última partida.</p></div>
    {error && <ErrorMessage message={error} onRetry={() => void loadGames()} />}
    {games.length === 0 ? <div className="empty-state"><h2>Primero añade un videojuego</h2><p>Necesitas tener al menos un videojuego para registrar una sesión.</p><Link className="button button-primary" to="/videojuegos/nuevo">Añadir videojuego</Link></div> :
      <form className="form-card" onSubmit={submit}>
        <label className="field field-wide">Videojuego<select required value={form.videojuego} onChange={(event) => setForm({ ...form, videojuego: event.target.value })}>{games.map((game) => <option key={game._id} value={game._id}>{game.nombre} · {game.plataforma}</option>)}</select></label>
        <label className="field">Fecha de sesión<input type="date" required value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} /></label>
        <label className="field">Duración (minutos)<input type="number" min="1" step="1" required value={form.duracionMinutos} onChange={(event) => setForm({ ...form, duracionMinutos: Number(event.target.value) })} /></label>
        <label className="field field-wide">Porcentaje de avance <span className="range-value">{form.porcentajeAvance}%</span><input type="range" min="0" max="100" value={form.porcentajeAvance} onChange={(event) => setForm({ ...form, porcentajeAvance: Number(event.target.value) })} /><span className="range-labels"><small>0% · INICIO</small><small>100% · COMPLETADO</small></span></label>
        <label className="field field-wide">Notas <small>OPCIONAL</small><textarea rows={4} maxLength={500} value={form.notas} placeholder="¿Qué lograste en esta sesión?" onChange={(event) => setForm({ ...form, notas: event.target.value })} /></label>
        <div className="form-actions"><Link className="button button-ghost" to="/partidas">Cancelar</Link><button className="button button-primary" type="submit">Guardar sesión</button></div>
      </form>}
  </section>;
}
