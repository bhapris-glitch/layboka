// layboka/apps/api/src/utils/logger.js
import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `[${timestamp}] ${level}: ${stack}`;
  }

  return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    logFormat
  ),

  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(
              errors({ stack: true }),
              timestamp({
                format: "YYYY-MM-DD HH:mm:ss"
              }),
              logFormat
            )
          : combine(
              colorize(),
              errors({ stack: true }),
              timestamp({
                format: "YYYY-MM-DD HH:mm:ss"
              }),
              logFormat
            )
    })
  ],

  exitOnError: false
});

/**
 * Log Helpers
 */

export const logInfo = (message) => {
  logger.info(message);
};

export const logWarn = (message) => {
  logger.warn(message);
};

export const logError = (error) => {
  logger.error(error);
};

export const logDebug = (message) => {
  logger.debug(message);
};

export default logger;
