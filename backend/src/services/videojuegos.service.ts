import { Types } from "mongoose";
import { PartidaModel } from "../models/partida.model";
import { VideojuegoModel } from "../models/videojuego.model";
import { EstadoVideojuego, Genero, Plataforma, ResumenVideojuego, VideojuegoInput } from "../types/domain";
import { NotFoundError } from "./errors";

export interface FiltroVideojuegos {
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
}

export async function listarVideojuegos(filtro: FiltroVideojuegos) {
  const query: FiltroVideojuegos = {};
  if (filtro.plataforma) query.plataforma = filtro.plataforma;
  if (filtro.genero) query.genero = filtro.genero;
  if (filtro.estado) query.estado = filtro.estado;
  return VideojuegoModel.find(query).sort({ nombre: 1 }).exec();
}

export async function obtenerVideojuego(id: string) {
  const videojuego = await VideojuegoModel.findById(id);
  if (!videojuego) throw new NotFoundError("Videojuego no encontrado.");
  return videojuego;
}

export async function crearVideojuego(datos: VideojuegoInput) {
  return VideojuegoModel.create(datos);
}

export async function actualizarVideojuego(id: string, datos: Partial<VideojuegoInput>) {
  const videojuego = await VideojuegoModel.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
  });
  if (!videojuego) throw new NotFoundError("Videojuego no encontrado.");
  return videojuego;
}

export async function eliminarVideojuego(id: string) {
  const videojuego = await VideojuegoModel.findByIdAndDelete(id);
  if (!videojuego) throw new NotFoundError("Videojuego no encontrado.");
  await PartidaModel.deleteMany({ videojuego: videojuego._id });
}

export async function actualizarLogro(id: string, logroId: string, obtenido?: boolean) {
  const videojuego = await obtenerVideojuego(id);
  const logro = videojuego.logros.find((item) => item._id.toString() === logroId);
  if (!logro) throw new NotFoundError("Logro no encontrado.");
  logro.obtenido = obtenido ?? !logro.obtenido;
  await videojuego.save();
  return videojuego;
}

export async function listarPartidasVideojuego(id: string) {
  await obtenerVideojuego(id);
  return PartidaModel.find({ videojuego: new Types.ObjectId(id) }).sort({ fecha: -1 });
}

export async function obtenerResumenVideojuego(id: string): Promise<ResumenVideojuego> {
  await obtenerVideojuego(id);
  const partidas = await PartidaModel.find({ videojuego: new Types.ObjectId(id) })
    .select("fecha createdAt duracionMinutos porcentajeAvance")
    .sort({ fecha: -1, createdAt: -1, _id: -1 });
  const minutosTotales = partidas.reduce((total, partida) => total + partida.duracionMinutos, 0);
  const partidaMasReciente = partidas[0];

  return {
    totalPartidas: partidas.length,
    horasTotales: Math.round((minutosTotales / 60) * 10) / 10,
    ultimaPartida: partidaMasReciente ? partidaMasReciente.fecha.toISOString() : null,
    porcentajeAvanceActual: partidaMasReciente?.porcentajeAvance ?? 0,
  };
}
