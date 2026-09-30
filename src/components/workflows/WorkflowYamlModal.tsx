import React, { useState } from 'react';
import {
  X,
  FileCode,
  Copy,
  Check,
  Download,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';

interface WorkflowYamlModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName?: string;
  yamlContent?: string;
}

export const WorkflowYamlModal: React.FC<WorkflowYamlModalProps> = ({
  isOpen,
  onClose,
  workflowName = 'ci-orchestration',
  yamlContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultYaml = `version: "3.1"
metadata:
  name: "${workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
  title: "${workflowName}"
  description: "Enterprise automated multi-agent CI/CD and security verification pipeline"
  author: "NEXUS Platform Engineer"
  schema: "https://nexus-platform.io/schemas/workflow-v3.1.json"

trigger:
  type: github_webhook
  event: push
  branch: main
  filters:
    paths:
      - "src/**"
      - "package.json"

concurrency:
  max_runs: 3
  cancel_in_progress: true

pipeline:
  - id: code_agent
    name: Code Synthesizer Agent
    type: agent
    model: gemini-1.5-pro
    timeout: 300s
    config:
      temperature: 0.2
      directive: |
        Synthesize TypeScript AST changes, check architectural boundary constraints,
        and generate missing interface definitions.

  - id: test_agent
    name: Test Runner Agent
    type: agent
    needs: [code_agent]
    model: claude-3-5-sonnet
    timeout: 600s
    config:
      sandbox: ephemeral_node_20
      command: "npm test -- --coverage"

  - id: security_agent
    name: Security & RLS Auditor
    type: guardrail
    needs: [test_agent]
    model: gpt-4o
    config:
      audit_rls: true
      cve_scan: true
      zero_secrets: true

  - id: human_approval
    name: Release Gate Sign-off
    type: gate
    needs: [security_agent]
    config:
      channel: "#nexus-ci-deployments"
      require_role: "admin"
      timeout: 3600s

  - id: deploy_edge
    name: Edge Production Deployment
    type: action
    needs: [human_approval]
    config:
      target: vercel_production
      health_check: "https://nexus-app.io/api/health"
      rollback_on_failure: true`;

  const content = yamlContent || defaultYaml;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.nexus.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#161922] border border-white/10 rounded-2xl shadow-2xl text-left overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181A21]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">YAML DAG Specification</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SCHEMA 3.1 VALID
                </span>
              </div>
              <p className="text-xs text-[#9BA3AF]">Deterministic pipeline definition compatible with NEXUS CLI & CI runner</p>
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

        {/* Code Content */}
        <div className="p-4 bg-[#111318] overflow-y-auto flex-1 font-mono text-xs text-[#E5E7EB]">
          <div className="flex">
            {/* Line numbers */}
            <div className="select-none pr-4 text-right text-[#4B5563] border-r border-white/5 space-y-0.5 font-mono text-xs">
              {lines.map((_, i) => (
                <div key={i} className="leading-5">
                  {i + 1}
                </div>
              ))}
            </div>
            {/* YAML text */}
            <pre className="pl-4 overflow-x-auto text-[#A7F3D0] space-y-0.5 leading-5 font-mono">
              {content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/[0.08] bg-[#181A21]">
          <div className="text-xs text-[#9BA3AF] flex items-center gap-2">
            <span>Size: {lines.length} lines</span>
            <span>•</span>
            <span>Format: YAML (UTF-8)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#9BA3AF]" />
              <span>Download .yaml</span>
            </button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="px-4 py-1.5 text-xs font-semibold cursor-pointer shadow"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy YAML</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
