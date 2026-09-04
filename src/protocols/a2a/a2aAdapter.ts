import { A2AInvocationResponse } from '../../types/a2a';
import { NormalizedProtocolResult } from '../../types/protocol';

/**
 * Validates whether an object adheres to standard A2A Agent Card specifications.
 */
export const validateAgentCard = (card: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!card || typeof card !== 'object') {
    return { valid: false, errors: ['Agent Card must be a valid JSON object.'] };
  }

  if (!card.name || typeof card.name !== 'string') {
    errors.push('Agent Card missing required "name" property.');
  }

  if (!card.version || typeof card.version !== 'string') {
    errors.push('Agent Card missing required "version" property.');
  }

  if (!card.skills || !Array.isArray(card.skills) || card.skills.length === 0) {
    errors.push('Agent Card must declare at least one skill in "skills" array.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Normalizes an external agent invocation result into universal NEXUS format.
 */
export const normalizeA2AResult = (
  agentSlug: string,
  skill: string,
  response: A2AInvocationResponse,
  latencyMs: number
): NormalizedProtocolResult => {
  return {
    status: response.status === 'success' ? 'success' : 'error',
    source: 'a2a',
    provider: `a2a:${agentSlug}`,
    capability: `a2a.${agentSlug}.${skill}`,
    data: response.output,
    error: response.error
      ? {
          code: 'SERVER_ERROR',
          message: response.error,
        }
      : undefined,
    latency_ms: response.metrics?.duration_ms || latencyMs,
    timestamp: new Date().toISOString(),
  };
};
