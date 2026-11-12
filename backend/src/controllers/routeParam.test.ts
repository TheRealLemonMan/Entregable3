import { describe, expect, it } from "vitest";
import { routeParam } from "./routeParam";
import { BadRequestError } from "../services/badRequestError";
import { Request } from "express";

describe("Validación de parámetros de ruta (Ticket T-11 / P-02)", () => {
  it("permite un ObjectId válido de 24 caracteres hexadecimales", () => {
    const validObjectId = "507f1f77bcf86cd799439011";
    const req = {
      params: { id: validObjectId },
    } as unknown as Request;

    expect(routeParam(req, "id")).toBe(validObjectId);
  });

  it("lanza BadRequestError (400) si el parámetro 'id' es un string malformado", () => {
    const req = {
      params: { id: "id-invalido-123" },
    } as unknown as Request;

    expect(() => routeParam(req, "id")).toThrowError(BadRequestError);
    expect(() => routeParam(req, "id")).toThrowError("no tiene un formato válido");
  });

  it("lanza BadRequestError (400) si el parámetro 'videojuegoId' no es un ObjectId válido", () => {
    const req = {
      params: { videojuegoId: "abc" },
    } as unknown as Request;

    expect(() => routeParam(req, "videojuegoId")).toThrowError(BadRequestError);
  });

  it("lanza BadRequestError (400) si el parámetro está vacío o no es string", () => {
    const req = {
      params: { id: "   " },
    } as unknown as Request;

    expect(() => routeParam(req, "id")).toThrowError(BadRequestError);
  });
});
