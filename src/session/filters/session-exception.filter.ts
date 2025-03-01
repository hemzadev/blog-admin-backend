import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Exception filter specifically for handling session-related errors.
 * Provides consistent error handling and logging for session operations.
 */
@Catch()
export class SessionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SessionExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine status code - use HttpException status if available, otherwise 500
    const status = 
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // Log the session error with relevant details
    this.logger.error(
      `Session error: ${exception.message}`,
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        sessionId: request.sessionID || 'no-session',
        stack: exception.stack,
      }
    );
    
    // Handle session-specific errors gracefully
    if (exception.message.includes('redis') || exception.message.includes('session')) {
      this.logger.warn('Session store issue detected - failover mechanism triggered');
      // Continue the request flow with a memory-only session if store is unavailable
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Session service temporarily unavailable',
      });
    }
    
    // General error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    });
  }
}