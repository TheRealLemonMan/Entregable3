import { Types } from "mongoose";
import { MetaModel } from "../models/meta.model";
import { VideojuegoModel } from "../models/videojuego.model";
import { MetaInput } from "../types/domain";
import { BadRequestError } from "./badRequestError";
import { ConflictError, NotFoundError } from "./errors";

export async function crearMeta(datos: MetaInput) {
  if (!datos.videojuego || typeof datos.videojuego !== "string" || !datos.videojuego.trim()) {
    throw new BadRequestError("El videojuego es obligatorio.");
  }

  const videojuego = await VideojuegoModel.findById(datos.videojuego);
  if (!videojuego) {
    throw new NotFoundError("El videojuego de referencia no existe.");
  }

  if (videojuego.estado === "completado" || videojuego.estado === "abandonado") {
    throw new BadRequestError(
      "Un videojuego completado o abandonado no puede tener una meta activa.",
    );
  }

  const activa = datos.activa !== false;

  if (activa) {
    const metaActivaExistente = await MetaModel.findOne({
      videojuego: new Types.ObjectId(datos.videojuego),
      activa: true,
    });
    if (metaActivaExistente) {
      throw new ConflictError(
        "Ya existe una meta activa para este videojuego. Desactívala antes de registrar otra.",
      );
    }
  }

  return MetaModel.create({
    ...datos,
    videojuego: new Types.ObjectId(datos.videojuego),
    activa,
  });
}

export async function obtenerMetaPorId(id: string) {
  const meta = await MetaModel.findById(id);
  if (!meta) {
    throw new NotFoundError("Meta no encontrada.");
  }
  return meta;
}

export async function listarMetasPorVideojuego(videojuegoId: string) {
  const videojuego = await VideojuegoModel.findById(videojuegoId).select("_id");
  if (!videojuego) {
    throw new NotFoundError("El videojuego no existe.");
  }
  return MetaModel.find({ videojuego: new Types.ObjectId(videojuegoId) }).sort({ createdAt: -1 });
}

export async function obtenerMetaActivaVideojuego(videojuegoId: string) {
  return MetaModel.findOne({
    videojuego: new Types.ObjectId(videojuegoId),
    activa: true,
  });
}

export async function actualizarMeta(id: string, datos: Partial<MetaInput>) {
  const metaExistente = await MetaModel.findById(id);
  if (!metaExistente) {
    throw new NotFoundError("Meta no encontrada.");
  }

  const videojuegoId = datos.videojuego ? datos.videojuego : metaExistente.videojuego.toString();
  const videojuego = await VideojuegoModel.findById(videojuegoId);
  if (!videojuego) {
    throw new NotFoundError("El videojuego de referencia no existe.");
  }

  const pasaraAActiva = datos.activa !== undefined ? datos.activa : metaExistente.activa;

  if (pasaraAActiva && (videojuego.estado === "completado" || videojuego.estado === "abandonado")) {
    throw new BadRequestError(
      "Un videojuego completado o abandonado no puede tener una meta activa.",
    );
  }

  if (pasaraAActiva && !metaExistente.activa) {
    const otraActiva = await MetaModel.findOne({
      _id: { $ne: metaExistente._id },
      videojuego: new Types.ObjectId(videojuegoId),
      activa: true,
    });
    if (otraActiva) {
      throw new ConflictError("Ya existe otra meta activa para este videojuego.");
    }
  }

  const actualizacion: Record<string, unknown> = {};
  if (datos.horasSemanaDeseadas !== undefined)
    actualizacion.horasSemanaDeseadas = datos.horasSemanaDeseadas;
  if (datos.diasSemanaDeseados !== undefined)
    actualizacion.diasSemanaDeseados = datos.diasSemanaDeseados;
  if (datos.hitos !== undefined) actualizacion.hitos = datos.hitos;
  if (datos.activa !== undefined) actualizacion.activa = datos.activa;

  const metaActualizada = await MetaModel.findByIdAndUpdate(id, actualizacion, {
    new: true,
    runValidators: true,
  });

  if (!metaActualizada) {
    throw new NotFoundError("Meta no encontrada.");
  }

  return metaActualizada;
}

export async function desactivarMeta(id: string) {
  const meta = await MetaModel.findByIdAndUpdate(
    id,
    { activa: false },
    { new: true, runValidators: true },
  );
  if (!meta) {
    throw new NotFoundError("Meta no encontrada.");
  }
  return meta;
}
