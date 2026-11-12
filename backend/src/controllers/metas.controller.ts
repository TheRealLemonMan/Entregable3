import { Request, Response } from "express";
import { requestBody, routeParam } from "./routeParam";
import {
  actualizarMeta,
  crearMeta,
  desactivarMeta,
  listarMetasPorVideojuego,
  obtenerMetaPorId,
} from "../services/metas.service";
import { MetaInput } from "../types/domain";

export async function postMeta(req: Request, res: Response): Promise<void> {
  const datos = requestBody<MetaInput>(req);
  const nuevaMeta = await crearMeta(datos);
  res.status(201).json(nuevaMeta);
}

export async function getMeta(req: Request, res: Response): Promise<void> {
  const meta = await obtenerMetaPorId(routeParam(req, "id"));
  res.json(meta);
}

export async function getMetasPorVideojuego(req: Request, res: Response): Promise<void> {
  const videojuegoId = routeParam(req, "videojuegoId");
  const metas = await listarMetasPorVideojuego(videojuegoId);
  res.json(metas);
}

export async function putMeta(req: Request, res: Response): Promise<void> {
  const id = routeParam(req, "id");
  const datos = requestBody<Partial<MetaInput>>(req);
  const actualizada = await actualizarMeta(id, datos);
  res.json(actualizada);
}

export async function patchDesactivarMeta(req: Request, res: Response): Promise<void> {
  const id = routeParam(req, "id");
  const desactivada = await desactivarMeta(id);
  res.json(desactivada);
}
