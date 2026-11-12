import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface Hito {
  _id?: Types.ObjectId;
  nombre: string;
  horasRequeridas: number;
}

export interface Meta {
  videojuego: Types.ObjectId;
  horasSemanaDeseadas: number;
  diasSemanaDeseados: number;
  activa: boolean;
  hitos: Hito[];
  createdAt: Date;
  updatedAt: Date;
}

export type MetaDocument = HydratedDocument<Meta>;

const hitoSchema = new Schema<Hito>(
  {
    nombre: { type: String, required: true, trim: true },
    horasRequeridas: {
      type: Number,
      required: true,
      min: [1, "Las horas requeridas del hito deben ser al menos 1."],
      max: [100, "Las horas requeridas del hito no pueden superar 100."],
    },
  },
  { _id: true },
);

const metaSchema = new Schema<Meta>(
  {
    videojuego: { type: Schema.Types.ObjectId, ref: "Videojuego", required: true },
    horasSemanaDeseadas: {
      type: Number,
      required: true,
      min: [0.1, "Las horas semanales deseadas deben ser mayores a 0."],
      max: [100, "Las horas semanales deseadas no pueden superar 100."],
      validate: {
        validator: (v: number) => v > 0 && v <= 100,
        message: "Las horas semanales deseadas deben ser mayores a 0 y hasta 100.",
      },
    },
    diasSemanaDeseados: {
      type: Number,
      required: true,
      min: [1, "Los días semanales deseados deben ser entre 1 y 7."],
      max: [7, "Los días semanales deseados deben ser entre 1 y 7."],
      validate: {
        validator: Number.isInteger,
        message: "Los días semanales deseados deben ser un número entero.",
      },
    },
    activa: { type: Boolean, default: true },
    hitos: {
      type: [hitoSchema],
      default: [],
      validate: [
        {
          validator: (val: Hito[]) => val.length <= 5,
          message: "Una meta no puede tener más de 5 hitos.",
        },
        {
          validator: (val: Hito[]) => {
            const horas = val.map((h) => h.horasRequeridas);
            return new Set(horas).size === horas.length;
          },
          message: "Cada hito debe tener un objetivo de horas único.",
        },
      ],
    },
  },
  { timestamps: true },
);

// Índice único parcial: solo una meta activa por videojuego
metaSchema.index(
  { videojuego: 1, activa: 1 },
  { unique: true, partialFilterExpression: { activa: true } },
);

export const MetaModel = model<Meta>("Meta", metaSchema, "metas");
