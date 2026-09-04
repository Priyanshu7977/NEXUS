import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Bot,
  GitFork,
  Cpu,
  Radio,
  Cable,
  ExternalLink,
} from 'lucide-react';
import {
  MarketplaceResource,
  MarketplaceInstallation,
  DependencyCheckResult,
} from '../../types/marketplace';
import {
  checkResourceDependencies,
  installMarketplaceResource,
} from '../../services/marketplaceService';

interface InstallResourceModalProps {
  isOpen: boolean;
  resource: MarketplaceResource | null;
  workspaceId: string;
  onClose: () => void;
  onInstalled?: (installation: MarketplaceInstallation) => void;
}

export const InstallResourceModal: React.FC<InstallResourceModalProps> = ({
  isOpen,
  resource,
  workspaceId,
  onClose,
  onInstalled,
}) => {
  const navigate = useNavigate();
  const [customName, setCustomName] = useState('');
  const [checkingDeps, setCheckingDeps] = useState(false);
  const [depResult, setDepResult] = useState<DependencyCheckResult | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedData, setInstalledData] = useState<MarketplaceInstallation | null>(null);

  useEffect(() => {
    if (isOpen && resource) {
      setCustomName(resource.name);
      setInstallError(null);
      setInstalledData(null);
      checkDependencies();
    }
  }, [isOpen, resource, workspaceId]);

  if (!isOpen || !resource) return null;

  const checkDependencies = async () => {
    setCheckingDeps(true);
    try {
      const result = await checkResourceDependencies(workspaceId, resource.id);
      setDepResult(result);
    } catch (err: any) {
      console.error('Error checking dependencies:', err);
    } finally {
      setCheckingDeps(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    setInstallError(null);

    try {
      const res = await installMarketplaceResource({
        workspaceId,
        resourceId: resource.id,
        customName: customName.trim() || resource.name,
      });

      if (res.error || !res.installation) {
        setInstallError(res.error || 'Failed to install resource.');
      } else {
        setInstalledData(res.installation);
        if (onInstalled) {
          onInstalled(res.installation);
        }
      }
    } catch (err: any) {
      setInstallError(err.message || 'An unexpected error occurred during installation.');
    } finally {
      setInstalling(false);
    }
  };

  const handleNavigateToInstalled = () => {
    onClose();
    if (!installedData) return;

    if (resource.type === 'AGENT') {
      navigate(`/app/agents/${installedData.installed_resource_id || ''}`);
    } else if (resource.type === 'WORKFLOW') {
      navigate(`/app/workflows/${installedData.installed_resource_id || ''}`);
    } else if (resource.type === 'MCP_SERVER') {
      navigate('/app/mcp');
    } else if (resource.type === 'EXTERNAL_AGENT') {
      navigate('/app/a2a');
    } else if (resource.type === 'CONNECTOR') {
      navigate('/app/connectors');
    } else {
      navigate('/app/explore');
    }
  };

  const renderTypeIcon = () => {
    switch (resource.type) {
      case 'AGENT':
        return <Bot className="w-5 h-5 text-[#6D4AFF]" />;
      case 'WORKFLOW':
        return <GitFork className="w-5 h-5 text-indigo-600" />;
      case 'MCP_SERVER':
        return <Cpu className="w-5 h-5 text-emerald-600" />;
      case 'EXTERNAL_AGENT':
        return <Radio className="w-5 h-5 text-amber-600" />;
      case 'CONNECTOR':
      default:
        return <Cable className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FDFCFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
              {renderTypeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-950">{resource.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gray-100 text-gray-600 border border-gray-200">
                  v{resource.version}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Published by {resource.publisher?.name || 'NEXUS Community'}
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

        {/* Content Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
          {installedData ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">Successfully Installed!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  "{customName}" is now active in your workspace as an isolated instance.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Workspace:</span>
                  <span className="font-mono text-gray-800">{workspaceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Instance ID:</span>
                  <span className="font-mono text-gray-800">
                    {installedData.installed_resource_id || installedData.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-emerald-700 font-medium">Ready</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Target Instance Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Instance Name in Workspace
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all"
                  placeholder="e.g. Repository Code Analyst"
                />
              </div>

              {/* Dependency Status */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Required Dependencies & Connectors
                  </span>
                  {checkingDeps && (
                    <span className="text-xs text-gray-400">Verifying connections...</span>
                  )}
                </div>

                {resource.required_connectors.length === 0 ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Self-contained resource. No external connectors required.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {depResult?.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          item.satisfied
                            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                            : 'bg-amber-50/50 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.satisfied ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-[11px] text-gray-500">{item.description}</p>
                          </div>
                        </div>

                        {!item.satisfied && (
                          <a
                            href="/app/connectors"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors shrink-0"
                          >
                            <span>Connect</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Capabilities & Permissions Preview */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Capabilities & Sandboxed Permissions
                </span>
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(resource.required_capabilities || []).map((cap) => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white border border-gray-200 text-gray-700"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      Installs an isolated instance inside this workspace. External network egress
                      and tool execution are governed by your workspace security policies.
                    </span>
                  </div>
                </div>
              </div>

              {installError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{installError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {installedData ? (
            <div className="w-full flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200/70 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleNavigateToInstalled}
                className="px-4 py-2 text-xs font-medium bg-[#6D4AFF] hover:bg-[#5835E5] text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                <span>Open Resource</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={installing}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200/70 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleInstall}
                disabled={installing || (depResult !== null && !depResult.satisfied)}
                className="px-5 py-2.5 text-xs font-medium bg-gray-950 hover:bg-gray-800 text-white rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {installing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Provisioning Instance...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Install to Workspace</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
