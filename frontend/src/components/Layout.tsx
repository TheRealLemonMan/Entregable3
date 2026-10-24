import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand"><span className="brand-mark">C</span><span>checkpoint<small>DIARIO DE PROGRESO GAMER</small></span></NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/" end>Biblioteca</NavLink>
          <NavLink to="/partidas">Sesiones</NavLink>
        </nav>
        <span className="online-indicator"><i /> TU PROGRESO, A TU RITMO</span>
      </header>
      <main className="main-content"><Outlet /></main>
      <footer className="footer">CHECKPOINT <span>·</span> CADA SESIÓN CUENTA</footer>
    </div>
  );
}
