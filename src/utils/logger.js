import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class Logger {
  #logLevel;
  #logDirectory;
  #instanceId;

  constructor(config = {}) {
    this.#logLevel = config.logLevel || 'info';
    this.#instanceId = uuidv4();
    this.#logDirectory = this.#initializeLogDirectory();
  }

  /**
   * Initialize log directory with robust error handling
   * @private
   * @returns {string} Path to log directory
   */
  #initializeLogDirectory() {
    const baseLogDir = path.resolve(
      process.env.LOG_DIR || 
      path.join(process.cwd(), 'logs')
    );

    try {
      fs.mkdirSync(baseLogDir, { recursive: true });
      return baseLogDir;
    } catch (error) {
      console.error(`Failed to create log directory: ${error.message}`);
      return null;
    }
  }

  /**
   * Comprehensive log entry generation
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} [metadata] - Additional log metadata
   */
  #logEntry(level, message, metadata = {}) {
    const logLevels = ['error', 'warn', 'info', 'debug', 'trace'];
    const currentLevelIndex = logLevels.indexOf(this.#logLevel);
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex > currentLevelIndex) return;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      instanceId: this.#instanceId,
      message,
      metadata: {
        ...metadata,
        pid: process.pid,
        platform: process.platform
      }
    };

    // Console output
    this.#consoleLog(logData);

    // File logging
    this.#fileLog(logData);
  }

  /**
   * Standardized console logging
   * @private
   * @param {Object} logData - Structured log data
   */
  #consoleLog(logData) {
    const consoleMethodMap = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
      trace: console.trace
    };

    const method = consoleMethodMap[logData.level] || console.log;
    method(JSON.stringify(logData, null, 2));
  }

  /**
   * Robust file logging mechanism
   * @private
   * @param {Object} logData - Structured log data
   */
  #fileLog(logData) {
    if (!this.#logDirectory) return;

    const logFileName = `fetch-mcp-${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(this.#logDirectory, logFileName);

    try {
      fs.appendFileSync(
        logFilePath, 
        JSON.stringify(logData) + '\n', 
        { flag: 'a' }
      );
    } catch (error) {
      console.error(`Log file write error: ${error.message}`);
    }
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object} [metadata] - Additional error metadata
   */
  error(message, metadata = {}) {
    this.#logEntry('error', message, metadata);
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} [metadata] - Additional warning metadata
   */
  warn(message, metadata = {}) {
    this.#logEntry('warn', message, metadata);
  }

  /**
   * Log an informational message
   * @param {string} message - Informational message
   * @param {Object} [metadata] - Additional info metadata
   */
  info(message, metadata = {}) {
    this.#logEntry('info', message, metadata);
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} [metadata] - Additional debug metadata
   */
  debug(message, metadata = {}) {
    this.#logEntry('debug', message, metadata);
  }

  /**
   * Log a trace message
   * @param {string} message - Trace message
   * @param {Object} [metadata] - Additional trace metadata
   */
  trace(message, metadata = {}) {
    this.#logEntry('trace', message, metadata);
  }
}

export default Logger;