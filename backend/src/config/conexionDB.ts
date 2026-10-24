import mongoose from "mongoose";
import { env } from "./env";

export async function conectarDB(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.info("Conexión con MongoDB establecida.");
}
