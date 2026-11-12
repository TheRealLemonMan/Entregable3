import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  deleteVideojuego,
  getPartidasVideojuego,
  getResumenVideojuego,
  getVideojuego,
  getVideojuegos,
  patchLogro,
  postVideojuego,
  putVideojuego,
} from "../controllers/videojuegos.controller";
import { getProgresoSemanal } from "../controllers/progreso.controller";
import { getMetasPorVideojuego } from "../controllers/metas.controller";

const router = Router();
router.get("/", asyncHandler(getVideojuegos));
router.post("/", asyncHandler(postVideojuego));
router.get("/:id/partidas", asyncHandler(getPartidasVideojuego));
router.get("/:id/resumen", asyncHandler(getResumenVideojuego));
router.get("/:id/progreso-semanal", asyncHandler(getProgresoSemanal));
router.get("/:videojuegoId/metas", asyncHandler(getMetasPorVideojuego));
router.patch("/:id/logros/:logroId", asyncHandler(patchLogro));
router.get("/:id", asyncHandler(getVideojuego));
router.put("/:id", asyncHandler(putVideojuego));
router.delete("/:id", asyncHandler(deleteVideojuego));

export default router;
