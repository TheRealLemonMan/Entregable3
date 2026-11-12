import { Types } from "mongoose";
import { Request } from "express";
import { BadRequestError } from "../services/badRequestError";

export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`El parámetro ${name} no tiene un formato válido.`);
  }

  // Ticket T-11 (P-02): Validación anticipada de ObjectId para evitar delegar el rechazo a CastError de Mongoose
  if (name === "id" || name === "videojuegoId" || name.toLowerCase().endsWith("id")) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestError(
        `El identificador proporcionado (${name}) no tiene un formato válido.`,
      );
    }
  }

  return value.trim();
}

export function requestBody<T extends object>(req: Request): T {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new BadRequestError("El cuerpo de la solicitud debe ser un objeto JSON.");
  }
  return req.body as T;
}
