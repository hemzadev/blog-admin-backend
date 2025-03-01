// src/config/utils/config-factory.ts
import { Logger } from '@nestjs/common';

/**
 * Factory function to create configuration objects with validation and error handling
 * @param name Configuration section name
 * @param requiredEnvVars Array of required environment variables
 * @param optionalEnvVars Array of optional environment variables
 * @param factoryFn Function to transform environment variables into configuration object
 * @returns Configuration object
 */
export function createConfigFactory<T>(
  name: string,
  requiredEnvVars: string[],
  optionalEnvVars: string[] = [],
  factoryFn: (env: Record<string, string | undefined>) => T,
): () => T {
  const logger = new Logger(`ConfigFactory:${name}`);

  return () => {
    logger.log(`Loading ${name} configuration`);
    
    // Check for required environment variables
    const missingVars: string[] = [];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables for ${name}: ${missingVars.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Create environment variables map
    const envVars: Record<string, string | undefined> = {};
    
    for (const envVar of [...requiredEnvVars, ...optionalEnvVars]) {
      envVars[envVar] = process.env[envVar];
    }
    
    try {
      // Generate configuration using the factory function
      const config = factoryFn(envVars);
      logger.log(`Successfully loaded ${name} configuration`);
      return config;
    } catch (error) {
      logger.error(`Failed to create ${name} configuration: ${error.message}`);
      throw new Error(`Configuration error in ${name}: ${error.message}`);
    }
  };
}

/**
 * Factory function specifically for OAuth provider configurations
 */
export function createOAuthConfigFactory<T>(
  provider: string,
  configMapper: (clientId: string, clientSecret: string, callbackUrl: string) => T,
): () => T {
  const envPrefix = provider.toUpperCase();
  
  return createConfigFactory(
    provider,
    [
      `${envPrefix}_CLIENT_ID`,
      `${envPrefix}_CLIENT_SECRET`,
      `${envPrefix}_CALLBACK_URL`,
    ],
    [],
    (env) => {
      return configMapper(
        env[`${envPrefix}_CLIENT_ID`]!,
        env[`${envPrefix}_CLIENT_SECRET`]!,
        env[`${envPrefix}_CALLBACK_URL`]!,
      );
    },
  );
}