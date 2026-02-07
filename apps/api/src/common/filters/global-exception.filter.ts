import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // 1. Determine Status Code
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Extract and Normalize Message
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message =
        typeof response === 'object' && response !== null
          ? (response as { message: string }).message ||
            JSON.stringify(response)
          : response;
    } else if (exception instanceof Error) {
      // Catch-all for raw errors (e.g. database errors not caught in service)
      message = exception.message;
    }

    // 3. Log 500s (Internal Errors) for debugging
    if (httpStatus >= 500) {
      this.logger.error(
        `[${httpStatus}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // 4. Strict Response Contract
    const responseBody = {
      success: false,
      statusCode: httpStatus,
      // Ensure message is a string even if class-validator returns an array
      message: Array.isArray(message) ? message.join(', ') : message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
