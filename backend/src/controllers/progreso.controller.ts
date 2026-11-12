import { Request, Response } from "express";
import { routeParam } from "./routeParam";
import { obtenerProgresoSemanalVideojuego } from "../services/progreso.service";

export async function getProgresoSemanal(req: Request, res: Response): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  const videojuegoId = routeParam(req, "id");
  const progreso = await obtenerProgresoSemanalVideojuego(videojuegoId);
  res.json(progreso);
}
