import { Types } from "mongoose";
import { PartidaModel } from "../models/partida.model";
import { VideojuegoModel } from "../models/videojuego.model";
import { PartidaInput } from "../types/domain";
import { BadRequestError } from "./badRequestError";
import { NotFoundError } from "./errors";

export async function listarPartidas() {
  return PartidaModel.find().populate("videojuego").sort({ fecha: -1, createdAt: -1, _id: -1 });
}

export async function crearPartida(datos: PartidaInput) {
  if (typeof datos.videojuego !== "string" || !datos.videojuego.trim()) {
    throw new BadRequestError("El videojuego es obligatorio.");
  }
  const videojuego = await VideojuegoModel.findById(datos.videojuego).select("_id");
  if (!videojuego) throw new NotFoundError("El videojuego de referencia no existe.");
  return PartidaModel.create({
    ...datos,
    videojuego: new Types.ObjectId(datos.videojuego),
  });
}

export async function eliminarPartida(id: string) {
  const partida = await PartidaModel.findByIdAndDelete(id);
  if (!partida) throw new NotFoundError("Partida no encontrada.");
}
