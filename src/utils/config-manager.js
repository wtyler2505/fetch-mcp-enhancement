import fs from 'fs';
import path from 'path';

class ConfigManager {
  static #DEFAULT_CONFIG = {
    fetchTimeout: 10000,           // 10 seconds default timeout
    maxRetries: 3,                 // Maximum fetch retry attempts
    userAgentRotation: true,        // Enable user agent rotation
    markdownConversion: true,       // Enable automatic markdown conversion
    cacheEnabled: false,            // Disable caching by default
    logLevel: 'info',               // Default logging level
    securityOptions: {
      rateLimitPerMinute: 60,       // Rate limit requests
      allowedDomains: [],           // Whitelist of allowed domains
      blockedDomains: []            // Blacklist of blocked domains
    }
  };

  /**
   * Load configuration from multiple potential sources
   * Priority: Environment Variables > Local Config File > Default Config
   * @returns {Object} Merged configuration object
   */
  static loadConfig() {
    // Environment variable configuration
    const envConfig = this.#loadEnvConfig();

    // Local configuration file
    const fileConfig = this.#loadFileConfig();

    // Deep merge configurations
    return this.#deepMerge(
      this.#DEFAULT_CONFIG, 
      fileConfig, 
      envConfig
    );
  }

  /**
   * Load configuration from environment variables
   * @private
   * @returns {Object} Configuration from environment variables
   */
  static #loadEnvConfig() {
    return {
      fetchTimeout: parseInt(process.env.FETCH_TIMEOUT, 10) || undefined,
      maxRetries: parseInt(process.env.FETCH_MAX_RETRIES, 10) || undefined,
      logLevel: process.env.FETCH_LOG_LEVEL || undefined,
      securityOptions: {
        allowedDomains: 
          process.env.FETCH_ALLOWED_DOMAINS 
            ? process.env.FETCH_ALLOWED_DOMAINS.split(',') 
            : undefined
      }
    };
  }

  /**
   * Load configuration from local configuration file
   * @private
   * @returns {Object} Configuration from local file
   */
  static #loadFileConfig() {
    const configPaths = [
      path.resolve(process.cwd(), 'fetch-mcp.config.json'),
      path.resolve(process.env.HOME || process.env.USERPROFILE, '.fetch-mcp.config.json')
    ];

    for (const configPath of configPaths) {
      try {
        if (fs.existsSync(configPath)) {
          const rawConfig = fs.readFileSync(configPath, 'utf8');
          return JSON.parse(rawConfig);
        }
      } catch (error) {
        console.warn(`Could not load config from ${configPath}: ${error.message}`);
      }
    }

    return {};
  }

  /**
   * Perform deep merge of configuration objects
   * @private
   * @param {...Object} configs - Configuration objects to merge
   * @returns {Object} Merged configuration
   */
  static #deepMerge(...configs) {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

    return configs.reduce((acc, config) => {
      Object.keys(config).forEach(key => {
        const accValue = acc[key];
        const configValue = config[key];

        if (Array.isArray(accValue) && Array.isArray(configValue)) {
          acc[key] = [...new Set([...accValue, ...configValue])];
        } else if (isObject(accValue) && isObject(configValue)) {
          acc[key] = this.#deepMerge(accValue, configValue);
        } else if (configValue !== undefined) {
          acc[key] = configValue;
        }
      });

      return acc;
    }, {});
  }

  /**
   * Validate configuration against security constraints
   * @param {string} url - URL to validate
   * @param {Object} config - Configuration object
   * @returns {boolean} Whether URL is allowed
   */
  static validateUrlSecurity(url, config) {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      const { allowedDomains, blockedDomains } = config.securityOptions;

      if (blockedDomains.length && blockedDomains.some(domain => hostname.includes(domain))) {
        return false;
      }

      if (allowedDomains.length && !allowedDomains.some(domain => hostname.includes(domain))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

export default ConfigManager;