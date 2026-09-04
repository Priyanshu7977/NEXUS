export interface AgentModel {
  id: string;
  name: string;
  role: string;
  purpose: string;
  description: string;
  modelProvider: 'openai' | 'anthropic' | 'gemini';
  instructions: string;
  tools: string[];
  permissions: {
    workspaceAccess: 'none' | 'read' | 'full';
    serviceAccess: 'read_only' | 'read_write';
    externalActions: 'require_approval' | 'automatic';
  };
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nexus_agents_store';

export const getStoredAgents = (): AgentModel[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse agents from storage:', e);
  }
  return [];
};

export const saveAgent = (agent: AgentModel): void => {
  const current = getStoredAgents();
  const existingIdx = current.findIndex((a) => a.id === agent.id);
  if (existingIdx >= 0) {
    current[existingIdx] = agent;
  } else {
    current.unshift(agent);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save agent to storage:', e);
  }
};

export const getAgentById = (id: string): AgentModel | null => {
  const current = getStoredAgents();
  return current.find((a) => a.id === id) || null;
};
