import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BrandLogo } from '../brand/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { createAgent, updateAgent, getAgentById } from '../../services/agentService';
import { getWorkspaceConnections } from '../../services/connectorService';
import { AgentModelProvider, AgentStatus } from '../../types/agent';
import { 
  Bot, 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  Wrench, 
  FileCode, 
  Check, 
  Info,
  Sliders,
  AlertCircle
} from 'lucide-react';

export const AgentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { currentWorkspace, user } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [modelProvider, setModelProvider] = useState<AgentModelProvider>('gemini');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [instructions, setInstructions] = useState(
    'You are a specialized NEXUS intelligence worker. Execute reasoning tasks methodically, inspect live context using permitted tools before answering, and structure responses clearly with accurate technical details.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxSteps, setMaxSteps] = useState<number>(10);
  const [maxRuntimeSeconds, setMaxRuntimeSeconds] = useState<number>(300);
  const [status, setStatus] = useState<AgentStatus>('active');

  // Capability permissions map (e.g. { "github.repositories.read": true, "github.profile.read": true })
  const [selectedCapabilities, setSelectedCapabilities] = useState<Record<string, boolean>>({
    'github.profile.read': true,
    'github.repositories.read': true,
  });

  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(editId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentWorkspace?.id) return;
      try {
        const { connections } = await getWorkspaceConnections(currentWorkspace.id);
        const active = connections
          .filter((c) => c.status === 'connected')
          .map((c) => c.connector_id);
        setActiveConnections(active);

        if (editId) {
          const { agent } = await getAgentById(currentWorkspace.id, editId);
          if (agent) {
            setName(agent.name);
            setRole(agent.role || '');
            setDescription(agent.description || '');
            setModelProvider(agent.model_provider);
            setModelName(agent.model_name);
            setInstructions(agent.instructions);
            setTemperature(agent.temperature);
            setMaxSteps(agent.max_steps);
            setMaxRuntimeSeconds(agent.max_runtime_seconds);
            setStatus(agent.status);

            const capsMap: Record<string, boolean> = {};
            for (const t of agent.tools || []) {
              capsMap[t.capability] = true;
            }
            setSelectedCapabilities(capsMap);
          }
        }
      } catch (err) {
        console.error('[NEXUS AgentNewPage] Error loading data:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [currentWorkspace?.id, editId]);

  const modelOptions = [
    {
      id: 'gemini' as const,
      name: 'Google Gemini 1.5 Flash (Recommended)',
      modelName: 'gemini-1.5-flash',
      provider: 'gemini' as const,
      description: 'Ultra-fast sub-second multimodal intelligence with native function calling.',
    },
    {
      id: 'gemini' as const,
      name: 'Google Gemini 1.5 Pro',
      modelName: 'gemini-1.5-pro',
      provider: 'gemini' as const,
      description: 'Advanced reasoning, complex AST evaluation, and 2M token context window.',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI GPT-4o',
      modelName: 'gpt-4o',
      provider: 'openai' as const,
      description: 'High precision flagship model with tool integration and reasoning capabilities.',
    },
    {
      id: 'openai' as const,
      name: 'OpenAI GPT-4o Mini',
      modelName: 'gpt-4o-mini',
      provider: 'openai' as const,
      description: 'Cost-efficient intelligence for routine queries and structured formatting.',
    },
  ];

  const availableConnectorsWithCapabilities = [
    {
      connectorId: 'github',
      connectorName: 'GitHub Connector',
      brand: 'github' as const,
      capabilities: [
        {
          id: 'github.profile.read',
          name: 'Read Profile & Account Stats',
          description: 'Access account username, avatar, public repositories, and follower counts.',
          implemented: true,
        },
        {
          id: 'github.repositories.read',
          name: 'List & Inspect Repositories',
          description: 'Search repositories, inspect branches, view languages, and check star counts.',
          implemented: true,
        },
        {
          id: 'github.repositories.write',
          name: 'Commit & Branch Management',
          description: 'Create branches, push commits, and propose code patches.',
          implemented: false,
        },
        {
          id: 'github.pull_requests.read',
          name: 'Inspect Pull Requests',
          description: 'Analyze pull request diffs, review comments, and check runs.',
          implemented: false,
        },
      ],
    },
  ];

  const toggleCapability = (capId: string) => {
    setSelectedCapabilities((prev) => ({
      ...prev,
      [capId]: !prev[capId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentWorkspace?.id) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // Build tools array from selected capabilities
    const toolsPayload: { connector_id: string; capability: string; permission_mode: 'read_only' }[] = [];
    for (const group of availableConnectorsWithCapabilities) {
      for (const cap of group.capabilities) {
        if (selectedCapabilities[cap.id]) {
          toolsPayload.push({
            connector_id: group.connectorId,
            capability: cap.id,
            permission_mode: 'read_only',
          });
        }
      }
    }

    try {
      if (editId) {
        const { agent, error } = await updateAgent(currentWorkspace.id, editId, {
          name: name.trim(),
          role: role.trim() || 'Specialized Agent',
          description: description.trim(),
          instructions,
          model_provider: modelProvider,
          model_name: modelName,
          status,
          temperature,
          max_steps: maxSteps,
          max_runtime_seconds: maxRuntimeSeconds,
          tools: toolsPayload,
        });

        if (error || !agent) {
          setErrorMessage(error || 'Failed to update agent.');
          setIsSubmitting(false);
          return;
        }

        navigate(`/app/agents/${agent.id}`);
      } else {
        const { agent, error } = await createAgent(
          currentWorkspace.id,
          {
            name: name.trim(),
            role: role.trim() || 'Specialized Agent',
            description: description.trim(),
            instructions,
            model_provider: modelProvider,
            model_name: modelName,
            status,
            temperature,
            max_steps: maxSteps,
            max_runtime_seconds: maxRuntimeSeconds,
            tools: toolsPayload,
          },
          user?.id
        );

        if (error || !agent) {
          setErrorMessage(error || 'Failed to create agent.');
          setIsSubmitting(false);
          return;
        }

        navigate(`/app/agents/${agent.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="py-20 text-center text-xs text-[#8B919B]">
        Loading agent configuration...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/agents')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents</span>
        </button>

        <div className="text-xs font-mono text-[#8B919B]">
          {editId ? 'Edit Configuration' : 'Create Agent'}
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] mb-1.5">
          {editId ? `Edit: ${name || 'Agent'}` : 'Create an Agent'}
        </h2>
        <p className="text-sm text-[#626873]">
          Define an agent's identity, intelligence model, execution instructions, tool capabilities, and safety limits.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Section 1: Identity */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFEA]">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                1. Identity & Role
              </h3>
              <p className="text-xs text-[#626873]">
                Name, role, and high-level purpose of this worker in your workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Repository Analyst, Security Auditor"
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. GitHub Repository Inspection & Context Synthesis"
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              Description & Purpose
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Inspects project repositories, languages, commit activity, and metadata from connected GitHub accounts."
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Section 2: Instructions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFEA]">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                2. System Directives & Instructions
              </h3>
              <p className="text-xs text-[#626873]">
                Guidelines, reasoning strategy, and execution constraints given to the model.
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={5}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs font-mono text-[#111318] placeholder:text-[#8B919B] outline-none leading-relaxed resize-y"
            />
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#8B919B]">
              <Info className="w-3.5 h-3.5 text-[#8B919B]" />
              <span>Directives instruct the model how to reason, what tools to call, and how to format responses.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Model Selector & Temperature */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFEA]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3B82F6] border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                3. Model Provider & Reasoning Parameters
              </h3>
              <p className="text-xs text-[#626873]">
                Choose the underlying intelligence provider and configure creativity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {modelOptions.map((opt) => {
              const isSelected = modelProvider === opt.provider && modelName === opt.modelName;
              return (
                <div
                  key={opt.modelName}
                  onClick={() => {
                    setModelProvider(opt.provider);
                    setModelName(opt.modelName);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#6D4AFF]/5 border-[#6D4AFF] ring-1 ring-[#6D4AFF]/20 shadow-xs'
                      : 'bg-[#FAFAF8] border-[#E5E5E2] hover:bg-white hover:border-[#D4D4CE]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E2] flex items-center justify-center shadow-xs">
                          <BrandLogo brand={opt.provider} size={16} />
                        </div>
                        <span className="text-xs font-bold text-[#111318]">{opt.name}</span>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#6D4AFF] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#626873] leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Temperature Slider */}
          <div className="pt-4 border-t border-[#EFEFEA] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#111318] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>Temperature: {temperature.toFixed(2)}</span>
              </label>
              <span className="text-[11px] text-[#8B919B]">
                {temperature <= 0.3 ? 'Deterministic & Exact' : temperature <= 0.7 ? 'Balanced Analysis' : 'Creative & Exploratory'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#6D4AFF] cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: Execution Limits */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFEA]">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                4. Execution Limits & Guardrails
              </h3>
              <p className="text-xs text-[#626873]">
                Prevent runaway executions, token spikes, and infinite reasoning loops.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <label className="block text-xs font-bold text-[#111318] mb-1">
                Maximum Reasoning Steps
              </label>
              <p className="text-[11px] text-[#626873] mb-2.5">
                Maximum tool call iterations allowed per execution run (1–30).
              </p>
              <input
                type="number"
                min={1}
                max={30}
                value={maxSteps}
                onChange={(e) => setMaxSteps(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-8 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <label className="block text-xs font-bold text-[#111318] mb-1">
                Maximum Runtime Timeout (Seconds)
              </label>
              <p className="text-[11px] text-[#626873] mb-2.5">
                Hard execution timeout boundary before halting (30–600s).
              </p>
              <input
                type="number"
                min={30}
                max={600}
                value={maxRuntimeSeconds}
                onChange={(e) => setMaxRuntimeSeconds(Math.max(30, parseInt(e.target.value) || 30))}
                className="w-full h-8 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Tool & Capability Permissions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFEFEA]">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                5. Granular Tool Permissions
              </h3>
              <p className="text-xs text-[#626873]">
                Explicitly grant the capabilities this agent is authorized to invoke at runtime.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {availableConnectorsWithCapabilities.map((group) => {
              const isConnected = activeConnections.includes(group.connectorId);

              return (
                <div key={group.connectorId} className="border border-[#E5E5E2] rounded-xl overflow-hidden bg-[#FAFAF8]">
                  <div className="p-3.5 bg-white border-b border-[#E5E5E2] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
                        <BrandLogo brand={group.brand} size={14} />
                      </div>
                      <span className="text-xs font-bold text-[#111318]">{group.connectorName}</span>
                    </div>

                    {isConnected ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected in Workspace
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                        Not Connected
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 flex flex-col gap-2.5">
                    {group.capabilities.map((cap) => {
                      const isChecked = Boolean(selectedCapabilities[cap.id]);

                      return (
                        <label
                          key={cap.id}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                            !cap.implemented
                              ? 'opacity-60 bg-white border-[#EFEFEA] cursor-not-allowed'
                              : isChecked
                              ? 'bg-purple-50/50 border-[#6D4AFF]/40'
                              : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              disabled={!cap.implemented}
                              checked={isChecked && cap.implemented}
                              onChange={() => toggleCapability(cap.id)}
                              className="mt-0.5 accent-[#6D4AFF] rounded cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#111318] flex items-center gap-2">
                                <span>{cap.name}</span>
                                <span className="text-[10px] font-mono text-[#8B919B]">({cap.id})</span>
                              </div>
                              <p className="text-[11px] text-[#626873] leading-relaxed mt-0.5">
                                {cap.description}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                            cap.implemented ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#FAFAF8] text-[#8B919B] border border-[#EFEFEA]'
                          }`}>
                            {cap.implemented ? 'Available' : 'Coming Soon'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Status */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-5">
          <h3 className="text-base font-bold text-[#111318] pb-4 border-b border-[#EFEFEA]">
            6. Agent Status
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStatus('active')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-[#FAFAF8] text-[#626873] border-[#E5E5E2] hover:bg-white'
              }`}
            >
              Active (Ready to Execute)
            </button>
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                status === 'draft'
                  ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-200'
                  : 'bg-[#FAFAF8] text-[#626873] border-[#E5E5E2] hover:bg-white'
              }`}
            >
              Draft (Testing & Setup)
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => setStatus('paused')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  status === 'paused'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-[#FAFAF8] text-[#626873] border-[#E5E5E2] hover:bg-white'
                }`}
              >
                Paused
              </button>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EFEFEA]">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/app/agents')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="md"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Saving Agent...' : editId ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
};
