import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseUtil } from '../response/api-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<
      string,
      unknown
    >;

    this.logger.error({
      status,
      message: exceptionResponse.message || exception.message,
      timestamp: new Date().toISOString(),
    });

    const errorMessage = Array.isArray(exceptionResponse.message)
      ? (exceptionResponse.message as string[])[0]
      : (exceptionResponse.message as string) || exception.message;

    const apiResponse = ApiResponseUtil.failed(
      errorMessage || 'An error occurred',
    );

    response.status(status).json(apiResponse);
  }
}
