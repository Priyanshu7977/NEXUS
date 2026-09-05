// ====================================================================
// NEXUS DEVELOPER SDK — PUBLIC ENTRY POINT
// ====================================================================

export {
  NexusClient,
  type NexusClientOptions,
  type ExecutionFilterParams,
  type WaitForCompletionOptions,
  NexusAgentsClient,
  NexusWorkflowsClient,
  NexusExecutionsClient,
  NexusConnectorsClient,
  NexusActivityClient,
  NexusWebhooksClient,
} from './client';

export {
  NexusApiError,
  NexusAuthenticationError,
  NexusPermissionError,
  NexusNotFoundError,
  NexusValidationError,
  NexusRateLimitError,
} from './errors';

export {
  defineAgent,
  type AgentDefinition,
  type AgentPermissions,
} from './agent';

export {
  defineTool,
  type ToolDefinition,
  type ToolParametersSchema,
  type ToolParameterProperty,
  type ToolExecutionContext,
} from './tool';

export {
  defineConnector,
  type ConnectorDefinition,
  type ConnectorCapability,
  type ConnectorAuthConfig,
  type ConnectorAuthField,
  type ConnectorAuthType,
} from './connector';

export {
  verifyNexusWebhook,
} from './webhooks';

export type {
  DeveloperWebhook,
  WebhookDelivery,
  WebhookEventType,
  WebhookEventEnvelope,
  ApiErrorCode,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  IdempotencyRecord,
} from '../types/api';
