import { Request, Response } from "express";
import {
  actualizarLogro,
  actualizarVideojuego,
  crearVideojuego,
  eliminarVideojuego,
  listarPartidasVideojuego,
  listarVideojuegos,
  obtenerResumenVideojuego,
  obtenerVideojuego,
} from "../services/videojuegos.service";
import { EstadoVideojuego, Genero, Plataforma, VideojuegoInput } from "../types/domain";
import { BadRequestError } from "../services/badRequestError";
import { requestBody, routeParam } from "./routeParam";

function filtroEnum<T extends string>(
  req: Request,
  nombre: string,
  valores: readonly T[],
): T | undefined {
  const valor = req.query[nombre];
  if (valor === undefined) return undefined;
  if (typeof valor !== "string") {
    throw new BadRequestError(`El filtro ${nombre} debe tener un único valor.`);
  }

  const normalizado = valor.trim();
  if (!normalizado) return undefined;
  if (!valores.includes(normalizado as T)) {
    throw new BadRequestError(`El filtro ${nombre} no tiene un valor válido.`);
  }
  return normalizado as T;
}

export async function getVideojuegos(req: Request, res: Response): Promise<void> {
  const filtro = {
    plataforma: filtroEnum(req, "plataforma", ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const) as Plataforma | undefined,
    genero: filtroEnum(req, "genero", ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const) as Genero | undefined,
    estado: filtroEnum(req, "estado", ["jugando", "pausado", "completado", "abandonado"] as const) as EstadoVideojuego | undefined,
  };
  res.json(await listarVideojuegos(filtro));
}

export async function getVideojuego(req: Request, res: Response): Promise<void> {
  res.json(await obtenerVideojuego(routeParam(req, "id")));
}

export async function postVideojuego(req: Request, res: Response): Promise<void> {
  res.status(201).json(await crearVideojuego(requestBody<VideojuegoInput>(req)));
}

export async function putVideojuego(req: Request, res: Response): Promise<void> {
  res.json(await actualizarVideojuego(routeParam(req, "id"), requestBody<Partial<VideojuegoInput>>(req)));
}

export async function deleteVideojuego(req: Request, res: Response): Promise<void> {
  await eliminarVideojuego(routeParam(req, "id"));
  res.status(204).send();
}

export async function patchLogro(req: Request, res: Response): Promise<void> {
  const { obtenido } = requestBody<{ obtenido?: unknown }>(req);
  if (obtenido !== undefined && typeof obtenido !== "boolean") {
    res.status(400).json({ error: "obtenido debe ser un valor booleano.", requestId: req.requestId });
    return;
  }
  res.json(await actualizarLogro(routeParam(req, "id"), routeParam(req, "logroId"), obtenido as boolean | undefined));
}

export async function getPartidasVideojuego(req: Request, res: Response): Promise<void> {
  res.json(await listarPartidasVideojuego(routeParam(req, "id")));
}

export async function getResumenVideojuego(req: Request, res: Response): Promise<void> {
  res.json(await obtenerResumenVideojuego(routeParam(req, "id")));
}
