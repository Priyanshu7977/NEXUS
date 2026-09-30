import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Lock,
  Cpu
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { saveCustomApiKey, getCustomApiKey, getProviderStatusMap } from '../../ai/modelRegistry';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderKeyConfig {
  id: string;
  name: string;
  brand: string;
  badge: string;
  docUrl: string;
  placeholder: string;
  recommendedModel: string;
}

const PROVIDERS_LIST: ProviderKeyConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    brand: 'openai',
    badge: 'GPT-4o & o1 Reasoning',
    docUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-proj-...',
    recommendedModel: 'gpt-4o',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    brand: 'anthropic',
    badge: 'Claude 3.5 Sonnet (Coding)',
    docUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-api03-...',
    recommendedModel: 'claude-3-5-sonnet-20241022',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    brand: 'google',
    badge: 'Gemini 1.5 Pro (2M Context)',
    docUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSy...',
    recommendedModel: 'gemini-1.5-pro',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    brand: 'deepseek',
    badge: 'DeepSeek-R1 (Zero-Trust Audit)',
    docUrl: 'https://platform.deepseek.com/api_keys',
    placeholder: 'sk-deepseek-...',
    recommendedModel: 'deepseek-reasoner',
  },
  {
    id: 'groq',
    name: 'Groq LPUs',
    brand: 'groq',
    badge: 'Llama 3.3 (500+ tok/s)',
    docUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
    recommendedModel: 'llama-3.3-70b-versatile',
  },
];

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialKeys: Record<string, string> = {};
      PROVIDERS_LIST.forEach((p) => {
        initialKeys[p.id] = getCustomApiKey(p.id);
      });
      setKeys(initialKeys);
      setStatusMap(getProviderStatusMap());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (providerId: string, value: string) => {
    setKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeyMap((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleSaveAll = () => {
    Object.entries(keys).forEach(([providerId, keyValue]) => {
      saveCustomApiKey(providerId, keyValue);
    });
    setStatusMap(getProviderStatusMap());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#161922] border border-white/10 rounded-2xl shadow-2xl text-left overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181A21]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Universal AI API Key Vault</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> CLIENT-SIDE ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-[#9BA3AF]">Bring Your Own Key (BYOK) — direct provider access with 0% token markup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="px-6 py-2.5 bg-[#12141C] border-b border-white/[0.06] flex items-center gap-2 text-xs text-[#9BA3AF]">
          <Cpu className="w-4 h-4 text-[#6D4AFF] shrink-0" />
          <span>
            API keys are saved in your local browser sandbox and transmitted directly to model providers via HTTPS. They are never sent to NEXUS servers.
          </span>
        </div>

        {/* Keys List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {PROVIDERS_LIST.map((provider) => {
            const isConfigured = statusMap[provider.id] || Boolean(keys[provider.id]?.trim());
            const isShowing = showKeyMap[provider.id];

            return (
              <div
                key={provider.id}
                className="p-4 rounded-xl bg-[#1B1E28] border border-white/10 hover:border-white/20 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      <BrandLogo brand={provider.brand} size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{provider.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#A78BFA] border border-white/10">
                          {provider.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Key Needed
                      </span>
                    )}

                    <a
                      href={provider.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#9BA3AF] hover:text-white flex items-center gap-0.5 ml-1 transition-colors"
                      title="Get API Key"
                    >
                      <span>Get Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Key Input */}
                <div className="relative mt-2">
                  <input
                    type={isShowing ? 'text' : 'password'}
                    value={keys[provider.id] || ''}
                    onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full px-3 py-2 pr-10 bg-[#14161F] border border-white/10 rounded-lg text-xs font-mono text-white placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(provider.id)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B919B] hover:text-white transition-colors cursor-pointer"
                  >
                    {isShowing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#181A21]">
          <div className="text-xs text-[#9BA3AF] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Configuring keys enables real live model generations across all pages.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              size="sm"
              onClick={handleSaveAll}
              className="px-5 py-2 text-xs font-semibold cursor-pointer shadow-lg"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Vault Saved!</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 mr-1" />
                  <span>Save Keys</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
