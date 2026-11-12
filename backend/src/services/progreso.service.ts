import { Types } from "mongoose";
import { calcularProgresoSemana, calcularRachas, evaluarHitos } from "../dominio/progreso";
import { PartidaModel } from "../models/partida.model";
import { MetaModel } from "../models/meta.model";
import { obtenerVideojuego } from "./videojuegos.service";
import { ProgresoSemanalDTO } from "../types/domain";

export async function obtenerProgresoSemanalVideojuego(
  videojuegoId: string,
  fechaReferencia: Date | string = new Date(),
): Promise<ProgresoSemanalDTO> {
  await obtenerVideojuego(videojuegoId);

  const [metaActiva, partidas] = await Promise.all([
    MetaModel.findOne({
      videojuego: new Types.ObjectId(videojuegoId),
      activa: true,
    }),
    PartidaModel.find({ videojuego: new Types.ObjectId(videojuegoId) }).sort({ fecha: 1 }),
  ]);

  const horasMeta = metaActiva?.horasSemanaDeseadas ?? 0;
  const diasMeta = metaActiva?.diasSemanaDeseados ?? 0;

  // 1. Progreso de la semana
  const progresoDominio = calcularProgresoSemana(
    partidas.map((p) => ({ fecha: p.fecha, duracionMinutos: p.duracionMinutos })),
    horasMeta,
    fechaReferencia,
  );

  // 2. Rachas
  const rachasDominio = calcularRachas(
    partidas.map((p) => p.fecha),
    fechaReferencia,
  );

  // 3. Horas totales acumuladas para evaluar hitos
  const minutosTotales = partidas.reduce((acc, p) => acc + p.duracionMinutos, 0);
  const horasTotales = Math.round((minutosTotales / 60) * 10) / 10;

  // 4. Hitos evaluados dinámicamente
  const hitosDominio = metaActiva?.hitos
    ? metaActiva.hitos.map((h) => ({
        nombre: h.nombre,
        horasObjetivo: h.horasRequeridas,
      }))
    : [];

  const hitosEvaluados = evaluarHitos(hitosDominio, horasTotales).map((h) => ({
    nombre: h.nombre,
    horasRequeridas: h.horasObjetivo,
    alcanzado: h.alcanzado,
  }));

  return {
    meta: metaActiva
      ? {
          _id: metaActiva._id.toString(),
          horasSemanaDeseadas: metaActiva.horasSemanaDeseadas,
          diasSemanaDeseados: metaActiva.diasSemanaDeseados,
          activa: metaActiva.activa,
        }
      : null,
    progresoSemanal: {
      horasJugadas: progresoDominio.horasJugadas,
      horasSemanaDeseadas: horasMeta,
      diasJugados: progresoDominio.diasJugados,
      diasSemanaDeseados: diasMeta,
      porcentajeReal: progresoDominio.porcentajeReal,
      porcentajeVisual: progresoDominio.porcentajeVisual,
    },
    rachas: {
      rachaActual: rachasDominio.rachaActual,
      mejorRacha: rachasDominio.mejorRacha,
    },
    hitos: hitosEvaluados,
  };
}
