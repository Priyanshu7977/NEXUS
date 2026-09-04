import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ConnectorConnection } from '../../types/database';
import { getWorkspaceConnections } from '../../services/connectorService';
import { getWorkspaceAgents, getAgentExecutions } from '../../services/agentService';
import { Agent, AgentExecution } from '../../types/agent';
import { 
  Cable, 
  Bot, 
  Network, 
  Activity, 
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Circle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, currentWorkspace } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectorConnection[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!currentWorkspace?.id) return;
      try {
        const [connRes, agentRes, execRes] = await Promise.all([
          getWorkspaceConnections(currentWorkspace.id),
          getWorkspaceAgents(currentWorkspace.id),
          getAgentExecutions(currentWorkspace.id),
        ]);
        setConnections(connRes.connections || []);
        setAgents(agentRes.agents || []);
        setExecutions(execRes.executions || []);
      } catch (err) {
        console.error('[NEXUS Dashboard] Error loading dashboard data:', err);
      }
    };
    loadData();
  }, [currentWorkspace?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';
  const connectedServicesCount = connections.filter((c) => c.status === 'connected').length;
  const githubConn = connections.find((c) => c.connector_id === 'github' && c.status === 'connected');

  const quickActions = [
    {
      title: 'Create an agent',
      description: 'Build specialized intelligence for a task.',
      icon: Bot,
      to: '/app/agents/new',
      color: 'text-[#6D4AFF]',
      bg: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Connect a service',
      description: 'Give your agents access to the tools they need.',
      icon: Cable,
      to: '/app/connectors',
      color: 'text-[#3B82F6]',
      bg: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Build a workflow',
      description: 'Combine agents and tools into a repeatable flow.',
      icon: Network,
      to: '/app/workflows/new',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    }
  ];

  // Guided onboarding steps
  const steps = [
    {
      number: '01',
      title: 'Create your first agent',
      description: 'Define prompt directives, permitted models, and execution boundaries.',
      status: 'current', // Initial current step
      to: '/app/agents/new'
    },
    {
      number: '02',
      title: 'Connect a service',
      description: 'Link your GitHub repositories, databases, or third-party APIs.',
      status: connectedServicesCount > 0 ? 'completed' : 'not_started',
      to: '/app/connectors'
    },
    {
      number: '03',
      title: 'Build a workflow',
      description: 'Construct a DAG linking event triggers, reasoning agents, and tool nodes.',
      status: 'not_started',
      to: '/app/workflows/new'
    },
    {
      number: '04',
      title: 'Run your first execution',
      description: 'Trigger a workflow manually or via webhooks and observe live state transitions.',
      status: 'not_started',
      to: '/app/workflows'
    },
    {
      number: '05',
      title: 'Review the result',
      description: 'Inspect execution traces, diff changes, and review human-in-the-loop gates.',
      status: 'not_started',
      to: '/app/activity'
    }
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header Greeting */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318] mb-1.5">
          {getGreeting()}, {firstName}.
        </h2>
        <p className="text-sm text-[#626873]">
          Here's what's happening across your workspace.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-3">
          Quick Actions
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.to)}
                className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl ${action.bg} ${action.color} border flex items-center justify-center mb-3.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#111318] mb-1 flex items-center justify-between">
                    <span>{action.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B919B] group-hover:text-[#111318] group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-xs text-[#626873] leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Status Area */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-3">
          Workspace Status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Connected Services */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Connected services</span>
                <Cable className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#111318] mb-1">
                {connectedServicesCount > 0 ? `${connectedServicesCount} Connected` : 'Not connected'}
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
              <span>{githubConn ? `@${githubConn.provider_account_name}` : '0 active integrations'}</span>
              <button
                onClick={() => navigate('/app/connectors')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer"
              >
                Manage →
              </button>
            </div>
          </div>

          {/* Agents */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Agents</span>
                <Bot className="w-4 h-4 text-[#6D4AFF]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#111318] mb-1">
                {agents.length > 0 ? `${agents.length} ${agents.length === 1 ? 'Agent' : 'Agents'}` : 'No agents yet'}
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
              <span>{agents.length > 0 ? `${agents.filter((a) => a.status === 'active').length} active workers` : '0 configured'}</span>
              <button
                onClick={() => navigate('/app/agents')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer"
              >
                View →
              </button>
            </div>
          </div>

          {/* Workflows */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Workflows</span>
                <Network className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#111318] mb-1">
                No workflows yet
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
              <span>0 active pipelines</span>
              <button
                onClick={() => navigate('/app/workflows/new')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer"
              >
                Build →
              </button>
            </div>
          </div>

          {/* Recent Executions */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Recent executions</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#111318] mb-1">
                {executions.length > 0 ? `${executions.length} ${executions.length === 1 ? 'Execution' : 'Executions'}` : 'No executions yet'}
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
              <span>{executions.length > 0 ? `${executions.filter((e) => e.status === 'completed').length} completed` : '0 runs'}</span>
              <button
                onClick={() => navigate('/app/activity')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer"
              >
                Logs →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guided Component */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#111318] mb-1">
              Get started with NEXUS
            </h3>
            <p className="text-xs text-[#626873]">
              Follow these foundation steps to compose your first autonomous agent pipeline.
            </p>
          </div>
          <div className="text-xs font-mono text-[#8B919B]">
            {connectedServicesCount > 0 ? '1 of 5 completed' : '0 of 5 completed'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.number}
                onClick={() => navigate(step.to)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isCurrent
                    ? 'bg-[#6D4AFF]/5 border-[#6D4AFF]/40 ring-1 ring-[#6D4AFF]/20'
                    : 'bg-[#FAFAF8] border-[#E5E5E2] hover:bg-white hover:border-[#D4D4CE]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-[#8B919B]">
                      {step.number}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6D4AFF] bg-purple-100 px-1.5 py-0.5 rounded">
                        <CircleDot className="w-3 h-3" /> Current
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#8B919B]">
                        <Circle className="w-3 h-3" /> Not started
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#111318] mb-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#626873] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Genuine Empty State */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-3">
          Recent Activity
        </div>
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E5E2] text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-3.5">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#111318] mb-1">
            No activity yet.
          </h4>
          <p className="text-xs text-[#626873] max-w-sm mb-6 leading-relaxed">
            Your agent and workflow activity will appear here once you run your first execution.
          </p>
          <Button size="md" onClick={() => navigate('/app/workflows/new')} withArrow>
            Create your first workflow
          </Button>
        </div>
      </div>
    </div>
  );
};
