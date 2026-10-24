import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Empty, ErrorMessage, Loading } from "../components/Feedback";
import { GameCover } from "../components/GameCover";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { deleteVideojuego, getVideojuegos } from "../services/videojuegosApi";
import { estados, generos, plataformas, Videojuego } from "../types";

export function GamesPage() {
  const [games, setGames] = useState<Videojuego[]>([]);
  const [filters, setFilters] = useState({ plataforma: "", genero: "", estado: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameToDelete, setGameToDelete] = useState<Videojuego | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setGames(await getVideojuegos(filters));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible cargar la biblioteca.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void loadGames(); }, [loadGames]);

  async function removeGame() {
    if (!gameToDelete) return;
    try {
      await deleteVideojuego(gameToDelete._id);
      await loadGames();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible eliminar el videojuego.");
    } finally {
      setGameToDelete(null);
    }
  }

  return (
    <>
      <section className="page-heading">
        <div><span className="eyebrow">TU COLECCIÓN</span><h1>Biblioteca <span className="title-dot">.</span></h1><p>Tu aventura, tus reglas. Lleva el registro de cada mundo que exploras.</p></div>
        <Link className="button button-primary" to="/videojuegos/nuevo"><span aria-hidden="true">＋</span> Añadir videojuego</Link>
      </section>
      <section className="filter-bar" aria-label="Filtros de videojuegos">
        <span className="filter-label">FILTRAR</span>
        <FilterSelect label="Plataforma" value={filters.plataforma} options={plataformas} onChange={(value) => setFilters({ ...filters, plataforma: value })} />
        <FilterSelect label="Género" value={filters.genero} options={generos} onChange={(value) => setFilters({ ...filters, genero: value })} />
        <FilterSelect label="Estado" value={filters.estado} options={estados} onChange={(value) => setFilters({ ...filters, estado: value })} />
        <span className="filter-count">{games.length} JUEGOS</span>
      </section>
      {loading ? <Loading message="Cargando tu biblioteca..." variant="library" /> : error ? <ErrorMessage message={error} onRetry={() => void loadGames()} /> :
        games.length === 0 ? <Empty title="Todavía no hay juegos" detail="Añade tu primer videojuego o cambia los filtros para empezar." /> :
          <section className="game-grid" aria-label="Videojuegos" key={`${filters.plataforma}-${filters.genero}-${filters.estado}`}>
            {games.map((game, index) => (
              <article className="game-card" key={game._id} style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}>
                <div className={`game-art art-${index % 5}`}><GameCover url={game.portadaUrl} className="cover-image" fallbackClassName="art-symbol" symbol={["◈", "✦", "△", "⬡", "◎"][index % 5]} alt={`Portada de ${game.nombre}`} /><span className={`status-pill status-${game.estado}`}>{game.estado}</span></div>
                <div className="game-card-body">
                  <div className="game-meta">{game.plataforma.toUpperCase()} <span>·</span> {game.genero.toUpperCase()}</div>
                  <h2><Link to={`/videojuegos/${game._id}`}>{game.nombre}</Link></h2>
                  <div className="card-bottom"><span>{game.logros.length} LOGROS</span><div className="card-actions"><Link aria-label={`Editar ${game.nombre}`} to={`/videojuegos/${game._id}/editar`}>Editar</Link><button onClick={() => setGameToDelete(game)} aria-label={`Eliminar ${game.nombre}`}>Eliminar</button></div></div>
                </div>
              </article>
            ))}
          </section>}
      <ConfirmDialog open={Boolean(gameToDelete)} title={`¿Eliminar “${gameToDelete?.nombre ?? ""}”?`} description="El videojuego y todas sus sesiones asociadas se eliminarán permanentemente." confirmLabel="Eliminar videojuego" onConfirm={removeGame} onCancel={() => setGameToDelete(null)} />
    </>
  );
}

function FilterSelect<T extends string>({ label, value, options, onChange }: { label: string; value: string; options: readonly T[]; onChange: (value: T | "") => void }) {
  return <label className="filter-select"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as T | "")}><option value="">Todos</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select></label>;
}
