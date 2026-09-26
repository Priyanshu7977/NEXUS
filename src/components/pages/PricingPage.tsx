import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { Button } from '../ui/Button';
import { 
  Check, 
  Minus, 
  Zap, 
  Bot, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '/ month',
    description: 'For developers experimenting with agent orchestration and personal workflows.',
    features: [
      '3 connected services',
      '3 active agents',
      '2 orchestration workflows',
      '1,000 monthly credits',
      'Basic execution history (24h)',
      'Community agents & tools',
      'Open-source core runtime'
    ],
    ctaLabel: 'Start Free',
    ctaLink: '/signup'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    period: '/ month',
    description: 'For serious builders needing parallel execution, custom connectors, and higher capacity.',
    highlighted: true,
    badge: 'MOST POPULAR',
    features: [
      '25 connected services',
      'Unlimited personal agents',
      'Advanced multi-stage workflows',
      '25,000 monthly credits',
      '30-day detailed execution history',
      'Granular agent permissions',
      'Premium agent access',
      'Priority execution queue'
    ],
    ctaLabel: 'Start Building',
    ctaLink: '/signup'
  },
  {
    id: 'team',
    name: 'Team',
    price: '₹1,499',
    period: '/ month',
    description: 'For engineering teams building collaborative agent systems across organization repositories.',
    features: [
      'Unlimited connected services',
      'Shared team workspace & agents',
      'Unlimited team workflows',
      '100,000 monthly credits',
      'Full audit logs & 90-day retention',
      'Role-based access control (RBAC)',
      'Team telemetry & usage analytics',
      'Full programmatic API access'
    ],
    ctaLabel: 'Start a Team',
    ctaLink: '/signup'
  }
];

const COMPARISON_ROWS = [
  { feature: 'Connected Services', free: '3', pro: '25', team: 'Unlimited' },
  { feature: 'Active Agents', free: '3', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Multi-stage Workflows', free: '2', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Monthly Execution Credits', free: '1,000', pro: '25,000', team: '100,000' },
  { feature: 'Telemetry & Trace History', free: '24 hours', pro: '30 days', team: '90 days' },
  { feature: 'Granular Permissions Model', free: 'Basic', pro: 'Advanced', team: 'Advanced + RBAC' },
  { feature: 'Custom Agent Tool Definition', free: true, pro: true, team: true },
  { feature: 'Programmatic API & Webhooks', free: false, pro: 'Standard', team: 'Full Access' },
  { feature: 'Multi-user Workspace Sharing', free: false, free_note: '1 member', pro: false, pro_note: '1 member', team: true, team_note: 'Unlimited' },
  { feature: 'Dedicated Support Channel', free: false, pro: 'Community', team: 'Priority Email' },
];

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between pb-20 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        badge="NEXUS Pricing"
        badgeIcon={<Zap className="w-3.5 h-3.5" />}
        title="Simple pricing."
        highlightedTitle="Room to grow."
        description="Start free. Upgrade when your agent workflows and connected infrastructure demand more."
      />

      <div className="max-w-6xl mx-auto">
        {/* Early Stage Plan Disclaimer Note */}
        <div className="mb-10 p-3.5 rounded-xl bg-white border border-[#E5E5E2] shadow-sm max-w-2xl mx-auto flex items-center justify-center gap-2 text-xs text-[#626873]">
          <Info className="w-4 h-4 text-[#6D4AFF] flex-shrink-0" />
          <span>
            Pricing shown reflects early product tiers. All core developer preview features are currently free to use.
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-stretch">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`h-full p-6 sm:p-8 rounded-2xl bg-white border transition-all flex flex-col justify-between relative min-w-0 ${
                tier.highlighted
                  ? 'border-[#6D4AFF] shadow-[0_8px_30px_rgba(109,74,255,0.08)] ring-1 ring-[#6D4AFF]/20'
                  : 'border-[#E5E5E2] shadow-sm hover:border-[#D4D4CE]'
              }`}
            >
              {/* Top Section */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
                  <h3 className="text-lg font-bold text-[#111318] truncate">
                    {tier.name}
                  </h3>
                  {tier.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6D4AFF]/10 text-[#6D4AFF] text-[10px] font-mono font-bold tracking-wider shrink-0">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold tracking-tight text-[#111318]">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#8B919B]">
                    {tier.period}
                  </span>
                </div>

                <p className="text-xs text-[#626873] leading-relaxed mb-6 break-words">
                  {tier.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8 pt-6 border-t border-[#EFEFEA] flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#8B919B] font-mono font-semibold">
                    Included in {tier.name}:
                  </div>
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-[#111318] min-w-0">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="break-words flex-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button locked to bottom */}
              <div className="w-full mt-auto pt-2">
                <Link to={tier.ctaLink} className="w-full block">
                  <Button
                    variant={tier.highlighted ? 'primary' : 'secondary'}
                    size="md"
                    className="w-full justify-center"
                    withArrow={tier.highlighted}
                  >
                    {tier.ctaLabel}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section: WHAT ARE CREDITS? */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm mb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6D4AFF]/10 text-[#6D4AFF] text-[10px] font-mono font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 text-[#6D4AFF]" />
              HOW METERING WORKS
            </div>
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              What are credits?
            </h3>
            <p className="text-sm text-[#626873] leading-relaxed mb-8">
              Credits measure AI model inference and workflow orchestration operations across your connected services. Instead of complex token accounting, NEXUS uses a unified credit balance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              <div className="h-full p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-[#111318] mb-1">
                    <Bot className="w-4 h-4 text-[#6D4AFF] shrink-0" />
                    <span>Agent Execution</span>
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Reasoning turns and prompt evaluations calculated based on the selected LLM provider and depth of thinking.
                  </p>
                </div>
              </div>

              <div className="h-full p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-[#111318] mb-1">
                    <Cpu className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    <span>Tool Calls & APIs</span>
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Executing external tools (such as reading GitHub trees or invoking database queries) across connected services.
                  </p>
                </div>
              </div>

              <div className="h-full p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-[#111318] mb-1">
                    <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Workflow Dispatch</span>
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Routing execution state and orchestrating parallel DAG pipeline stages with deterministic checkpointing.
                  </p>
                </div>
              </div>

              <div className="h-full p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-[#111318] mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Security & Verification</span>
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Automated SAST guardrails and human-in-the-loop review approvals processed before sensitive write actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: COMPARISON TABLE */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Compare plan features
            </h3>
            <p className="text-xs text-[#626873]">
              Detailed breakdown of capabilities and resource allocations across each tier.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5E5E2] bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E5E2] bg-[#FAFAF8]">
                  <th className="py-4 px-6 font-semibold text-[#111318] w-1/3">Feature</th>
                  <th className="py-4 px-4 font-semibold text-[#111318] text-center w-1/5">Free</th>
                  <th className="py-4 px-4 font-semibold text-[#6D4AFF] text-center w-1/5 bg-purple-50/50">Pro</th>
                  <th className="py-4 px-4 font-semibold text-[#111318] text-center w-1/5">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEA]">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-6 font-medium text-[#111318]">
                      {row.feature}
                    </td>

                    {/* Free Column */}
                    <td className="py-3.5 px-4 text-center text-[#626873]">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-[#8B919B] mx-auto opacity-40" />
                        )
                      ) : (
                        <span>{row.free}</span>
                      )}
                    </td>

                    {/* Pro Column */}
                    <td className="py-3.5 px-4 text-center text-[#111318] font-medium bg-purple-50/20">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-[#8B919B] mx-auto opacity-40" />
                        )
                      ) : (
                        <span>{row.pro}</span>
                      )}
                    </td>

                    {/* Team Column */}
                    <td className="py-3.5 px-4 text-center text-[#111318] font-medium">
                      {typeof row.team === 'boolean' ? (
                        row.team ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-[#8B919B] mx-auto opacity-40" />
                        )
                      ) : (
                        <span>{row.team}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#111318] text-white border border-[#252A34] text-center max-w-4xl mx-auto shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            Start building with NEXUS today.
          </h3>
          <p className="text-xs sm:text-sm text-[#9BA3AF] max-w-xl mx-auto mb-6 leading-relaxed">
            Create an account in seconds, connect your GitHub repositories, and begin orchestrating your first agent pipeline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="md" withArrow className="w-full sm:w-auto justify-center">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
