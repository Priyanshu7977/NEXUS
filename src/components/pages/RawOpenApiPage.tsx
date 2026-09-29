import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import openApiSpec from '../../api/v1/openapi.json';
import { 
  Copy, 
  Check, 
  Download, 
  ArrowLeft, 
  CheckCircle2,
  FileJson
} from 'lucide-react';

export const RawOpenApiPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const jsonString = JSON.stringify(openApiSpec, null, 2);

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

  return (
    <div className="min-h-screen bg-[#0E1015] text-[#E5E5E2] font-mono flex flex-col selection:bg-[#6D4AFF] selection:text-white">
      {/* Developer Top Bar */}
      <header className="sticky top-0 z-50 bg-[#16181F]/90 backdrop-blur-md border-b border-[#242833] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/developers"
            className="inline-flex items-center gap-1.5 text-xs text-[#8B919B] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[#20242E]"
            title="Return to Developers Documentation"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Developers</span>
          </Link>
          <span className="text-[#363B48]">/</span>
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#8C6BFF]" />
            <span className="text-xs font-semibold text-white tracking-wide">openapi.json</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#20242E] text-[#8C6BFF] border border-[#2F3544]">
              OpenAPI 3.1.0
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center p-0.5 bg-[#0E1015] border border-[#242833] rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('formatted')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'formatted'
                  ? 'bg-[#20242E] text-white font-medium shadow-2xs'
                  : 'text-[#8B919B] hover:text-white'
              }`}
            >
              Pretty
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'raw'
                  ? 'bg-[#20242E] text-white font-medium shadow-2xs'
                  : 'text-[#8B919B] hover:text-white'
              }`}
            >
              Strict Raw
            </button>
          </div>

          {/* Copy Spec Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20242E] hover:bg-[#2A303D] text-xs font-semibold text-white border border-[#2F3544] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8B919B]" />
                <span>Copy Spec</span>
              </>
            )}
          </button>

          {/* Download JSON Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4AFF] hover:bg-[#5E3CE6] text-xs font-semibold text-white shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </header>

      {/* Main Spec Content Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {viewMode === 'raw' ? (
          <pre className="m-0 p-4 rounded-xl bg-[#090A0D] border border-[#20242E] text-xs leading-relaxed text-[#A4ABB8] font-mono select-all whitespace-pre-wrap break-all overflow-x-auto">
            {jsonString}
          </pre>
        ) : (
          <div className="space-y-4">
            {/* Spec Metadata Card */}
            <div className="p-4 rounded-xl bg-[#16181F] border border-[#242833] flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white tracking-wide">
                    {openApiSpec.info.title}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    v{openApiSpec.info.version}
                  </span>
                </div>
                <p className="text-xs text-[#8B919B] max-w-3xl leading-relaxed">
                  {openApiSpec.info.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8B919B]">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OAS 3.1.0 Valid</span>
                </div>
                <span>•</span>
                <div>
                  Paths: <span className="text-white font-semibold">{Object.keys(openApiSpec.paths).length}</span>
                </div>
                <span>•</span>
                <div>
                  Schemas: <span className="text-white font-semibold">{Object.keys(openApiSpec.components.schemas).length}</span>
                </div>
              </div>
            </div>

            {/* Spec JSON Code Container */}
            <div className="relative rounded-xl bg-[#090A0D] border border-[#20242E] overflow-hidden">
              <div className="px-4 py-2 bg-[#12141A] border-b border-[#20242E] flex items-center justify-between text-[11px] text-[#626873]">
                <span>application/json (pure, non-wrapped)</span>
                <span>{jsonString.split('\n').length} lines • {(new Blob([jsonString]).size / 1024).toFixed(1)} KB</span>
              </div>
              <pre className="m-0 p-4 text-xs leading-relaxed text-[#A4ABB8] font-mono select-all whitespace-pre-wrap break-all overflow-x-auto max-h-[calc(100vh-14rem)] overflow-y-auto">
                {jsonString}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RawOpenApiPage;
