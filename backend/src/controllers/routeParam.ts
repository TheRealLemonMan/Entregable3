import { Request } from "express";
import { BadRequestError } from "../services/badRequestError";

export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string") {
    throw new BadRequestError(`El parámetro ${name} no tiene un formato válido.`);
  }
  return value;
}

export function requestBody<T extends object>(req: Request): T {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new BadRequestError("El cuerpo de la solicitud debe ser un objeto JSON.");
  }
  return req.body as T;
}
