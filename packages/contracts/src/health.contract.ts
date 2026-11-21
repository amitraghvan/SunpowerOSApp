export type DependencyStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface ServiceHealthIndicator {
  status: DependencyStatus;
  latencyMs?: number;
  message?: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  version: string;
  environment: string;
  dependencies: {
    database: ServiceHealthIndicator;
    redis: ServiceHealthIndicator;
    storage: ServiceHealthIndicator;
  };
}
