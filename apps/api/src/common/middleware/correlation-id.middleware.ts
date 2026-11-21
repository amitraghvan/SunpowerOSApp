import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { API_CONSTANTS } from '@solaros/config';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerName = API_CONSTANTS.CORRELATION_ID_HEADER;
    const correlationId = (req.headers[headerName] as string) || uuidv4();

    req.headers[headerName] = correlationId;
    res.setHeader(headerName, correlationId);
    next();
  }
}
