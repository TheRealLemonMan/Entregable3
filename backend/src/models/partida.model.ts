import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface Partida {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartidaDocument = HydratedDocument<Partida>;

const partidaSchema = new Schema<Partida>(
  {
    videojuego: { type: Schema.Types.ObjectId, ref: "Videojuego", required: true },
    fecha: { type: Date, required: true },
    duracionMinutos: { type: Number, required: true, min: 1 },
    porcentajeAvance: { type: Number, required: true, min: 0, max: 100 },
    notas: { type: String, trim: true },
  },
  { timestamps: true },
);

export const PartidaModel = model<Partida>("Partida", partidaSchema, "partidas");