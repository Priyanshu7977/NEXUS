import React, { useState } from 'react';
import { handleApiV1Request } from '../../api/v1/router';
import { Button } from '../ui/Button';
import { 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  requiredScope: string;
  defaultParams?: Record<string, string>;
  defaultBody?: string;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'list-agents',
    name: 'List Agents',
    method: 'GET',
    path: '/api/v1/agents',
    description: 'Retrieve all configured AI agents for the authenticated workspace.',
    requiredScope: 'agents:read',
  },
  {
    id: 'execute-agent',
    name: 'Execute Agent',
    method: 'POST',
    path: '/api/v1/agents/{id}/execute',
    description: 'Trigger autonomous execution of a single agent with a prompt and context.',
    requiredScope: 'agents:execute',
    defaultParams: { id: 'agent-triage-lead' },
    defaultBody: JSON.stringify({
      prompt: "Review PR #42 for security and architectural regressions.",
      context: { repo: "org/nexus-core", pullNumber: 42 }
    }, null, 2),
  },
  {
    id: 'list-workflows',
    name: 'List Workflows',
    method: 'GET',
    path: '/api/v1/workflows',
    description: 'Retrieve all multi-agent workflows defined in the workspace.',
    requiredScope: 'workflows:read',
  },
  {
    id: 'execute-workflow',
    name: 'Execute Workflow',
    method: 'POST',
    path: '/api/v1/workflows/{id}/execute',
    description: 'Dispatch an end-to-end multi-agent DAG workflow execution.',
    requiredScope: 'workflows:execute',
    defaultParams: { id: 'wf-pr-triage' },
    defaultBody: JSON.stringify({
      triggerData: {
        event: "pull_request.opened",
        repository: "nexus-core/api",
        number: 89
      }
    }, null, 2),
  },
  {
    id: 'list-executions',
    name: 'List Executions',
    method: 'GET',
    path: '/api/v1/executions',
    description: 'Query execution telemetry and status history across the workspace.',
    requiredScope: 'executions:read',
  },
  {
    id: 'get-execution',
    name: 'Get Execution Details',
    method: 'GET',
    path: '/api/v1/executions/{id}',
    description: 'Retrieve status, output, and error state for a specific execution.',
    requiredScope: 'executions:read',
    defaultParams: { id: 'exec-demo-1001' },
  },
  {
    id: 'list-connectors',
    name: 'List Connectors',
    method: 'GET',
    path: '/api/v1/connectors',
    description: 'Query connected tools, integrations (GitHub, Vercel, Slack), and MCP servers.',
    requiredScope: 'agents:read',
  },
  {
    id: 'list-activity',
    name: 'List Activity Logs',
    method: 'GET',
    path: '/api/v1/activity',
    description: 'Audit log of workspace executions, role changes, and API actions.',
    requiredScope: 'activity:read',
  },
  {
    id: 'list-webhooks',
    name: 'List Webhooks',
    method: 'GET',
    path: '/api/v1/webhooks',
    description: 'List configured developer webhook delivery endpoints.',
    requiredScope: 'webhooks:read',
  },
  {
    id: 'create-webhook',
    name: 'Create Webhook',
    method: 'POST',
    path: '/api/v1/webhooks',
    description: 'Register a new HTTPS endpoint to receive signed real-time events.',
    requiredScope: 'webhooks:write',
    defaultBody: JSON.stringify({
      url: "https://api.example.com/webhooks/nexus",
      events: ["workflow.completed", "workflow.failed", "approval.requested"],
      description: "Production CI/CD event dispatcher"
    }, null, 2),
  },
];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('nxs_live_dev_preview_key_001');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [paramId, setParamId] = useState(selectedEndpoint.defaultParams?.id || '');
  const [requestBody, setRequestBody] = useState(selectedEndpoint.defaultBody || '');
  
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<any | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setParamId(ep.defaultParams?.id || '');
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponseBody(null);
  };

  const resolvedPath = selectedEndpoint.path.replace('{id}', paramId || 'demo-id');

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://api.nexus.dev${resolvedPath}" \\
  -H "Authorization: Bearer ${apiKey || 'nxs_live_...'}" \\
  -H "Content-Type: application/json"${idempotencyKey ? ` \\\n  -H "Idempotency-Key: ${idempotencyKey}"` : ''}${
    selectedEndpoint.method === 'POST' && requestBody.trim() ? ` \\\n  -d '${requestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'` : ''
  }`;

  const handleSend = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const start = performance.now();

    let parsedBody: any = undefined;
    if (selectedEndpoint.method === 'POST' && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (err) {
        setResponseStatus(400);
        setResponseBody({
          error: {
            code: 'INVALID_JSON_BODY',
            message: 'Request body must be valid JSON.',
            request_id: `req_${Date.now()}`
          }
        });
        setLoading(false);
        return;
      }
    }

    try {
      // First try live fetch if running on server, fallback to in-memory router directly
      let res: any;
      if (typeof window !== 'undefined' && window.location.origin) {
        try {
          const fetchRes = await fetch(resolvedPath, {
            method: selectedEndpoint.method,
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
            },
            body: parsedBody ? JSON.stringify(parsedBody) : undefined
          });

          if (fetchRes.status !== 404) {
            const data = await fetchRes.json();
            const headersObj: Record<string, string> = {};
            fetchRes.headers.forEach((v, k) => { headersObj[k] = v; });
            res = {
              status: fetchRes.status,
              headers: headersObj,
              body: data
            };
          }
        } catch {
          // Fallback to in-process router
        }
      }

      if (!res) {
        res = await handleApiV1Request({
          method: selectedEndpoint.method,
          path: resolvedPath,
          headers: {
            'authorization': `Bearer ${apiKey}`,
            'content-type': 'application/json',
            ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {})
          },
          body: parsedBody
        });
      }

      const elapsed = Math.round(performance.now() - start);
      setResponseTimeMs(elapsed);
      setResponseStatus(res.status);
      setResponseBody(res.body);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseBody({ error: { code: 'CLIENT_ERROR', message: err.message || String(err) } });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, isCurl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-sm overflow-hidden text-left">
      {/* Header bar */}
      <div className="p-4 border-b border-[#E5E5E2] bg-[#FAFAF8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#6D4AFF]/10 text-[#6D4AFF] border border-[#6D4AFF]/20">
              API EXPLORER
            </span>
            <span className="text-xs text-[#8B919B]">v1 (Public Developer Interface)</span>
          </div>
          <p className="text-xs text-[#626873] mt-1">
            Test live REST endpoints directly with instant JSON responses and generated curl snippets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E2] rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-[10px] font-mono text-[#8B919B]">KEY:</span>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="nxs_live_..."
              className="font-mono text-xs text-[#111318] outline-none w-48 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E5E2]">
        {/* Left Column: Endpoints Menu */}
        <div className="lg:col-span-4 p-3 bg-[#FAFAF8]/50 space-y-1 max-h-[560px] overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8B919B] font-semibold">
            Endpoints
          </div>
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#111318] text-white shadow-xs'
                    : 'bg-white hover:bg-white/80 border border-[#E5E5E2] text-[#626873] hover:text-[#111318]'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        ep.method === 'GET'
                          ? isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ep.method === 'POST'
                          ? isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isSelected ? 'bg-red-500/20 text-red-300' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-semibold truncate">{ep.name}</span>
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-gray-400' : 'text-[#8B919B]'}`}>
                    {ep.path}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Parameters, Request & Live Response */}
        <div className="lg:col-span-8 p-5 space-y-5">
          {/* Endpoint Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E2]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-bold text-[#111318]">{resolvedPath}</span>
              </div>
              <p className="text-xs text-[#626873]">{selectedEndpoint.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Scope: {selectedEndpoint.requiredScope}</span>
              </span>
              <Button size="sm" onClick={handleSend} disabled={loading}>
                <Play className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Sending...' : 'Send Request'}</span>
              </Button>
            </div>
          </div>

          {/* Path Parameter & Idempotency Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedEndpoint.path.includes('{id}') && (
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#8B919B] font-semibold mb-1">
                  Resource ID (:id)
                </label>
                <input
                  type="text"
                  value={paramId}
                  onChange={(e) => setParamId(e.target.value)}
                  placeholder="e.g. agent-triage-lead"
                  className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-xs text-[#111318] outline-none focus:border-[#6D4AFF] focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#8B919B] font-semibold mb-1">
                Idempotency-Key (Optional Header)
              </label>
              <input
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                placeholder="e.g. idem_test_unique_key"
                className="w-full h-8 px-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-xs text-[#111318] outline-none focus:border-[#6D4AFF] focus:bg-white"
              />
            </div>
          </div>

          {/* Request Body Editor (for POST) */}
          {selectedEndpoint.method === 'POST' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase text-[#8B919B] font-semibold">
                  JSON Request Body
                </label>
                <span className="text-[10px] font-mono text-[#8B919B]">application/json</span>
              </div>
              <textarea
                rows={4}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs outline-none border border-neutral-800 resize-y"
              />
            </div>
          )}

          {/* Response Output Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-[#8B919B] font-semibold">
                  Response
                </span>
                {responseStatus !== null && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : responseStatus === 429
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 401 ? 'UNAUTHORIZED' : responseStatus === 403 ? 'FORBIDDEN' : responseStatus === 404 ? 'NOT FOUND' : responseStatus === 429 ? 'RATE LIMITED' : 'ERROR'}
                  </span>
                )}
                {responseTimeMs !== null && (
                  <span className="text-[10px] font-mono text-[#8B919B] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {responseTimeMs}ms
                  </span>
                )}
              </div>

              {responseBody && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(responseBody, null, 2), false)}
                  className="text-xs font-mono text-[#626873] hover:text-[#111318] flex items-center gap-1 cursor-pointer"
                >
                  {copiedResponse ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="rounded-xl bg-[#111318] p-4 text-left font-mono text-xs overflow-x-auto max-h-64 border border-neutral-800">
              {loading ? (
                <div className="text-gray-400 py-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#6D4AFF] animate-ping" />
                  <span>Dispatching API request...</span>
                </div>
              ) : responseBody ? (
                <pre className="text-emerald-400 whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              ) : (
                <div className="text-neutral-500 py-6 text-center text-xs">
                  Click "Send Request" to test this endpoint.
                </div>
              )}
            </div>
          </div>

          {/* Generated curl Snippet */}
          <div className="pt-2 border-t border-[#E5E5E2]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-[#8B919B] font-semibold flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#6D4AFF]" />
                <span>cURL Equivalent</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(curlCommand, true)}
                className="text-xs font-mono text-[#626873] hover:text-[#111318] flex items-center gap-1 cursor-pointer"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy curl'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
              {curlCommand}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
