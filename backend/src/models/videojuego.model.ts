import { HydratedDocument, model, Schema } from "mongoose";
import { EstadoVideojuego, Genero, Plataforma } from "../types/domain";

export interface Logro {
  _id: Schema.Types.ObjectId;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  nombre: string;
  portadaUrl?: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: Logro[];
  createdAt: Date;
  updatedAt: Date;
}

export type VideojuegoDocument = HydratedDocument<Videojuego>;

const logroSchema = new Schema<Logro>(
  {
    nombre: { type: String, required: true, trim: true },
    obtenido: { type: Boolean, default: false },
  },
  { _id: true },
);

const videojuegoSchema = new Schema<Videojuego>(
  {
    nombre: { type: String, required: true, trim: true },
    portadaUrl: { type: String, trim: true, default: "" },
    plataforma: { type: String, enum: ["PC", "PlayStation", "Xbox", "Switch", "Movil"], required: true },
    genero: { type: String, enum: ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"], required: true },
    estado: { type: String, enum: ["jugando", "pausado", "completado", "abandonado"], required: true },
    logros: { type: [logroSchema], default: [] },
  },
  { timestamps: true },
);

export const VideojuegoModel = model<Videojuego>("Videojuego", videojuegoSchema, "videojuegos");