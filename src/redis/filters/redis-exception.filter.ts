// src/redis/filters/redis-exception.filter.ts
import { 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost, 
    HttpStatus,
    Logger
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { RedisError } from 'redis';
  
  /**
   * Exception filter to catch and handle Redis errors
   */
  @Catch(RedisError)
  export class RedisExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(RedisExceptionFilter.name);
  
    catch(exception: RedisError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      // Log the Redis error
      this.logger.error(
        `Redis error occurred: ${exception.message}`,
        exception.stack
      );
  
      // Return an appropriate response
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'A database service is currently unavailable. Please try again later.',
        error: 'Service Unavailable',
      });
    }
  }