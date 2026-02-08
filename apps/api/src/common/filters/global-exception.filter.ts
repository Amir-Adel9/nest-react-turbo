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

    // Determine HTTP status code.
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Public message returned to clients. Keep generic for internal errors.
    let clientMessage = 'Internal server error';
    // Internal message used for logs.
    let logMessage = clientMessage;

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const extracted =
        typeof response === 'object' && response !== null
          ? (response as { message: string }).message ||
            JSON.stringify(response)
          : response;
      const normalized = this.normalizeMessage(extracted);
      clientMessage = normalized;
      logMessage = normalized;
    } else if (exception instanceof Error) {
      // Keep raw details only in logs for non-HTTP exceptions.
      logMessage = exception.message;
    }

    this.logger.error(
      `[${httpStatus}] ${logMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Strict response contract.
    const responseBody = {
      success: false,
      statusCode: httpStatus,
      message: clientMessage,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private normalizeMessage(message: unknown): string {
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    return 'Internal server error';
  }
}
