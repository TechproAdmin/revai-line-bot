type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  duration?: number;
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
  private isProduction = process.env.APP_ENV === "production";

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

  apiStart(action: string, context?: Omit<LogContext, "action">): LogContext {
    const requestContext: LogContext = {
      ...context,
      action,
      requestId: this.generateRequestId(),
    };

    this.info(`API ${action} started`, requestContext);
    return requestContext;
  }

  apiEnd(action: string, context: LogContext, startTime?: number): void {
    const endContext = { ...context };
    if (startTime) {
      endContext.duration = Date.now() - startTime;
    }

    this.info(`API ${action} completed`, endContext);
  }

  apiError(action: string, context: LogContext, error: Error): void {
    this.error(`API ${action} failed`, context, error);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const logger = new Logger();
export type { LogContext };
