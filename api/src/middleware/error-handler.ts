import type { Context, Next } from "hono";
import { AppError } from "../lib/errors";
import { ZodError } from "zod";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json({ error: err.message }, err.statusCode as any);
    }
    if (err instanceof ZodError) {
      return c.json(
        { error: "Validation error", details: err.errors },
        400
      );
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
}
