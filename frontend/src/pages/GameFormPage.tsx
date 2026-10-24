import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorMessage, Loading } from "../components/Feedback";
import { GameCover, isValidExternalImageUrl } from "../components/GameCover";
import { createVideojuego, getVideojuegoById, updateVideojuego } from "../services/videojuegosApi";
import { EstadoVideojuego, estados, Genero, generos, Plataforma, plataformas, VideojuegoInput } from "../types";

export function GameFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState<VideojuegoInput>({ nombre: "", portadaUrl: "", plataforma: "PC", genero: "otro", estado: "jugando", logros: [] });
  const [newAchievement, setNewAchievement] = useState("");
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadGame = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError("");
    try {
      const game = await getVideojuegoById(id);
      setForm({
        nombre: game.nombre, portadaUrl: game.portadaUrl ?? "", plataforma: game.plataforma, genero: game.genero, estado: game.estado,
        logros: game.logros.map(({ nombre, obtenido }) => ({ nombre, obtenido })),
      });
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : "No fue posible cargar el videojuego.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void loadGame();
  }, [id, loadGame]);

  async function saveGame() {
    setSaving(true);
    setSaveError("");
    try {
      if (id) await updateVideojuego(id, form);
      else await createVideojuego(form);
      navigate(id ? `/videojuegos/${id}` : "/");
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "No fue posible guardar el videojuego.");
    } finally {
      setSaving(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveGame();
  }

  if (loading) return <Loading message="Cargando videojuego..." variant="form" />;
  if (loadError) {
    return <section className="form-page">
      <Link className="back-link" to={`/videojuegos/${id}`}>← Volver al videojuego</Link>
      <ErrorMessage message={loadError} onRetry={() => void loadGame()} />
    </section>;
  }
  return (
    <section className="form-page">
      <Link className="back-link" to={id ? `/videojuegos/${id}` : "/"}>← Volver a {id ? "detalle" : "biblioteca"}</Link>
      <div className="form-heading"><span className="eyebrow">TU COLECCIÓN</span><h1>{editing ? "Editar videojuego" : "Nuevo videojuego"}<span className="title-dot">.</span></h1><p>Registra los detalles de tu próxima aventura.</p></div>
      <form className="form-card" onSubmit={submit}>
        {saveError && <div className="field-wide"><ErrorMessage message={saveError} onRetry={() => void saveGame()} /></div>}
        <label className="field field-wide">Nombre del videojuego<input required maxLength={100} value={form.nombre} placeholder="Ej. The Legend of Zelda" onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></label>
        <label className="field field-wide">URL de la portada / imagen<input type="url" value={form.portadaUrl ?? ""} placeholder="https://ejemplo.com/portada.jpg" onChange={(event) => setForm({ ...form, portadaUrl: event.target.value })} /></label>
        {isValidExternalImageUrl(form.portadaUrl) && <div className="cover-preview"><GameCover url={form.portadaUrl} className="cover-image" fallbackClassName="art-symbol" symbol="◈" alt={`Vista previa de portada para ${form.nombre || "el videojuego"}`} /><span>VISTA PREVIA</span></div>}
        <label className="field">Plataforma<select value={form.plataforma} onChange={(event) => setForm({ ...form, plataforma: event.target.value as Plataforma })}>{plataformas.map((option) => <option key={option}>{option}</option>)}</select></label>
        <label className="field">Género<select value={form.genero} onChange={(event) => setForm({ ...form, genero: event.target.value as Genero })}>{generos.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className="field">Estado<select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value as EstadoVideojuego })}>{estados.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <div className="field field-wide">
          <span className="field-label">Logros iniciales <small>OPCIONAL</small></span>
          <div className="achievement-add"><input value={newAchievement} maxLength={100} placeholder="Nombre del logro" onChange={(event) => setNewAchievement(event.target.value)} /><button className="button button-secondary" type="button" disabled={!newAchievement.trim()} onClick={() => { setForm({ ...form, logros: [...form.logros, { nombre: newAchievement.trim(), obtenido: false }] }); setNewAchievement(""); }}>Añadir logro</button></div>
          {form.logros.length > 0 && <ul className="initial-achievements">{form.logros.map((logro, index) => <li key={`${logro.nombre}-${index}`}><span>{logro.nombre}</span><button type="button" aria-label={`Quitar ${logro.nombre}`} onClick={() => setForm({ ...form, logros: form.logros.filter((_, i) => i !== index) })}>×</button></li>)}</ul>}
        </div>
        <div className="form-actions"><Link className="button button-ghost" to={id ? `/videojuegos/${id}` : "/"}>Cancelar</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear videojuego"}</button></div>
      </form>
    </section>
  );
}
