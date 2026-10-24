import app from "./app";
import { conectarDB } from "./config/conexionDB";
import { env } from "./config/env";

async function iniciarServidor(): Promise<void> {
  await conectarDB();
  app.listen(env.port, () => {
    console.info(`API escuchando en http://localhost:${env.port}`);
  });
}

iniciarServidor().catch((error: unknown) => {
  console.error("No fue posible iniciar el servidor:", error);
  process.exitCode = 1;
});
