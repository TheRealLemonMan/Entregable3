import { NextFunction, Request, Response } from "express";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const inicio = Date.now();
  res.on("finish", () => {
    console.info(
      `[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`,
    );
  });
  next();
}
