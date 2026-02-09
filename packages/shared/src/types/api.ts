export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SEND_FAILED: 'SEND_FAILED',
  INVALID_TEMPLATE: 'INVALID_TEMPLATE',
  ADAPTER_ERROR: 'ADAPTER_ERROR',
  S3_NOT_CONFIGURED: 'S3_NOT_CONFIGURED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PDF_NOT_CONFIGURED: 'PDF_NOT_CONFIGURED',
  PDF_GENERATION_FAILED: 'PDF_GENERATION_FAILED',
  // Billing/subscription errors
  BILLING_NOT_CONFIGURED: 'BILLING_NOT_CONFIGURED',
  POLAR_API_ERROR: 'POLAR_API_ERROR',
  PRICE_NOT_CONFIGURED: 'PRICE_NOT_CONFIGURED',
  NO_SUBSCRIPTION: 'NO_SUBSCRIPTION',
  REFUND_ABUSE_DETECTED: 'REFUND_ABUSE_DETECTED',
  TEMPLATE_LIMIT_REACHED: 'TEMPLATE_LIMIT_REACHED',
  TEAM_MEMBER_LIMIT_REACHED: 'TEAM_MEMBER_LIMIT_REACHED',
  PREMIUM_FEATURE: 'PREMIUM_FEATURE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
