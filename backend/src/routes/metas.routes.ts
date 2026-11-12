import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getMeta, patchDesactivarMeta, postMeta, putMeta } from "../controllers/metas.controller";

const router = Router();

router.post("/", asyncHandler(postMeta));
router.get("/:id", asyncHandler(getMeta));
router.put("/:id", asyncHandler(putMeta));
router.patch("/:id/desactivar", asyncHandler(patchDesactivarMeta));

export default router;
