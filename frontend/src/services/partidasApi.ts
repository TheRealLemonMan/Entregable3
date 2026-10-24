import { Partida, PartidaInput } from "../types";
import { request } from "./apiClient";

export async function getPartidas(): Promise<Partida[]> {
  return request("/partidas");
}

export async function createPartida(data: PartidaInput): Promise<Partida> {
  return request("/partidas", { method: "POST", body: JSON.stringify(data) });
}

export async function deletePartida(id: string): Promise<void> {
  return request(`/partidas/${id}`, { method: "DELETE" });
}
