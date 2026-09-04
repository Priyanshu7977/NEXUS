import React, { useState, useEffect } from 'react';
import { ConnectorConnection } from '../../types/database';
import { RepositoryItem } from '../../types/connector';
import { getRepositoriesForConnection } from '../../services/connectorService';
import { 
  X, 
  Search, 
  GitFork, 
  Star, 
  Lock, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  GitBranch,
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface RepositoryListModalProps {
  isOpen: boolean;
  connection: ConnectorConnection;
  onClose: () => void;
}

export const RepositoryListModal: React.FC<RepositoryListModalProps> = ({
  isOpen,
  connection,
  onClose,
}) => {
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  const loadRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRepositoriesForConnection(connection);
      if (res.error) {
        setError(res.error);
      } else {
        setRepositories(res.repositories);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRepositories();
    }
  }, [isOpen, connection.id]);

  if (!isOpen) return null;

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all' ||
      (filterType === 'public' && !repo.private) ||
      (filterType === 'private' && repo.private);

    return matchesSearch && matchesType;
  });

  const formatUpdatedDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white border border-[#E5E5E2] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-left flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#EFEFEA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
              <BrandLogo brand="github" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111318]">
                  GitHub Repositories
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#FAFAF8] border border-[#E5E5E2] text-[11px] font-mono text-[#626873]">
                  @{connection.provider_account_name}
                </span>
              </div>
              <p className="text-xs text-[#626873]">
                {loading ? 'Fetching repositories from GitHub API...' : `${repositories.length} accessible repositories`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadRepositories}
              disabled={loading}
              title="Refresh repository list"
              className="p-2 rounded-xl text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8B919B] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#FAFAF8] border-b border-[#EFEFEA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by repository name, language, or description..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E5E2]">
            {(['all', 'public', 'private'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterType === type
                    ? 'bg-[#111318] text-white shadow-sm'
                    : 'text-[#626873] hover:text-[#111318]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Repository Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#6D4AFF] animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#626873]">Querying GitHub API for workspace repositories...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Could not retrieve repositories</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && filteredRepos.length === 0 && (
            <div className="py-16 text-center">
              <FolderGit2 className="w-10 h-10 text-[#8B919B] mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-semibold text-[#111318] mb-1">
                No repositories found
              </h4>
              <p className="text-xs text-[#626873] max-w-sm mx-auto">
                {searchQuery
                  ? `No repositories matched "${searchQuery}". Try adjusting your search query or filter.`
                  : 'No repositories were returned for this connected GitHub account.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="p-4 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#111318] hover:text-[#6D4AFF] transition-colors truncate flex items-center gap-1 group"
                  >
                    <span>{repo.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8B919B] group-hover:text-[#6D4AFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {repo.private ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Globe className="w-2.5 h-2.5" /> Public
                    </span>
                  )}
                </div>

                {repo.description ? (
                  <p className="text-xs text-[#626873] line-clamp-1 mb-2">
                    {repo.description}
                  </p>
                ) : (
                  <p className="text-xs text-[#8B919B] italic line-clamp-1 mb-2">
                    No description provided
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-[#8B919B] flex-wrap">
                  {repo.language && (
                    <span className="flex items-center gap-1.5 font-medium text-[#626873]">
                      <span className="w-2 h-2 rounded-full bg-[#6D4AFF]" />
                      {repo.language}
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-[#8B919B]" />
                    <span className="font-mono">{repo.default_branch}</span>
                  </span>

                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {repo.stargazers_count}
                    </span>
                  )}

                  {repo.forks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-[#8B919B]" />
                      {repo.forks_count}
                    </span>
                  )}

                  <span>Updated {formatUpdatedDate(repo.updated_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#111318] bg-[#FAFAF8] hover:bg-[#F4F4F0] border border-[#E5E5E2] transition-colors flex items-center gap-1.5"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3 text-[#8B919B]" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAF8] border-t border-[#EFEFEA] flex items-center justify-between text-xs text-[#8B919B]">
          <span>Protected under workspace RLS policy</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white text-[#111318] hover:bg-[#F4F4F0] border border-[#E5E5E2] font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
