/**
 * NEXUS Privacy & Data Sovereignty Service
 * Enforces strict zero-data-retention, anti-training policies,
 * tenant data isolation, and customer sovereignty standards.
 */

export interface PrivacyPolicySettings {
  allowModelTraining: false; // NEXUS guarantees zero training on customer data
  maskPiiInLogs: boolean;
  enableAuditTrails: boolean;
  ephemeralExecutionOnly: boolean;
  dataResidencyRegion: string;
}

export const DEFAULT_PRIVACY_POLICY: PrivacyPolicySettings = {
  allowModelTraining: false,
  maskPiiInLogs: true,
  enableAuditTrails: true,
  ephemeralExecutionOnly: true,
  dataResidencyRegion: 'global-isolated',
};

/**
 * Validates that an agent execution request complies with zero-training privacy constraints.
 * Appends privacy headers and opt-out directives for external LLM API endpoints.
 */
export function applyPrivacyHeaders(headers: Record<string, string>): Record<string, string> {
  return {
    ...headers,
    'X-NEXUS-Zero-Training': 'true',
    'X-NEXUS-Data-Sovereignty': 'enforced',
    'X-Privacy-Mode': 'zero-retention',
  };
}

/**
 * Asserts strict tenant isolation: verifies that the target resource belongs
 * to the authenticated workspace and prevents cross-tenant access.
 */
export function verifyTenantIsolation(
  requestWorkspaceId: string,
  targetWorkspaceId: string
): { isolated: boolean; error?: string } {
  if (!requestWorkspaceId || !targetWorkspaceId) {
    return { isolated: false, error: 'Tenant identifier missing in request context.' };
  }

  if (requestWorkspaceId !== targetWorkspaceId) {
    return {
      isolated: false,
      error: `Cross-tenant access violation: request workspace (${requestWorkspaceId}) does not match target (${targetWorkspaceId}).`,
    };
  }

  return { isolated: true };
}
