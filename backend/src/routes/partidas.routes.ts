import { Router } from "express";
import { deletePartida, getPartidas, postPartida } from "../controllers/partidas.controller";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();
router.get("/", asyncHandler(getPartidas));
router.post("/", asyncHandler(postPartida));
router.delete("/:id", asyncHandler(deletePartida));

export default router;
