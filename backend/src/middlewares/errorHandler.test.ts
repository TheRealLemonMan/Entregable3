import { describe, expect, it, vi } from "vitest";
import { errorHandler } from "./errorHandler";
import { ConflictError, NotFoundError } from "../services/errors";
import { BadRequestError } from "../services/badRequestError";
import { Request, Response } from "express";

function createMockReqRes(requestId = "req-test-123") {
  const req = {
    requestId,
  } as unknown as Request;

  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  const next = vi.fn();

  return {
    req,
    res: res as unknown as Response & { statusCode: number; body: unknown },
    next,
  };
}

describe("Middleware errorHandler (Ticket T-12 / P-03)", () => {
  it("captura MongoServerError con code: 11000 y devuelve HTTP status 409 con formato estándar", () => {
    const { req, res, next } = createMockReqRes("req-conflict-11000");

    // Simulación de error de índice único duplicado en MongoDB
    const mongoDuplicateError = {
      name: "MongoServerError",
      code: 11000,
      message:
        "E11000 duplicate key error collection: test.metas index: videojuego_1_activa_1 dup key",
    };

    errorHandler(mongoDuplicateError, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "Ya existe un recurso con los mismos datos únicos en el sistema.",
      error: "Ya existe un recurso con los mismos datos únicos en el sistema.",
      requestId: "req-conflict-11000",
    });
  });

  it("captura ConflictError y devuelve HTTP status 409", () => {
    const { req, res, next } = createMockReqRes("req-conflict-error");
    const conflictError = new ConflictError("Conflicto de negocio: meta activa duplicada.");

    errorHandler(conflictError, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "Conflicto de negocio: meta activa duplicada.",
      error: "Conflicto de negocio: meta activa duplicada.",
      requestId: "req-conflict-error",
    });
  });

  it("captura BadRequestError y devuelve HTTP status 400", () => {
    const { req, res, next } = createMockReqRes("req-bad-request");
    const badRequest = new BadRequestError(
      "El identificador proporcionado no tiene un formato válido.",
    );

    errorHandler(badRequest, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "El identificador proporcionado no tiene un formato válido.",
      error: "El identificador proporcionado no tiene un formato válido.",
      requestId: "req-bad-request",
    });
  });

  it("captura NotFoundError y devuelve HTTP status 404", () => {
    const { req, res, next } = createMockReqRes("req-not-found");
    const notFound = new NotFoundError("Recurso no encontrado.");

    errorHandler(notFound, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: "Recurso no encontrado.",
      error: "Recurso no encontrado.",
      requestId: "req-not-found",
    });
  });
});
