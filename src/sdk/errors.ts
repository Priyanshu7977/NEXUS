// ====================================================================
// NEXUS TYPESCRIPT SDK — ERROR MODEL
// ====================================================================

export class NexusApiError extends Error {
  public readonly code: string;
  public readonly requestId?: string;
  public readonly status: number;
  public readonly details?: Record<string, any>;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', requestId?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'NexusApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NexusAuthenticationError extends NexusApiError {
  constructor(message: string = 'Authentication failed: invalid, expired, or missing API key.', requestId?: string) {
    super(message, 401, 'UNAUTHENTICATED', requestId);
    this.name = 'NexusAuthenticationError';
  }
}

export class NexusPermissionError extends NexusApiError {
  constructor(message: string = 'Permission denied: API key lacks required scope.', requestId?: string) {
    super(message, 403, 'FORBIDDEN', requestId);
    this.name = 'NexusPermissionError';
  }
}

export class NexusNotFoundError extends NexusApiError {
  constructor(message: string = 'Requested resource not found.', requestId?: string) {
    super(message, 404, 'NOT_FOUND', requestId);
    this.name = 'NexusNotFoundError';
  }
}

export class NexusValidationError extends NexusApiError {
  constructor(message: string = 'Request validation failed.', requestId?: string, details?: Record<string, any>) {
    super(message, 422, 'VALIDATION_ERROR', requestId, details);
    this.name = 'NexusValidationError';
  }
}

export class NexusRateLimitError extends NexusApiError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string = 'API rate limit exceeded. Please wait before retrying.', requestId?: string, retryAfterSeconds?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', requestId);
    this.name = 'NexusRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
