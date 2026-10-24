import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";
import { requestId } from "./middlewares/requestId";
import partidasRoutes from "./routes/partidas.routes";
import videojuegosRoutes from "./routes/videojuegos.routes";

const app = express();

app.use(requestId);
app.use(logger);
app.use(cors({
  exposedHeaders: ["X-Request-Id"],
  origin(origin, callback) {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || env.clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origen CORS no permitido: ${origin}`));
  },
}));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/videojuegos", videojuegosRoutes);
app.use("/api/partidas", partidasRoutes);
app.use(errorHandler);

export default app;
