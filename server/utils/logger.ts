type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogData {
  [key: string]: any
}

function formatLog(level: LogLevel, message: string, data?: LogData) {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data
  }
  return JSON.stringify(logEntry)
}

export const logger = {
  info(message: string, data?: LogData) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(formatLog('info', message, data))
    }
  },

  warn(message: string, data?: LogData) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(formatLog('warn', message, data))
    }
  },

  error(message: string, error?: any, data?: LogData) {
    if (process.env.NODE_ENV !== 'test') {
      const errorData = error ? {
        errorMessage: error.message || String(error),
        errorStack: error.stack,
        ...data
      } : data
      console.error(formatLog('error', message, errorData))
    }
  },

  debug(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog('debug', message, data))
    }
  }
}

export function logRequest(event: H3Event, duration: number) {
  const path = getRequestPath(event)
  const method = getMethod(event)
  const status = getResponseStatus(event)
  
  logger.info('Request completed', {
    method,
    path,
    status,
    duration: `${duration}ms`
  })
}
