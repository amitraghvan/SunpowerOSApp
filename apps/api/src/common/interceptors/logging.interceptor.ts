import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { API_CONSTANTS } from '@solaros/config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url } = request;
    const correlationId = request.headers[API_CONSTANTS.CORRELATION_ID_HEADER] || 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(`[${correlationId}] ${method} ${url} - ${duration}ms`);
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.warn(`[${correlationId}] ${method} ${url} FAILED - ${duration}ms - ${err.message}`);
        },
      })
    );
  }
}
