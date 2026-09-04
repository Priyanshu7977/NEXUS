export type ProtocolSource = 'native' | 'mcp' | 'a2a';

export type ProtocolErrorCode =
  | 'PROTOCOL_UNAVAILABLE'
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_FAILED'
  | 'INVALID_SCHEMA'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'CONNECTION_FAILED'
  | 'HIGH_RISK_BLOCKED'
  | 'CAPABILITY_NOT_FOUND';

export interface ProtocolError {
  code: ProtocolErrorCode;
  message: string;
  details?: any;
  retryable?: boolean;
}

export interface NormalizedProtocolResult<T = any> {
  status: 'success' | 'error';
  source: ProtocolSource;
  provider: string;
  capability: string;
  data?: T;
  error?: ProtocolError;
  latency_ms: number;
  timestamp: string;
}

export interface ProtocolHealthCheckResult {
  healthy: boolean;
  latency_ms: number;
  server_version?: string;
  protocol_version?: string;
  error?: string;
  checked_at: string;
}
