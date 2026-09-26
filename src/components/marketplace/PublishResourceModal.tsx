import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bot,
  GitFork,
  Cpu,
  Radio,
  Cable,
  Globe,
  Lock,
  EyeOff,
  Link,
} from 'lucide-react';
import {
  MarketplaceResourceType,
  MarketplaceVisibility,
  MarketplaceResource,
} from '../../types/marketplace';
import { publishMarketplaceResource } from '../../services/marketplaceService';
import { scanForSecrets } from '../../services/secretScanner';
import { getWorkspaceAgents } from '../../services/agentService';
import { getWorkflows } from '../../services/workflowService';
import { Agent } from '../../types/agent';
import { Workflow } from '../../types/workflow';
import { 
  detectPromptInjection, 
  isSafeExternalUrl, 
  sanitizeString, 
  workflowRateLimiter 
} from '../../security';

interface PublishResourceModalProps {
  isOpen: boolean;
  workspaceId: string;
  preselectedType?: MarketplaceResourceType;
  preselectedAgent?: Agent;
  preselectedWorkflow?: Workflow;
  onClose: () => void;
  onPublished?: (resource: MarketplaceResource) => void;
}

export const PublishResourceModal: React.FC<PublishResourceModalProps> = ({
  isOpen,
  workspaceId,
  preselectedType = 'AGENT',
  preselectedAgent,
  preselectedWorkflow,
  onClose,
  onPublished,
}) => {
  const [type, setType] = useState<MarketplaceResourceType>(preselectedType);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<MarketplaceVisibility>('PUBLIC');
  const [license, setLicense] = useState('MIT');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');

  // Categories & Tags
  const [categoryInput, setCategoryInput] = useState('Code & DevOps');
  const [tagsInput, setTagsInput] = useState('');
  const [requiredConnectorsInput, setRequiredConnectorsInput] = useState('');
  const [requiredCapabilitiesInput, setRequiredCapabilitiesInput] = useState('');

  // Workspace items for easy pre-filling
  const [workspaceAgents, setWorkspaceAgents] = useState<Agent[]>([]);
  const [workspaceWorkflows, setWorkspaceWorkflows] = useState<Workflow[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  // Scanning & Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secretViolations, setSecretViolations] = useState<any[]>([]);
  const [publishedResource, setPublishedResource] = useState<MarketplaceResource | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadWorkspaceItems();
      resetForm();
    }
  }, [isOpen, workspaceId]);

  const loadWorkspaceItems = async () => {
    try {
      const [agentsRes, wfRes] = await Promise.all([
        getWorkspaceAgents(workspaceId),
        getWorkflows(workspaceId),
      ]);
      setWorkspaceAgents(agentsRes.agents || []);
      setWorkspaceWorkflows(wfRes.workflows || []);
    } catch (err) {
      console.error('Failed to load workspace items:', err);
    }
  };

  const resetForm = () => {
    setErrorMsg(null);
    setSecretViolations([]);
    setPublishedResource(null);

    if (preselectedAgent) {
      setType('AGENT');
      setName(preselectedAgent.name);
      setSlug(preselectedAgent.slug || '');
      setSummary(preselectedAgent.description || '');
      setDescription(preselectedAgent.instructions || preselectedAgent.description || '');
      setSelectedSourceId(preselectedAgent.id);
      setCategoryInput('Code & DevOps');
      setTagsInput('agent, ai, autonomous');
      const connList = Array.from(
        new Set((preselectedAgent.tools || []).map((t) => t.connector_id))
      );
      setRequiredConnectorsInput(connList.join(', '));
      return;
    }

    if (preselectedWorkflow) {
      setType('WORKFLOW');
      setName(preselectedWorkflow.name);
      setSlug(preselectedWorkflow.slug || '');
      setSummary(preselectedWorkflow.description || '');
      setDescription(preselectedWorkflow.description || '');
      setSelectedSourceId(preselectedWorkflow.id);
      setCategoryInput('Code & DevOps');
      setTagsInput('workflow, pipeline, multi-agent');
      return;
    }

    setType(preselectedType);
    setName('');
    setSlug('');
    setVersion('1.0.0');
    setSummary('');
    setDescription('');
    setVisibility('PUBLIC');
    setLicense('MIT');
    setCategoryInput('Code & DevOps');
    setTagsInput('');
    setRequiredConnectorsInput('');
    setRequiredCapabilitiesInput('');
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    if (!sourceId) return;

    if (type === 'AGENT') {
      const agent = workspaceAgents.find((a) => a.id === sourceId);
      if (agent) {
        setName(agent.name);
        setSlug(agent.slug || agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        setSummary(agent.description || '');
        setDescription(agent.instructions || agent.description || '');
        const connList = Array.from(
          new Set((agent.tools || []).map((t) => t.connector_id))
        );
        setRequiredConnectorsInput(connList.join(', '));
        setRequiredCapabilitiesInput('code_analysis, tool_calling');
      }
    } else if (type === 'WORKFLOW') {
      const wf = workspaceWorkflows.find((w) => w.id === sourceId);
      if (wf) {
        setName(wf.name);
        setSlug(wf.slug || wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        setSummary(wf.description || '');
        setDescription(wf.description || '');
        setRequiredConnectorsInput('github, vercel');
        setRequiredCapabilitiesInput('multi_agent_orchestration');
      }
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSecretViolations([]);

    // 1. Client-Side Rate Limiting Check
    const rateCheck = workflowRateLimiter.check(workspaceId || 'client_session', 5, 60000);
    if (!rateCheck.allowed) {
      setErrorMsg(`Publish rate limit reached. Please wait ${rateCheck.retryAfterSeconds || 60}s before attempting again.`);
      return;
    }

    // 2. Client-Side Anti-SSRF URL Validation
    if (documentationUrl.trim() && !isSafeExternalUrl(documentationUrl.trim())) {
      setErrorMsg('Security Validation: Documentation URL must be a valid public HTTP or HTTPS web address and cannot reference local or internal networks.');
      return;
    }
    if (repositoryUrl.trim() && !isSafeExternalUrl(repositoryUrl.trim())) {
      setErrorMsg('Security Validation: Repository URL must be a valid public HTTP or HTTPS web address and cannot reference local or internal networks.');
      return;
    }

    // 3. Client-Side Secret & Credential Scanning
    const candidatePayload = {
      name,
      summary,
      description,
      requiredConnectors: requiredConnectorsInput,
      documentationUrl,
      repositoryUrl,
    };

    const scanResult = scanForSecrets(candidatePayload);
    if (scanResult.hasSecrets) {
      setErrorMsg('Secret Scanner Alert: Hardcoded credentials or private keys detected.');
      setSecretViolations(scanResult.violations);
      return;
    }

    // Build spec
    let spec: Record<string, any> = {};
    if (type === 'AGENT' && selectedSourceId) {
      const agent = workspaceAgents.find((a) => a.id === selectedSourceId);
      if (agent) {
        spec = {
          model: agent.model_name || 'gemini-1.5-pro',
          temperature: agent.temperature || 0.2,
          instructions: agent.instructions,
          tools: (agent.tools || []).map((t) => t.capability),
        };
      }
    } else if (type === 'WORKFLOW' && selectedSourceId) {
      const wf = workspaceWorkflows.find((w) => w.id === selectedSourceId);
      if (wf) {
        spec = {
          trigger_type: wf.trigger_type || 'MANUAL',
          nodes: wf.nodes || [],
          edges: wf.edges || [],
        };
      }
    }

    // 4. Client-Side AI Security Shield: Adversarial Prompt Injection & Jailbreak Defense
    const contentToScan = `${name}\n${summary}\n${description}\n${JSON.stringify(spec)}`;
    const injectionScan = detectPromptInjection(contentToScan);
    if (!injectionScan.safe) {
      const violationDetails = injectionScan.violations.map((v) => v.description).join('; ');
      setErrorMsg(`AI Security Shield Alert: Publication blocked due to potential prompt injection, delimiter smuggling, or adversarial safety policy violation (${violationDetails}).`);
      return;
    }

    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => sanitizeString(t.trim(), 40))
      .filter((t) => t.length > 0);

    const requiredConnectors = requiredConnectorsInput
      .split(',')
      .map((c) => sanitizeString(c.trim().toLowerCase(), 40))
      .filter((c) => c.length > 0);

    const requiredCapabilities = requiredCapabilitiesInput
      .split(',')
      .map((c) => sanitizeString(c.trim().toLowerCase(), 40))
      .filter((c) => c.length > 0);

    const res = await publishMarketplaceResource({
      workspaceId,
      type,
      name: sanitizeString(name, 100),
      slug: sanitizeString(slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 80),
      summary: sanitizeString(summary, 500),
      description: sanitizeString(description, 10000),
      version: sanitizeString(version, 20),
      visibility,
      spec,
      requiredConnectors,
      requiredCapabilities,
      tags,
      categories: [categoryInput],
      license: sanitizeString(license, 50),
      documentationUrl: documentationUrl.trim() || null,
      repositoryUrl: repositoryUrl.trim() || null,
    });

    setSubmitting(false);

    if (res.error || !res.resource) {
      setErrorMsg(res.error || 'Failed to publish resource.');
      if (res.secretViolations) {
        setSecretViolations(res.secretViolations);
      }
    } else {
      setPublishedResource(res.resource);
      if (onPublished) {
        onPublished(res.resource);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FDFCFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <UploadCloud className="w-5 h-5 text-[#6D4AFF]" />
            </div>
            <div>
              <h3 className="font-medium text-gray-950">Publish to NEXUS Ecosystem</h3>
              <p className="text-xs text-gray-500">
                Share your agent, connector, or workflow template with your team or the community.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1 text-sm text-gray-700">
          {publishedResource ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-900">Resource Published!</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1.5">
                  "{publishedResource.name}" is now live in the NEXUS discovery directory with{' '}
                  <span className="font-semibold text-gray-800">{publishedResource.visibility}</span>{' '}
                  visibility.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-500">Identifier Slug:</span>
                  <span className="font-mono text-[#6D4AFF] font-medium">{publishedResource.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-mono text-gray-800">v{publishedResource.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sandbox Safety:</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Passed Secret Scan & Isolation Validation
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <a
                  href={`/explore/${publishedResource.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 text-xs font-medium bg-[#6D4AFF] hover:bg-[#5835E5] text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span>View in Discovery Directory</span>
                  <Link className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Resource Type
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'AGENT', label: 'Agent', icon: Bot },
                    { id: 'WORKFLOW', label: 'Workflow', icon: GitFork },
                    { id: 'CONNECTOR', label: 'Connector', icon: Cable },
                    { id: 'MCP_SERVER', label: 'MCP Server', icon: Cpu },
                    { id: 'EXTERNAL_AGENT', label: 'A2A Agent', icon: Radio },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setType(t.id as MarketplaceResourceType);
                          setSelectedSourceId('');
                        }}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs ${
                          isSelected
                            ? 'border-[#6D4AFF] bg-purple-50/50 text-[#6D4AFF] font-medium shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Pre-fill Picker if Agent or Workflow */}
              {(type === 'AGENT' && workspaceAgents.length > 0) ||
              (type === 'WORKFLOW' && workspaceWorkflows.length > 0) ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Export From Existing Workspace {type === 'AGENT' ? 'Agent' : 'Workflow'}
                  </label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => handleSourceSelect(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  >
                    <option value="">-- Create from scratch or select --</option>
                    {type === 'AGENT'
                      ? workspaceAgents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.model_name || 'gemini'})
                          </option>
                        ))
                      : workspaceWorkflows.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                  </select>
                </div>
              ) : null}

              {/* Basic Details: Name & Slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Git Diff Reviewer"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Slug Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="git-diff-reviewer"
                    className="w-full px-3 py-2 font-mono border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
              </div>

              {/* Version & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Version (SemVer) *
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 font-mono border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  >
                    <option value="Code & DevOps">Code & DevOps</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Summary Headline * (10-140 chars)
                </label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Automated AST code diff inspection and security flaw scoring."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                />
              </div>

              {/* Detailed Description / Instructions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Description / Execution Directives
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe architecture, prerequisites, directives, and usage details..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] font-mono"
                />
              </div>

              {/* Dependencies & Capabilities */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Required Connectors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={requiredConnectorsInput}
                    onChange={(e) => setRequiredConnectorsInput(e.target.value)}
                    placeholder="github, vercel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="devops, security, ci-cd"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
              </div>

              {/* Documentation & Repository URLs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Documentation URL (optional)
                  </label>
                  <input
                    type="url"
                    value={documentationUrl}
                    onChange={(e) => setDocumentationUrl(e.target.value)}
                    placeholder="https://docs.nexus.build/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Repository URL (optional)
                  </label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF]"
                  />
                </div>
              </div>

              {/* Visibility Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Publishing Visibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'PUBLIC',
                      label: 'Public Directory',
                      desc: 'Visible in global explore catalog',
                      icon: Globe,
                    },
                    {
                      id: 'UNLISTED',
                      label: 'Unlisted Slug',
                      desc: 'Accessible only via direct slug link',
                      icon: EyeOff,
                    },
                    {
                      id: 'PRIVATE',
                      label: 'Private Workspace',
                      desc: 'Members of this workspace only',
                      icon: Lock,
                    },
                  ].map((v) => {
                    const Icon = v.icon;
                    const isSelected = visibility === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVisibility(v.id as MarketplaceVisibility)}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'border-[#6D4AFF] bg-purple-50/40 text-gray-900 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6D4AFF]' : 'text-gray-400'}`} />
                          <span className="text-xs font-medium">{v.label}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">{v.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secret Scanner Warnings */}
              {secretViolations.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Secret Scanner Block: Credentials Detected</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] font-mono">
                    {secretViolations.map((v, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">{v.rule}</span> at <span className="underline">{v.path}</span> ({v.maskedPreview})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-red-600 italic">
                    NEXUS forbids publishing active API tokens, private keys, or passwords. Please replace them with environment variable placeholders or remove them.
                  </p>
                </div>
              )}

              {errorMsg && !secretViolations.length && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Footer Button inside form */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Secret Scanning is enforced prior to publish.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-medium bg-[#6D4AFF] hover:bg-[#5835E5] text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Scanning & Publishing...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Publish Resource</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
