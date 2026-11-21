export const API_CONSTANTS = {
  DEFAULT_PORT: 4000,
  API_PREFIX: 'api/v1',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CORRELATION_ID_HEADER: 'x-correlation-id',
  TENANT_ID_HEADER: 'x-organization-id',
  BRANCH_ID_HEADER: 'x-branch-id',
} as const;

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  DOCUMENTS: 'documents',
  PDF_GENERATION: 'pdf-generation',
  REPORTS: 'reports',
  AI_PROCESSING: 'ai-processing',
} as const;

export const STORAGE_BUCKETS = {
  DOCUMENTS: 'solaros-documents',
  SURVEYS: 'solaros-surveys',
  ASSETS: 'solaros-assets',
} as const;

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SOLAR_ENGINEER: 'SOLAR_ENGINEER',
  TECHNICIAN: 'TECHNICIAN',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
  SALES_REP: 'SALES_REP',
} as const;
