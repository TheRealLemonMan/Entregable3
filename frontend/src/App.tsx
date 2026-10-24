import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { GameDetailPage } from "./pages/GameDetailPage";
import { GameFormPage } from "./pages/GameFormPage";
import { GamesPage } from "./pages/GamesPage";
import { NewPartidaPage } from "./pages/NewPartidaPage";
import { PartidasPage } from "./pages/PartidasPage";

export default function App() {
  return <BrowserRouter><Routes><Route element={<Layout />}>
    <Route index element={<GamesPage />} />
    <Route path="videojuegos/nuevo" element={<GameFormPage />} />
    <Route path="videojuegos/:id" element={<GameDetailPage />} />
    <Route path="videojuegos/:id/editar" element={<GameFormPage />} />
    <Route path="partidas" element={<PartidasPage />} />
    <Route path="partidas/nueva" element={<NewPartidaPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></BrowserRouter>;
}
