import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { 
  ShieldCheck, 
  Key, 
  UserCheck, 
  Lock, 
  Eye, 
  Check, 
  X, 
  Circle, 
  Info,
  Cpu,
  Fingerprint,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

const AI_SHIELD_MODULES = [
  {
    title: 'Adversarial Prompt Injection Defense',
    status: 'Active Shield',
    description: 'Pre-flight multi-heuristic and regex filters intercept direct prompt injections, jailbreak roleplays, and encoded bypass payloads before execution.',
    icon: ShieldAlert,
    tag: 'Pre-Flight Guard',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-100'
  },
  {
    title: 'Indirect Prompt Injection Scanning',
    status: 'Active Shield',
    description: 'Deep content inspection on external tool outputs (pull requests, git diffs, issue comments, webhooks) neutralizes hidden rogue instructions.',
    icon: Cpu,
    tag: 'Context Validator',
    color: 'text-[#6D4AFF]',
    bg: 'bg-purple-50 border-purple-100'
  },
  {
    title: 'Automated PII & Secret Scrubbing',
    status: 'Active Redactor',
    description: 'Autonomous masking of GitHub personal tokens, OpenAI/Gemini API keys, bearer JWTs, and email addresses prevents accidental credential leakage.',
    icon: Key,
    tag: 'DLP Engine',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100'
  },
  {
    title: 'Zero-Model Training Guarantee',
    status: 'Enforced Policy',
    description: 'Hardened privacy headers (X-Do-Not-Train) and zero-retention commercial API tiers ensure client code and prompts are never used to train public LLMs.',
    icon: Lock,
    tag: 'Data Sovereignty',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
  {
    title: 'Cryptographic Buffer Zeroization',
    status: 'Active Memory Guard',
    description: 'In-memory secret byte buffers are actively overwritten with cryptographically random noise and zeros to prevent cold-boot memory extraction attacks.',
    icon: Fingerprint,
    tag: 'Memory Safe',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100'
  },
  {
    title: 'Strict CSP & Client Rate Limiting',
    status: 'Active Perimeter',
    description: 'Hardened Content-Security-Policy with whitelisted API endpoints, anti-CSRF single-use nonces, and sliding-window client rate limiting.',
    icon: AlertTriangle,
    tag: 'Perimeter Defense',
    color: 'text-[#111318]',
    bg: 'bg-neutral-100 border-neutral-200'
  }
];

const COMPLIANCE_DOCS = [
  {
    title: 'Apache License 2.0',
    file: 'LICENSE',
    description: 'Permissive enterprise open-source licensing granting clear patent rights, redistribution, and commercial usage protection.',
    badge: 'Open Source',
    href: 'https://github.com/Priyanshu7977/NEXUS/blob/main/LICENSE'
  },
  {
    title: 'Vulnerability Disclosure Policy',
    file: 'SECURITY.md',
    description: 'Coordinated vulnerability disclosure with a 24-hour triage SLA, safe harbor protections, and confidential reporting via security@nexus.dev.',
    badge: 'Security Policy',
    href: 'https://github.com/Priyanshu7977/NEXUS/blob/main/SECURITY.md'
  },
  {
    title: 'Enterprise Privacy & Data Sovereignty',
    file: 'PRIVACY.md',
    description: 'Comprehensive data protection policy guaranteeing zero model training, tenant isolation, and full GDPR / CCPA data rights.',
    badge: 'Data Sovereignty',
    href: 'https://github.com/Priyanshu7977/NEXUS/blob/main/PRIVACY.md'
  }
];

const SECURITY_PILLARS = [
  {
    id: 'granular-permissions',
    title: 'Granular Permissions',
    headline: 'Choose exactly what an agent can access.',
    description: 'Never grant blanket access. Define read/write capabilities per service, per repository, and per agent with deterministic boundary gates.',
    icon: Lock,
    color: 'text-[#6D4AFF]',
    bg: 'bg-purple-50 border-purple-100'
  },
  {
    id: 'human-approval',
    title: 'Human-in-the-Loop Approval',
    headline: 'Require confirmation before sensitive actions.',
    description: 'Destructive or external write operations (merging code, modifying databases, publishing content) pause execution until an authorized team member approves.',
    icon: UserCheck,
    color: 'text-[#3B82F6]',
    bg: 'bg-blue-50 border-blue-100'
  },
  {
    id: 'credential-protection',
    title: 'Credential Protection',
    headline: 'Keep service credentials away from agent prompts.',
    description: 'OAuth tokens and API keys are stored encrypted at rest using AES-256 GCM. Tokens are injected only inside isolated tool executors and are never visible in LLM context windows.',
    icon: Key,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
  {
    id: 'execution-isolation',
    title: 'Execution Isolation',
    headline: 'Limit what an agent can do during a task.',
    description: 'Every agent run operates in an isolated sandbox context with ephemeral memory, preventing cross-tenant data contamination and runtime privilege escalation.',
    icon: ShieldCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100'
  },
  {
    id: 'auditability',
    title: 'Complete Auditability',
    headline: 'See what happened across every execution.',
    description: 'Every prompt turn, tool call parameter, external API response, and human approval decision is logged immutably in your workspace trace ledger.',
    icon: Eye,
    color: 'text-[#111318]',
    bg: 'bg-neutral-100 border-neutral-200'
  }
];

const PERMISSION_ROWS = [
  {
    capability: 'Repositories & Metadata',
    scope: 'read:user, repo',
    status: 'Granted',
    icon: Check,
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    note: 'Agent can inspect accessible public and private repository trees.'
  },
  {
    capability: 'Commit Diffs & File Inspection',
    scope: 'repo:read',
    status: 'Granted',
    icon: Check,
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    note: 'Agent can evaluate syntax and AST diffs for code review tasks.'
  },
  {
    capability: 'Code Changes & Direct Commits',
    scope: 'repo:write',
    status: 'Not enabled',
    icon: Circle,
    iconColor: 'text-[#8B919B]',
    badgeBg: 'bg-[#FAFAF8] text-[#8B919B] border-[#E5E5E2]',
    note: 'Disabled by default. Requires explicit agent permission override.'
  },
  {
    capability: 'Automated Pull Requests',
    scope: 'pull_requests:write',
    status: 'Approval Required',
    icon: UserCheck,
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    note: 'Agent can draft PRs but cannot publish without human verification.'
  },
  {
    capability: 'Repository Deletion & Org Admin',
    scope: 'admin:org, delete_repo',
    status: 'Not allowed',
    icon: X,
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    note: 'Strictly prohibited by NEXUS security policy; cannot be requested.'
  }
];

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between pb-24 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        badge="NEXUS Security & Control"
        badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
        title="Agents should have access."
        highlightedTitle="Not unlimited access."
        description="NEXUS is designed around explicit permissions, controlled execution isolation, credential protection, and complete trace visibility."
      />

      <div className="max-w-6xl mx-auto">
        {/* Interactive Permission Visualizer Box */}
        <div className="mb-20">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFEFEA] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
                  <BrandLogo brand="github" size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111318]">
                    GitHub Connector Security Model
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Scoped permissions enforced for workspace agent workflows
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAF8] border border-[#E5E5E2] text-[11px] font-mono text-[#626873]">
                <span>Example Permission Model</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="divide-y divide-[#EFEFEA]">
              {PERMISSION_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.capability} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon className={`w-4 h-4 ${row.iconColor} flex-shrink-0`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111318]">
                          {row.capability}
                        </div>
                        <p className="text-[11px] text-[#626873] leading-relaxed">
                          {row.note}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-[10px] font-mono text-[#8B919B] hidden md:inline">
                        {row.scope}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border ${row.badgeBg}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5 Security Pillars */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Five architectural security principles
            </h3>
            <p className="text-xs sm:text-sm text-[#626873]">
              How NEXUS protects your infrastructure, codebase, and API credentials from untrusted agent operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {SECURITY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="h-full p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all flex flex-col justify-between shadow-sm min-w-0"
                >
                  <div className="flex-1 flex flex-col">
                    <div className={`w-10 h-10 rounded-xl ${pillar.bg} ${pillar.color} border flex items-center justify-center mb-4 shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h4 className="text-base font-bold text-[#111318] mb-1 truncate">
                      {pillar.title}
                    </h4>
                    <p className="text-xs font-semibold text-[#6D4AFF] mb-2 break-words">
                      {pillar.headline}
                    </p>
                    <p className="text-xs text-[#626873] leading-relaxed mb-4 break-words flex-1">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFEFEA] text-[11px] font-mono text-[#8B919B] mt-auto">
                    Built-in Guardrail
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time AI Security Shield & Threat Mitigation */}
        <div className="mb-20">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-medium text-emerald-700 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active AI Security Shield v1.4
            </div>
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Next-generation AI runtime defense
            </h3>
            <p className="text-xs sm:text-sm text-[#626873]">
              Deterministic safeguards to prevent jailbreaks, prompt injection, indirect data exfiltration, and unauthorized LLM training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {AI_SHIELD_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="h-full p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all flex flex-col justify-between shadow-sm min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${module.bg} ${module.color} border flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318]">
                        {module.tag}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#111318] mb-1">
                      {module.title}
                    </h4>
                    <p className="text-xs text-[#626873] leading-relaxed mb-4">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8B919B]">Enforcement</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {module.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Governance, Official Licensing & Privacy Policies */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Enterprise governance & legal transparency
            </h3>
            <p className="text-xs sm:text-sm text-[#626873]">
              Open-source Apache 2.0 licensing, documented vulnerability response SLAs, and strict customer data sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMPLIANCE_DOCS.map((doc) => (
              <a
                key={doc.file}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] hover:bg-white hover:border-[#6D4AFF]/40 hover:shadow-sm transition-all flex flex-col justify-between block"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white border border-[#E5E5E2] text-[#6D4AFF]">
                      {doc.badge}
                    </span>
                    <span className="text-xs font-mono text-[#8B919B] group-hover:text-[#111318] flex items-center gap-1 transition-colors">
                      {doc.file}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#111318] mb-2 group-hover:text-[#6D4AFF] transition-colors">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-[#626873] leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EFEFEA] text-[11px] font-semibold text-[#6D4AFF] flex items-center gap-1">
                  View Document <ExternalLink className="w-3 h-3 ml-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Security Disclosure / Honest Notice */}
        <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] mb-12 flex items-start gap-3.5 text-xs text-[#626873]">
          <Info className="w-4 h-4 text-[#6D4AFF] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#111318] block mb-1">Responsible Disclosure & Roadmap</strong>
            NEXUS is currently in active developer preview. We prioritize zero-trust architecture, cryptographic token encryption, and explicit Row Level Security from day one. Formal third-party compliance audits (e.g. SOC2 Type II) will be initiated following our open-source release.
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-white via-emerald-50/40 to-purple-50/30 text-[#111318] border border-emerald-500/20 text-center max-w-4xl mx-auto shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-[#111318]">
            Experience deterministic agent security.
          </h3>
          <p className="text-xs sm:text-sm text-[#626873] max-w-xl mx-auto mb-6 leading-relaxed">
            Connect your first service with granular permissions and complete execution audit trails.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="md" withArrow className="w-full sm:w-auto justify-center shadow-md shadow-emerald-500/15">
                Start Free in Sandbox
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
