/**
 * ElevenLabs API Logger
 *
 * Captures debug logs and API request/response data for troubleshooting.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogType = 'log' | 'request' | 'response';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  type: LogType;
  message: string;
  data?: unknown;
  // For request/response entries
  method?: string;
  endpoint?: string;
  status?: number;
  duration?: number;
}

// In-memory log store
const logs: LogEntry[] = [];
const MAX_LOGS = 500;
let logIdCounter = 0;

// Subscribers for real-time updates
type LogSubscriber = (logs: LogEntry[]) => void;
const subscribers: Set<LogSubscriber> = new Set();

function notifySubscribers() {
  subscribers.forEach((fn) => fn([...logs]));
}

/**
 * Add a log entry
 */
export function addLog(
  level: LogLevel,
  message: string,
  data?: unknown,
  options?: {
    type?: LogType;
    method?: string;
    endpoint?: string;
    status?: number;
    duration?: number;
  }
): void {
  const entry: LogEntry = {
    id: `log-${++logIdCounter}`,
    timestamp: new Date(),
    level,
    type: options?.type ?? 'log',
    message,
    data,
    method: options?.method,
    endpoint: options?.endpoint,
    status: options?.status,
    duration: options?.duration,
  };

  logs.push(entry);

  // Trim old logs if we exceed max
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS);
  }

  notifySubscribers();
}

/**
 * Log an API request
 */
export function logRequest(
  method: string,
  endpoint: string,
  payload?: unknown
): void {
  addLog('info', `${method} ${endpoint}`, payload, {
    type: 'request',
    method,
    endpoint,
  });
}

/**
 * Log an API response
 */
export function logResponse(
  method: string,
  endpoint: string,
  status: number,
  data?: unknown,
  duration?: number
): void {
  const level = status >= 400 ? 'error' : 'info';
  addLog(level, `${status} ${method} ${endpoint}`, data, {
    type: 'response',
    method,
    endpoint,
    status,
    duration,
  });
}

/**
 * Get all logs
 */
export function getLogs(): LogEntry[] {
  return [...logs];
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.length = 0;
  notifySubscribers();
}

/**
 * Subscribe to log updates
 */
export function subscribeLogs(fn: LogSubscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/**
 * Convenience loggers
 */
export const logger = {
  debug: (message: string, data?: unknown) => addLog('debug', message, data),
  info: (message: string, data?: unknown) => addLog('info', message, data),
  warn: (message: string, data?: unknown) => addLog('warn', message, data),
  error: (message: string, data?: unknown) => addLog('error', message, data),
  request: logRequest,
  response: logResponse,
};

/**
 * Format log entry for display
 */
export function formatLogEntry(entry: LogEntry): string {
  const time = entry.timestamp.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });

  const levelStr = entry.level.toUpperCase().padEnd(5);
  let result = `[${time}] ${levelStr} ${entry.message}`;

  if (entry.duration) {
    result += ` (${entry.duration}ms)`;
  }

  if (entry.data !== undefined) {
    try {
      const dataStr = typeof entry.data === 'string'
        ? entry.data
        : JSON.stringify(entry.data, null, 2);
      result += `\n${dataStr}`;
    } catch {
      result += `\n[Unable to serialize data]`;
    }
  }

  return result;
}
