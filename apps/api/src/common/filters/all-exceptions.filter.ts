import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as { message?: string | string[] }).message || exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle common Prisma errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with this information already exists';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'A database error occurred';
      }
      this.logger.error(
        `Prisma error ${exception.code} on ${request.method} ${request.url}: ${exception.message}`,
      );
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        `Database connection error on ${request.method} ${request.url}: ${(exception as Error).message}`,
      );
      message = 'Service temporarily unavailable';
      status = HttpStatus.SERVICE_UNAVAILABLE;
    } else {
      // Truly unexpected error — log the full stack
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${err.message}`,
        err.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(status === HttpStatus.INTERNAL_SERVER_ERROR
        ? {}
        : { path: request.url }),
    });
  }
}
