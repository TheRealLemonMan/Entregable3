import { Resumen, Videojuego, VideojuegoInput, Partida } from "../types";
import { request } from "./apiClient";

export interface FiltrosVideojuegos {
  plataforma?: string;
  genero?: string;
  estado?: string;
}

export async function getVideojuegos(filtros: FiltrosVideojuegos = {}): Promise<Videojuego[]> {
  const query = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.size ? `?${query.toString()}` : "";
  const response = await request<Videojuego[] | { data: Videojuego[] }>(`/videojuegos${suffix}`);
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response.data;
  }
  throw new Error("La API devolvió un formato inesperado al cargar los videojuegos.");
}

export async function getVideojuegoById(id: string): Promise<Videojuego> {
  return request(`/videojuegos/${id}`);
}

export async function createVideojuego(data: VideojuegoInput): Promise<Videojuego> {
  return request("/videojuegos", { method: "POST", body: JSON.stringify(data) });
}

export async function updateVideojuego(id: string, data: VideojuegoInput): Promise<Videojuego> {
  return request(`/videojuegos/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteVideojuego(id: string): Promise<void> {
  return request(`/videojuegos/${id}`, { method: "DELETE" });
}

export async function toggleLogro(id: string, logroId: string, obtenido: boolean): Promise<Videojuego> {
  return request(`/videojuegos/${id}/logros/${logroId}`, {
    method: "PATCH",
    body: JSON.stringify({ obtenido }),
  });
}

export async function getResumenVideojuego(id: string): Promise<Resumen> {
  return request(`/videojuegos/${id}/resumen`);
}

export async function getPartidasByVideojuego(id: string): Promise<Partida[]> {
  return request(`/videojuegos/${id}/partidas`);
}
