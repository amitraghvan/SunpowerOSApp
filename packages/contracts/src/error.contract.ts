export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  correlationId: string;
  timestamp: string;
  path: string;
}
