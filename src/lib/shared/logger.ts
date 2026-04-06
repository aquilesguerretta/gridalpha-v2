// src/lib/shared/logger.ts
// Structured logger — zero external dependencies.
// Server: emits JSON for Vercel log parsing.
// Client: emits formatted lines for DevTools.
// Production: suppresses "debug" level.

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level:      LogLevel;
  message:    string;
  context?:   Record<string, unknown>;
  timestamp:  string;
  module?:    string;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info (message: string, context?: Record<string, unknown>): void;
  warn (message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(module: string): Logger;
}

const PRIORITY: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3,
};

const isServer     = typeof window === "undefined";
const isProd       = import.meta.env.PROD;
const minLevel: LogLevel = isProd ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return PRIORITY[level] >= PRIORITY[minLevel];
}

function emit(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  const fn =
    entry.level === "debug" ? console.debug :
    entry.level === "info"  ? console.info  :
    entry.level === "warn"  ? console.warn  :
    console.error;

  if (isServer) {
    fn(JSON.stringify(entry));
  } else {
    const prefix = entry.module ? `[${entry.module}]` : "";
    const tag    = `[${entry.level.toUpperCase()}]`;
    const parts: unknown[] = [`${entry.timestamp} ${tag}${prefix} ${entry.message}`];
    if (entry.context && Object.keys(entry.context).length > 0) parts.push(entry.context);
    fn(...parts);
  }
}

function createLogger(module?: string): Logger {
  function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    emit({
      level, message, context,
      timestamp: new Date().toISOString(),
      ...(module ? { module } : {}),
    });
  }
  return {
    debug: (msg, ctx) => log("debug", msg, ctx),
    info:  (msg, ctx) => log("info",  msg, ctx),
    warn:  (msg, ctx) => log("warn",  msg, ctx),
    error: (msg, ctx) => log("error", msg, ctx),
    child: (child: string) =>
      createLogger(module ? `${module}:${child}` : child),
  };
}

export const logger: Logger = createLogger();
