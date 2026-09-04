import React, { useState, useEffect } from 'react';
import { ConnectorConnection } from '../../types/database';
import { VercelProject } from '../../types/deployment';
import { getVercelProjects } from '../../services/vercelService';
import {
  X,
  Search,
  Globe,
  ExternalLink,
  RefreshCw,
  Loader2,
  FolderGit2,
  AlertCircle,
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface VercelProjectsModalProps {
  isOpen: boolean;
  connection: ConnectorConnection;
  onClose: () => void;
}

export const VercelProjectsModal: React.FC<VercelProjectsModalProps> = ({
  isOpen,
  connection,
  onClose,
}) => {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVercelProjects(connection);
      if (res.error) {
        setError(res.error);
      } else {
        setProjects(res.projects);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Vercel projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, connection.id]);

  if (!isOpen) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.framework || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.link?.repo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-2xl w-full overflow-hidden text-left flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
              <BrandLogo brand="vercel" size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                Vercel Projects
              </h3>
              <p className="text-xs text-[#626873]">
                Connected Account: <span className="font-semibold text-[#111318]">{connection.provider_account_name}</span> ({projects.length} projects discovered)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8B919B] hover:text-[#111318] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-[#EFEFEA] flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, framework, or linked repo..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF]"
            />
          </div>

          <button
            onClick={loadProjects}
            disabled={loading}
            className="p-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] hover:bg-[#F2F2EE] text-[#626873] hover:text-[#111318] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Projects List */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-3">
          {error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Failed to load projects</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-xs text-[#8B919B] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#6D4AFF]" />
              <span>Fetching projects from Vercel API...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8B919B]">
              No matching Vercel projects found.
            </div>
          ) : (
            filtered.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-[#111318]">
                      {proj.name}
                    </h4>
                    {proj.framework && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#626873] border border-[#E5E5E2] uppercase font-semibold">
                        {proj.framework}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#8B919B]">
                    {proj.link?.repo && (
                      <span className="flex items-center gap-1 font-mono text-[#626873]">
                        <FolderGit2 className="w-3 h-3 text-[#6D4AFF]" />
                        {proj.link.repo}
                      </span>
                    )}
                    {proj.latestDeployments?.[0]?.url && (
                      <a
                        href={proj.latestDeployments[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#6D4AFF] hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        Live URL
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
                    {proj.latestDeployments?.[0]?.readyState || 'READY'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between text-xs text-[#8B919B]">
          <span>
            Capability: <span className="font-mono text-[#111318]">vercel.deployments.create</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#111318] hover:bg-[#F2F2EE] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
