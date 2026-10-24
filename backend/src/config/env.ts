import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un número entero entre 1 y 65535.");
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("La variable MONGODB_URI es obligatoria.");
}

export const env = {
  port,
  mongoUri,
  clientOrigins: (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
