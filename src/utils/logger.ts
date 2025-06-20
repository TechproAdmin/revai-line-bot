import type { NextApiRequest, NextApiResponse } from "next";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  duration?: number;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  statusCode?: number;
  responseSize?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";

  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      logEntry.context = context;
    }

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
      };
    }

    return logEntry;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    const logEntry = this.formatLog(level, message, context, error);

    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      const colorMap = {
        debug: "\x1b[36m", // cyan
        info: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
      };
      const resetColor = "\x1b[0m";

      console.log(
        `${colorMap[level]}[${level.toUpperCase()}]${resetColor} ${logEntry.timestamp} - ${message}`,
        context ? `\nContext: ${JSON.stringify(context, null, 2)}` : "",
        error
          ? `\nError: ${error.message}${error.stack ? `\n${error.stack}` : ""}`
          : "",
      );
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }

  apiStart(action: string, req: NextApiRequest, context?: Omit<LogContext, "action">): LogContext {
    const requestContext: LogContext = {
      ...context,
      action,
      requestId: this.generateRequestId(),
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      ip: this.getClientIP(req),
    };

    this.info(`API ${action} started`, requestContext);
    return requestContext;
  }

  apiEnd(action: string, context: LogContext, res: NextApiResponse, startTime?: number): void {
    const endContext = { ...context };
    if (startTime) {
      endContext.duration = Date.now() - startTime;
    }
    endContext.statusCode = res.statusCode;

    this.info(`API ${action} completed`, endContext);
  }

  apiError(action: string, context: LogContext, error: Error): void {
    this.error(`API ${action} failed`, context, error);
  }

  logRequest(req: NextApiRequest, context: LogContext): void {
    const sanitizedBody = this.sanitizeRequestBody(req.body);
    this.debug("Request details", {
      ...context,
      headers: this.sanitizeHeaders(req.headers),
      query: req.query,
      body: sanitizedBody,
    });
  }

  logResponse(res: NextApiResponse, context: LogContext, data?: unknown): void {
    const responseData = this.sanitizeResponseData(data);
    this.debug("Response details", {
      ...context,
      statusCode: res.statusCode,
      data: responseData,
    });
  }

  private getClientIP(req: NextApiRequest): string {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
      : req.socket?.remoteAddress || 'unknown';
    return ip;
  }

  private sanitizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, unknown> {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized["x-api-key"];
    
    return sanitized;
  }

  private sanitizeRequestBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized = { ...body as Record<string, unknown> };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    
    return sanitized;
  }

  private sanitizeResponseData(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data as Record<string, unknown> };
    
    // Remove sensitive response fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    
    // Truncate large data objects for logging
    const stringified = JSON.stringify(sanitized);
    if (stringified.length > 2000) {
      return { 
        ...sanitized, 
        _truncated: true, 
        _originalSize: stringified.length 
      };
    }
    
    return sanitized;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const logger = new Logger();
export type { LogContext };
