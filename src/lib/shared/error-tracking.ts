// src/lib/shared/error-tracking.ts
// Centralized error capture. Currently routes to structured logger.
// To wire Sentry: uncomment the Sentry lines and install the SDK.
// Callers never change — only this file changes.

import { logger } from "./logger";

const log = logger.child("error-tracking");

export function captureError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const normalized = normalizeError(error);
  log.error(normalized.message, {
    ...context,
    errorName: normalized.name,
    stack:     normalized.stack,
  });
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: "warning" | "error",
  context?: Record<string, unknown>,
): void {
  if (level === "warning") {
    log.warn(message, context);
  } else {
    log.error(message, context);
  }
  // Sentry.captureMessage(message, level);
}

interface NormalizedError {
  message: string;
  name:    string;
  stack?:  string;
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack };
  }
  if (typeof error === "string") {
    return { message: error, name: "StringError" };
  }
  return { message: String(error), name: "UnknownError" };
}
