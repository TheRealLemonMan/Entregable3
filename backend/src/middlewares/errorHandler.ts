import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { BadRequestError } from "../services/badRequestError";
import { NotFoundError } from "../services/errors";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof BadRequestError) {
    res.status(400).json({ error: error.message, requestId: req.requestId });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: "Error de validación.", details: error.message, requestId: req.requestId });
    return;
  }
  if (error instanceof mongoose.Error.CastError && error.path === "_id") {
    res.status(400).json({ error: "El ID proporcionado no tiene un formato válido.", requestId: req.requestId });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message, requestId: req.requestId });
    return;
  }

  console.error(`[${req.requestId}] Error inesperado:`, error);
  res.status(500).json({ error: "Error interno del servidor.", requestId: req.requestId });
};
