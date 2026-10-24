import { Request, Response } from "express";
import { crearPartida, eliminarPartida, listarPartidas } from "../services/partidas.service";
import { PartidaInput } from "../types/domain";
import { requestBody, routeParam } from "./routeParam";

export async function getPartidas(_req: Request, res: Response): Promise<void> {
  res.json(await listarPartidas());
}

export async function postPartida(req: Request, res: Response): Promise<void> {
  res.status(201).json(await crearPartida(requestBody<PartidaInput>(req)));
}

export async function deletePartida(req: Request, res: Response): Promise<void> {
  await eliminarPartida(routeParam(req, "id"));
  res.status(204).send();
}
