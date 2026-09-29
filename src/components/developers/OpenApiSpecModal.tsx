import React, { useState, useMemo } from 'react';
import openApiSpec from '../../api/v1/openapi.json';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileCode, 
  Search, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  ShieldCheck,
  Code2
} from 'lucide-react';

interface OpenApiSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'endpoints' | 'schemas' | 'raw';

export const OpenApiSpecModal: React.FC<OpenApiSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('endpoints');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const jsonString = useMemo(() => JSON.stringify(openApiSpec, null, 2), []);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-openapi-3.1.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Extract endpoints from paths
  const endpoints = useMemo(() => {
    const list: {
      path: string;
      method: string;
      summary: string;
      description: string;
      parameters?: any[];
      requestBody?: any;
      responses?: any;
    }[] = [];

    const paths = openApiSpec.paths as Record<string, any>;
    for (const [pathKey, methods] of Object.entries(paths)) {
      for (const [methodKey, details] of Object.entries(methods as Record<string, any>)) {
        list.push({
          path: pathKey,
          method: methodKey.toUpperCase(),
          summary: details.summary || '',
          description: details.description || '',
          parameters: details.parameters,
          requestBody: details.requestBody,
          responses: details.responses,
        });
      }
    }
    return list;
  }, []);

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery.trim()) return endpoints;
    const q = searchQuery.toLowerCase();
    return endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q)
    );
  }, [endpoints, searchQuery]);

  const schemas = useMemo(() => {
    return (openApiSpec.components?.schemas || {}) as Record<string, any>;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-[#111318] border border-[#E5E5E2] dark:border-[#242833] rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E2] dark:border-[#242833] flex items-center justify-between gap-4 bg-[#FAFAF8] dark:bg-[#16181F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-[#6D4AFF]">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111318] dark:text-white">
                  OpenAPI 3.1.0 Specification
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  OAS 3.1 Valid
                </span>
                <span className="text-xs text-[#8B919B]">v{openApiSpec.info.version}</span>
              </div>
              <p className="text-xs text-[#626873] dark:text-[#8B919B] mt-0.5">
                Standard machine-readable API specification for tools, SDK generators, and automated orchestrators.
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#20242E] hover:bg-[#F2F2EE] dark:hover:bg-[#2A303D] text-xs font-semibold text-[#111318] dark:text-white border border-[#E5E5E2] dark:border-[#2F3544] transition-colors"
              title="Copy complete JSON specification"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8B919B]" />
                  <span>Copy Spec</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5E3CE6] text-xs font-semibold text-white shadow-2xs transition-colors"
              title="Download openapi.json file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#20242E] hover:bg-[#F2F2EE] dark:hover:bg-[#2A303D] text-xs font-semibold text-[#111318] dark:text-white border border-[#E5E5E2] dark:border-[#2F3544] transition-colors"
              title="Open raw static JSON in new browser tab"
            >
              <span>Raw Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B919B]" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B919B] hover:text-[#111318] dark:hover:text-white hover:bg-[#E5E5E2] dark:hover:bg-[#20242E] transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 py-2.5 border-b border-[#E5E5E2] dark:border-[#242833] flex items-center justify-between gap-4 bg-white dark:bg-[#111318]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('endpoints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'endpoints'
                  ? 'bg-[#111318] dark:bg-white text-white dark:text-[#111318]'
                  : 'text-[#626873] dark:text-[#8B919B] hover:text-[#111318] dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Endpoints ({endpoints.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schemas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'schemas'
                  ? 'bg-[#111318] dark:bg-white text-white dark:text-[#111318]'
                  : 'text-[#626873] dark:text-[#8B919B] hover:text-[#111318] dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Components & Schemas ({Object.keys(schemas).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'raw'
                  ? 'bg-[#111318] dark:bg-white text-white dark:text-[#111318]'
                  : 'text-[#626873] dark:text-[#8B919B] hover:text-[#111318] dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw JSON Spec</span>
            </button>
          </div>

          {activeTab === 'endpoints' && (
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B919B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter endpoints..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#FAFAF8] dark:bg-[#16181F] border border-[#E5E5E2] dark:border-[#242833] text-xs text-[#111318] dark:text-white outline-none focus:border-[#6D4AFF]"
              />
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              {filteredEndpoints.length === 0 ? (
                <div className="text-center py-12 text-[#8B919B] text-xs">
                  No endpoints matched &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredEndpoints.map((ep, idx) => {
                  const methodColor =
                    ep.method === 'GET'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                      : ep.method === 'POST'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800/60';

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E5E5E2] dark:border-[#242833] bg-[#FAFAF8] dark:bg-[#16181F] hover:border-[#D4D4CE] dark:hover:border-[#363B48] transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${methodColor}`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#111318] dark:text-white">
                            {ep.path}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-[#626873] dark:text-[#8B919B]">
                          {ep.summary}
                        </span>
                      </div>

                      <p className="text-xs text-[#626873] dark:text-[#A4ABB8] leading-relaxed mb-3">
                        {ep.description}
                      </p>

                      {/* Parameters / Responses info */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8B919B] pt-2 border-t border-[#E5E5E2] dark:border-[#242833]">
                        {ep.parameters && ep.parameters.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#111318] dark:text-white">Params:</span>
                            <span>{ep.parameters.map((p) => `${p.name} (${p.in})`).join(', ')}</span>
                          </div>
                        )}
                        {ep.responses && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#111318] dark:text-white">Responses:</span>
                            <span>{Object.keys(ep.responses).join(', ')}</span>
                          </div>
                        )}
                        <div className="ml-auto flex items-center gap-1 text-[#6D4AFF]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Bearer ApiKeyAuth</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SCHEMAS */}
          {activeTab === 'schemas' && (
            <div className="space-y-4">
              {Object.entries(schemas).map(([name, schema]: [string, any]) => (
                <div
                  key={name}
                  className="p-4 rounded-xl border border-[#E5E5E2] dark:border-[#242833] bg-[#FAFAF8] dark:bg-[#16181F]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#111318] dark:text-white">
                        {name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#20242E] text-[#8B919B] font-mono">
                        {schema.type || 'object'}
                      </span>
                    </div>
                    {schema.required && (
                      <span className="text-[10px] font-mono text-[#8B919B]">
                        Required: [{schema.required.join(', ')}]
                      </span>
                    )}
                  </div>

                  {schema.properties && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-[#E5E5E2] dark:border-[#242833] text-[#8B919B]">
                            <th className="pb-1.5 font-medium">Field</th>
                            <th className="pb-1.5 font-medium">Type</th>
                            <th className="pb-1.5 font-medium">Nullable / Enums</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5E2] dark:divide-[#242833] font-mono text-[11px]">
                          {Object.entries(schema.properties).map(([propKey, propVal]: [string, any]) => (
                            <tr key={propKey} className="text-[#111318] dark:text-[#E5E5E2]">
                              <td className="py-1.5 font-semibold text-[#6D4AFF]">{propKey}</td>
                              <td className="py-1.5 text-[#8B919B]">{propVal.type || 'any'}</td>
                              <td className="py-1.5 text-[#626873] dark:text-[#8B919B]">
                                {propVal.enum
                                  ? `enum [${propVal.enum.join(', ')}]`
                                  : propVal.nullable
                                  ? 'nullable'
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RAW JSON */}
          {activeTab === 'raw' && (
            <div className="relative rounded-xl bg-[#0E1015] border border-[#242833] overflow-hidden">
              <div className="px-4 py-2 bg-[#16181F] border-b border-[#242833] flex items-center justify-between text-xs text-[#8B919B] font-mono">
                <span>RFC-compliant pure OpenAPI 3.1.0 JSON</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="m-0 p-4 text-xs font-mono leading-relaxed text-[#A4ABB8] select-all whitespace-pre-wrap break-all max-h-[60vh] overflow-y-auto">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E5E5E2] dark:border-[#242833] bg-[#FAFAF8] dark:bg-[#16181F] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8B919B]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pure RFC OpenAPI 3.1.0 document. Compatible with Swagger, Postman, & Fern.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#626873] dark:text-[#8B919B]">GET /api/v1/openapi.json</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-[#E5E5E2] dark:bg-[#20242E] hover:bg-[#D4D4CE] dark:hover:bg-[#2A303D] text-[#111318] dark:text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
