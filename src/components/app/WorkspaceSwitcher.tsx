import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Building2, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setCreateError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await createWorkspace(newWsName.trim());
      if (res.workspace) {
        setNewWsName('');
        setIsCreating(false);
        setIsOpen(false);
      } else {
        setCreateError(res.error || 'Could not create workspace');
      }
    } catch {
      setCreateError('Failed to create workspace');
    } finally {
      setCreateLoading(false);
    }
  };

  const displayName = currentWorkspace?.name || 'Personal Workspace';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FAFAF8] hover:bg-[#F4F4F0] border border-[#E5E5E2] transition-all text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center font-bold text-xs shrink-0 uppercase">
            {displayName.charAt(0)}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-[#111318] truncate">
              {displayName}
            </div>
            <div className="text-[10px] font-mono text-[#8B919B] uppercase">
              {currentWorkspace?.role || 'DEVELOPER'} PLAN
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-[#8B919B] group-hover:text-[#111318] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-xl bg-white border border-[#E5E5E2] shadow-[0_12px_32px_rgba(0,0,0,0.08)] z-50 text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8B919B]">
            Workspaces ({workspaces.length})
          </div>

          <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              const isPersonal = ws.name.toLowerCase().includes('personal') || ws.name.includes("'s Workspace");
              const Icon = isPersonal ? User : Building2;

              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#6D4AFF]/10 text-[#6D4AFF] font-semibold'
                      : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#8B919B]" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Create Workspace Form */}
          <div className="pt-1 mt-1 border-t border-[#EFEFEA]">
            {isCreating ? (
              <form onSubmit={handleCreateSubmit} className="p-1.5 flex flex-col gap-2">
                <input
                  type="text"
                  autoFocus
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Workspace name..."
                  className="w-full h-8 px-2 rounded-md bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none focus:border-[#6D4AFF]"
                />
                {createError && (
                  <span className="text-[10px] text-red-500 font-mono">{createError}</span>
                )}
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setCreateError('');
                    }}
                    className="px-2 py-1 rounded text-[11px] text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !newWsName.trim()}
                    className="px-2.5 py-1 rounded bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {createLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8B919B]" />
                <span>Create workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
