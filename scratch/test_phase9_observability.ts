import {
  sanitizeObservabilityData,
  normalizeWorkflowEvent,
  normalizeAgentEvent,
  getExecutionLiveState,
  getWorkspaceActiveExecutions,
  getWorkspacePendingApprovals,
  getWorkspaceUsageMetrics,
  checkWorkspaceSystemHealth,
} from '../src/services/observabilityService';
import {
  subscribeToExecution,
  broadcastExecutionEvent,
  subscribeToWorkspaceExecutions,
} from '../src/services/realtimeExecutionService';
import {
  executeWorkflow,
  resumeWorkflowExecution,
  cancelWorkflowExecution,
  isExecutionCancelled,
} from '../src/runtime/workflowEngine';
import { createWorkflow } from '../src/services/workflowService';
import { NormalizedExecutionEvent } from '../src/types/observability';
import { WorkflowExecutionEvent } from '../src/types/workflow';
import { AgentExecutionEvent } from '../src/types/agent';

async function runPhase9ObservabilityTests() {
  console.log('====================================================');
  console.log('NEXUS PHASE 9 — REAL-TIME MISSION CONTROL & OBSERVABILITY SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  const wsA = `ws_obs_alpha_${Date.now()}`;
  const wsB = `ws_obs_beta_${Date.now()}`;

  // ----------------------------------------------------
  // TEST 1: Secret Redaction & Sanitization
  // ----------------------------------------------------
  console.log('\n--- 1. Secret Redaction & Sensitive Data Sanitization ---');
  const rawSensitiveData = {
    apiKey: 'nxs_live_999888777666555444',
    token: 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    authorization: 'Bearer sk-ant-api03-abcdef1234567890',
    deepConfig: {
      client_secret: 'sec_abcdef123456',
      password: 'SuperSecretPassword!',
      nestedList: [
        { github_token: 'ghp_987654321fedcba' },
        { safeMetric: 42, label: 'production-us-east' }
      ]
    },
    // Internal chain of thought fields should be redacted in user-facing streams
    thought: 'The user wants to deploy, but internal secret keys must never leak.',
    reasoning: 'I will evaluate policy and reject if unauthorized.',
    chain_of_thought: 'Step 1: Check credentials. Step 2: Run deployment.',
    publicInfo: 'Deploy completed successfully'
  };

  const sanitized = sanitizeObservabilityData(rawSensitiveData);

  assert(sanitized.apiKey === '[REDACTED]', 'apiKey masked with [REDACTED]');
  assert(sanitized.token === '[REDACTED]', 'token masked with [REDACTED]');
  assert(sanitized.authorization === '[REDACTED]', 'authorization header masked with [REDACTED]');
  assert(sanitized.deepConfig.client_secret === '[REDACTED]', 'Nested client_secret masked');
  assert(sanitized.deepConfig.password === '[REDACTED]', 'Nested password masked');
  assert(sanitized.deepConfig.nestedList[0].github_token === '[REDACTED]', 'Array item github_token masked');
  assert(sanitized.deepConfig.nestedList[1].safeMetric === 42, 'Non-sensitive nested metric preserved');
  assert(sanitized.publicInfo === 'Deploy completed successfully', 'Public safe string untouched');
  assert(!('thought' in sanitized) || sanitized.thought === undefined, 'Internal "thought" stripped');
  assert(!('reasoning' in sanitized) || sanitized.reasoning === undefined, 'Internal "reasoning" stripped');
  assert(!('chain_of_thought' in sanitized) || sanitized.chain_of_thought === undefined, 'Internal "chain_of_thought" stripped');

  // ----------------------------------------------------
  // TEST 2: Event Normalization (Workflow & Agent)
  // ----------------------------------------------------
  console.log('\n--- 2. Unified Event Normalization ---');
  const dummyWfEvent: WorkflowExecutionEvent = {
    id: 'evt_wf_1',
    execution_id: 'exec_wf_test_1',
    event_type: 'NODE_STARTED',
    node_key: 'deploy_prod',
    status: 'running',
    message: 'Deploying release v2.4 to Vercel production',
    metadata: {
      provider: 'vercel',
      deploymentId: 'dpl_12345',
      secretKey: 'ghp_secretShouldBeMasked',
    },
    created_at: new Date().toISOString(),
  };

  const normalizedWf = normalizeWorkflowEvent(dummyWfEvent);
  assert(normalizedWf.id === 'evt_wf_1', 'Normalized ID preserved');
  assert(normalizedWf.execution_id === 'exec_wf_test_1', 'Execution ID preserved');
  assert(normalizedWf.source_type === 'deployment', 'Identifies deployment node from metadata/nodeKey');
  assert(normalizedWf.status === 'running', 'Status matches running');
  assert(normalizedWf.metadata?.secretKey === '[REDACTED]', 'Secrets inside event metadata sanitized');

  const dummyAgentEvent: AgentExecutionEvent = {
    id: 'evt_ag_1',
    execution_id: 'exec_ag_test_1',
    event_type: 'TOOL_INVOKED',
    tool_name: 'mcp__filesystem__readFile',
    status: 'running',
    message: 'Reading workspace configuration file',
    metadata: {
      args: { path: '/nexus/config.json', authToken: 'Bearer nxs_token_xyz' },
    },
    created_at: new Date().toISOString(),
  };

  const normalizedAg = normalizeAgentEvent(dummyAgentEvent);
  assert(normalizedAg.source_type === 'tool', 'Agent tool invocation classified as "tool" source_type');
  assert(normalizedAg.metadata?.args?.authToken === '[REDACTED]', 'Agent tool argument tokens sanitized');
  assert(normalizedAg.source_id === 'mcp__filesystem__readFile', 'Tool name used as source_id');

  // ----------------------------------------------------
  // TEST 3: Real-Time Event Bus, Subscription & Deduplication
  // ----------------------------------------------------
  console.log('\n--- 3. Real-Time Event Bus & Deduplication ---');
  const testExecId = `exec_rt_${Date.now()}`;
  const receivedEvents: NormalizedExecutionEvent[] = [];

  const unsub = subscribeToExecution(testExecId, (event) => {
    receivedEvents.push(event);
  });

  const liveEvent1: NormalizedExecutionEvent = {
    id: 'live_evt_101',
    execution_id: testExecId,
    workspace_id: wsA,
    timestamp: new Date().toISOString(),
    source_type: 'workflow',
    source_id: 'node_alpha',
    event_type: 'NODE_STARTED',
    message: 'Executing step 1',
    status: 'running',
  };

  broadcastExecutionEvent(liveEvent1);
  assert(receivedEvents.length === 1, 'Subscriber received broadcasted event');
  assert(receivedEvents[0].id === 'live_evt_101', 'Received event ID matches');

  // Resend identical event ID to test deduplication
  broadcastExecutionEvent(liveEvent1);
  assert(receivedEvents.length === 1, 'Duplicate event ID successfully deduplicated');

  // Send new event ID
  const liveEvent2: NormalizedExecutionEvent = {
    ...liveEvent1,
    id: 'live_evt_102',
    event_type: 'NODE_COMPLETED',
    status: 'completed',
  };
  broadcastExecutionEvent(liveEvent2);
  assert(receivedEvents.length === 2, 'New event received after duplicate filtered');

  // Unsubscribe and verify no more events received
  unsub();
  broadcastExecutionEvent({ ...liveEvent1, id: 'live_evt_103' });
  assert(receivedEvents.length === 2, 'Unsubscribe cleanly detaches listener');

  // ----------------------------------------------------
  // TEST 4: Live Execution Graph & DAG State Reconstruction
  // ----------------------------------------------------
  console.log('\n--- 4. Live Execution Graph & DAG State Reconstruction ---');
  const { workflow } = await createWorkflow(wsA, {
    name: 'Observability Multi-Step Pipeline',
    description: 'Pipeline with approval gate and tasks',
    nodes: [
      {
        node_key: 'step_fetch',
        name: 'Fetch Repository Data',
        node_type: 'TRIGGER',
        config: { event: 'manual' },
      },
      {
        node_key: 'step_approval',
        name: 'Production Gate Approval',
        node_type: 'APPROVAL',
        config: {
          prompt: 'Approve deployment to production cluster',
          approver_role: 'admin',
        },
      },
      {
        node_key: 'step_notify',
        name: 'Send Slack Notification',
        node_type: 'OUTPUT',
        config: { summaryTemplate: 'Workflow execution complete.' },
      },
    ],
    edges: [
      { source_node_key: 'step_fetch', target_node_key: 'step_approval' },
      { source_node_key: 'step_approval', target_node_key: 'step_notify' },
    ],
  });

  assert(Boolean(workflow && workflow.id), 'Workflow definition created');

  // Execute workflow — it will pause at step_approval
  const pausedExec = await executeWorkflow({
    workspaceId: wsA,
    workflowId: workflow!.id,
    triggerType: 'manual',
    triggerPayload: { release: 'v1.0.0' },
  });

  assert(pausedExec.status === 'waiting_for_approval', 'Execution paused at approval gate');

  // Reconstruct live state via getExecutionLiveState
  const liveState = await getExecutionLiveState(wsA, pausedExec.id);
  assert(liveState !== null, 'Live execution state reconstructed');
  assert(liveState?.status === 'waiting_for_approval', 'Live state status is waiting_for_approval');
  assert(Object.keys(liveState?.nodes || {}).length === 3, 'DAG contains all 3 defined nodes');

  const fetchNode = liveState?.nodes['step_fetch'];
  const approvalNode = liveState?.nodes['step_approval'];
  const notifyNode = liveState?.nodes['step_notify'];

  assert(fetchNode?.status === 'completed', 'Step 1 (fetch) marked completed');
  assert(approvalNode?.status === 'waiting' || approvalNode?.status === 'waiting_for_approval', 'Step 2 (approval) marked waiting');
  assert(notifyNode?.status === 'pending', 'Downstream step 3 (notify) marked pending');
  assert(liveState?.approval !== null && liveState?.approval.status === 'waiting', 'Approval state extracted correctly');
  assert(liveState?.approval?.node_key === 'step_approval', 'Approval step key matches');

  // ----------------------------------------------------
  // TEST 5: Mission Control Pending Approvals & Resumption
  // ----------------------------------------------------
  console.log('\n--- 5. Mission Control Approvals & Execution Resumption ---');
  const pendingApprovalsA = await getWorkspacePendingApprovals(wsA);
  assert(pendingApprovalsA.length >= 1, 'Mission Control surfaces waiting execution in pending approvals');
  assert(pendingApprovalsA.some((a) => a.execution_id === pausedExec.id), 'Paused execution present in pending list');

  // Resume the execution with approval
  const resumedExec = await resumeWorkflowExecution({
    workspaceId: wsA,
    executionId: pausedExec.id,
    nodeKey: 'step_approval',
    decision: 'approve',
    notes: 'Verified staging checks passed.',
    decidedBy: 'DevOps Lead',
  });

  assert(resumedExec.status === 'completed', 'Execution resumed and completed all remaining steps');

  // Verify reconstructed state after completion
  const postResumeLiveState = await getExecutionLiveState(wsA, pausedExec.id);
  assert(postResumeLiveState?.status === 'completed', 'Live state status transitioned to completed');
  const postApprovalNode = postResumeLiveState?.nodes['step_approval'];
  const postNotifyNode = postResumeLiveState?.nodes['step_notify'];
  assert(postApprovalNode?.status === 'completed', 'Approval node marked completed');
  assert(postNotifyNode?.status === 'completed', 'Downstream notification node completed');

  // Verify it is no longer in pending approvals
  const updatedApprovals = await getWorkspacePendingApprovals(wsA);
  assert(!updatedApprovals.some((a) => a.execution_id === pausedExec.id), 'Execution removed from pending approvals');

  // ----------------------------------------------------
  // TEST 6: Execution Cancellation & Stopping Downstream Nodes
  // ----------------------------------------------------
  console.log('\n--- 6. Execution Cancellation & Downstream Halt ---');
  const { workflow: cancelWorkflowDef } = await createWorkflow(wsA, {
    name: 'Cancellable Workflow',
    description: 'Pipeline for testing cancellation halt',
    nodes: [
      { node_key: 'c_step1', name: 'Step 1', node_type: 'TRIGGER', config: {} },
      { node_key: 'c_step2', name: 'Step 2 (Approval Gate)', node_type: 'APPROVAL', config: {} },
      { node_key: 'c_step3', name: 'Step 3 (Post Action)', node_type: 'OUTPUT', config: {} },
    ],
    edges: [
      { source_node_key: 'c_step1', target_node_key: 'c_step2' },
      { source_node_key: 'c_step2', target_node_key: 'c_step3' },
    ],
  });

  const execToCancel = await executeWorkflow({
    workspaceId: wsA,
    workflowId: cancelWorkflowDef!.id,
    triggerType: 'manual',
    triggerPayload: {},
  });

  assert(execToCancel.status === 'waiting_for_approval', 'Workflow waiting at gate before cancel');

  // Cancel execution
  const cancelResult = await cancelWorkflowExecution(wsA, execToCancel.id, 'user_operator');
  assert(Boolean(cancelResult && cancelResult.status === 'cancelled'), 'cancelWorkflowExecution returned cancelled execution');
  assert(isExecutionCancelled(execToCancel.id) === true, 'isExecutionCancelled returns true');

  const cancelledLiveState = await getExecutionLiveState(wsA, execToCancel.id);
  assert(cancelledLiveState?.status === 'cancelled', 'Reconstructed live state is marked cancelled');
  const step3Node = cancelledLiveState?.nodes['c_step3'];
  assert(step3Node?.status === 'pending', 'Step 3 never ran and stayed pending');

  // ----------------------------------------------------
  // TEST 7: Zero Fake Telemetry & Usage Metrics
  // ----------------------------------------------------
  console.log('\n--- 7. Zero Fake Telemetry & Genuine Usage Metrics ---');
  const metricsToday = await getWorkspaceUsageMetrics(wsA, 'today');
  assert(metricsToday.total_workflow_runs >= 2, 'Workflow runs accurately counted (no fake data)');
  assert(metricsToday.successful_workflow_runs >= 1, 'Successful workflow runs accurately recorded');
  assert(metricsToday.cancelled_workflow_runs >= 1, 'Cancelled workflow run recorded');
  assert(metricsToday.has_real_token_data === false || typeof metricsToday.tokens_used === 'number', 'Token data is either authentic or has_real_token_data is false (no fake tokens)');

  const metrics30d = await getWorkspaceUsageMetrics(wsA, '30d');
  assert(metrics30d.time_range === '30d', 'Time range filter respected');
  assert(metrics30d.total_workflow_runs >= metricsToday.total_workflow_runs, '30d run count >= today count');

  // ----------------------------------------------------
  // TEST 8: Multi-Tenant Workspace Isolation
  // ----------------------------------------------------
  console.log('\n--- 8. Multi-Tenant Workspace Isolation ---');
  const activeExecsA = await getWorkspaceActiveExecutions(wsA);
  const activeExecsB = await getWorkspaceActiveExecutions(wsB);
  const approvalsB = await getWorkspacePendingApprovals(wsB);
  const metricsB = await getWorkspaceUsageMetrics(wsB, 'all');

  assert(approvalsB.length === 0, 'Workspace B has 0 pending approvals from Workspace A');
  assert(metricsB.total_workflow_runs === 0, 'Workspace B has 0 workflow runs from Workspace A');
  assert(!activeExecsB.some((e) => e.workspace_id === wsA), 'Workspace B active executions strictly isolated');

  // ----------------------------------------------------
  // TEST 9: Non-Destructive Workspace System Health Check
  // ----------------------------------------------------
  console.log('\n--- 9. Non-Destructive System Health Check ---');
  const healthCheck = await checkWorkspaceSystemHealth(wsA);
  assert(healthCheck.workspace_id === wsA, 'Health check returns workspace ID');
  assert(['healthy', 'degraded'].includes(healthCheck.status), 'Health check returns valid status');
  assert(healthCheck.checks.length >= 4, 'Health check contains GitHub, Vercel, Gemini, MCP, A2A checks');
  
  const githubCheck = healthCheck.checks.find((c) => c.id.includes('github'));
  const vercelCheck = healthCheck.checks.find((c) => c.id.includes('vercel'));
  const aiCheck = healthCheck.checks.find((c) => c.category === 'ai_provider');
  const mcpCheck = healthCheck.checks.find((c) => c.category === 'mcp');
  const a2aCheck = healthCheck.checks.find((c) => c.category === 'a2a');

  assert(Boolean(githubCheck), 'GitHub integration check included');
  assert(Boolean(vercelCheck), 'Vercel integration check included');
  assert(Boolean(aiCheck), 'AI Engine check included');
  assert(Boolean(mcpCheck), 'MCP infrastructure check included');
  assert(Boolean(a2aCheck), 'A2A protocol check included');

  console.log('\n====================================================');
  console.log(`PHASE 9 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9ObservabilityTests().catch((err) => {
  console.error('[FATAL] Phase 9 Observability test run failed:', err);
  process.exit(1);
});
