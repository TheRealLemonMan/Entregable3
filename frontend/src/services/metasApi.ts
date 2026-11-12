import { Meta, MetaInput, ProgresoSemanal } from "../types";
import { request } from "./apiClient";

export async function getProgresoSemanal(videojuegoId: string): Promise<ProgresoSemanal> {
  return request(`/videojuegos/${videojuegoId}/progreso-semanal`);
}

export async function getMetasPorVideojuego(videojuegoId: string): Promise<Meta[]> {
  return request(`/videojuegos/${videojuegoId}/metas`);
}

export async function createMeta(data: MetaInput): Promise<Meta> {
  return request("/metas", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMeta(id: string, data: Partial<MetaInput>): Promise<Meta> {
  return request(`/metas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function desactivarMeta(id: string): Promise<Meta> {
  return request(`/metas/${id}/desactivar`, {
    method: "PATCH",
  });
}
