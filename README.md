# NEXUS — Frontier Multi-Model AI Swarm & Autonomous Agent Orchestration Platform

<div align="center">

![NEXUS Platform Banner](https://img.shields.io/badge/NEXUS-v2.5.0--frontier-blueviolet?style=for-the-badge&logo=probot&logoColor=white)
[![Vercel Production](https://img.shields.io/badge/Vercel-Live%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nexus-cyan-xi.vercel.app/)
![Runtime](https://img.shields.io/badge/Runtime-Web%20%7C%20Windows%20Desktop%20(PWA)-0ea5e9?style=for-the-badge&logo=windows&logoColor=white)
![License](https://img.shields.io/badge/License-Apache%202.0-emerald?style=for-the-badge&logo=apache&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)

**The World's First Unified Multi-Model Consensus Arena, Autonomous Agent Swarm, and Universal Protocol Engine (MCP + A2A).**

[🌐 Live Production Website](https://nexus-cyan-xi.vercel.app/) • [Live Swarm Arena](#-omni-swarm-multi-model-consensus-arena) • [Prompt-to-Workflow Compiler](#-prompt-to-workflow-ai-compiler) • [Autonomous Agent Fleet](#-autonomous-frontier-agent-fleet) • [Quick Start](#-quick-start)

</div>

---

## 🌐 Live Production Deployment

> **Production Application**: [https://nexus-cyan-xi.vercel.app/](https://nexus-cyan-xi.vercel.app/)

- **⚡ 1-Click Instant Demo Login**: Instant zero-credential access via the Login page (`demo@nexus.dev`) into the active workspace.
- **🔌 4 Connected Applications Verified**: Pre-seeded with active credentials for **GitHub** (`@nexus-demo-builder`), **Vercel** (`nexus-deployments`), **Supabase** (`nexus-production-db`), and **Slack** (`#nexus-alerts`).
- **🚀 Autonomous Website Builder**: Live testing suite that chains all 4 connectors together to synthesize, audit, migrate, deploy, and alert on a modern full-stack SaaS application with interactive live preview.

---

## 🚀 Executive Overview

**NEXUS** is an enterprise-grade AI operating system and autonomous orchestration platform that unites the world's leading frontier AI models—**OpenAI GPT-4o**, **Anthropic Claude 3.5 Sonnet**, **Google Gemini 1.5 Pro**, **DeepSeek-R1 Reasoner**, and **Groq Llama 3.3 70B**—into a single collaborative environment.

Unlike isolated chatbots or fragmented Python developer frameworks, NEXUS delivers a production-ready, visual-first workspace where multiple models collaborate, debate, verify, and execute mission-critical workflows under strict human-in-the-loop governance.

---

## ⚡ What Makes NEXUS Unique? (The Breakthrough Edge)

### 1. 🧠 Omni-Swarm Multi-Model Consensus Arena
Single-model outputs are susceptible to hallucinations, blind spots, and bias. NEXUS solves this with autonomous parallel arbitration:
- **Phase 1: Parallel Neural Reasoning**: Dispatches prompts simultaneously to GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and DeepSeek-R1.
- **Phase 2: Cross-Model Vulnerability Audit**: Each model cross-examines peer outputs, flagging security flaws, logic fallacies, and edge-case omissions.
- **Phase 3: Golden Consensus Synthesis**: Aggregates the highest-confidence insights into a single authoritative production plan.
- **1-Click DAG Conversion**: Instantly exports consensus solutions directly into runnable visual workflows with typed nodes and dependency edges.

### 2. ⚡ Prompt-to-Workflow AI Compiler
Describe any complex automation in plain English (e.g., *"Audit smart contracts with DeepSeek, verify security with Claude, and deploy to Vercel with human approval"*). The compiler automatically builds a complete visual Directed Acyclic Graph (DAG) with:
- Configured agent nodes and LLM providers
- Conditional branches and tool invocations
- Human sign-off checkpoints
- Validated YAML specification

### 3. 🌐 Global AI Agent Command Orb (`Ctrl+K`)
A persistent neural co-pilot hovering across both public and authenticated workspace views:
- Instant hotkey access (`Ctrl+K` / `Cmd+K`)
- Live model switching across 5 top AI providers
- Natural language command execution and workflow generation

### 4. 🔑 Universal BYOK (Bring Your Own Key) Vault
- Client-side encrypted credential storage in `localStorage`
- Full compatibility with OpenAI, Anthropic, Google Gemini, DeepSeek, and Groq
- Live connection health testing and token quota tracking

### 5. 💻 Dual Delivery: Web + Native Desktop Mode
- **Zero-Warning 1-Click PWA Desktop App**: Instant installation to Windows Start Menu, Taskbar, and Desktop with offline caching.
- **Windows Standalone Launcher**: `Launch-NEXUS-Desktop.cmd` executes the application in a borderless, native desktop window mode.

---

## 🤖 Autonomous Frontier Agent Fleet

NEXUS comes pre-configured with a roster of specialized autonomous agents:

| Agent Name | Engine / Model | Specialization | Capabilities |
| :--- | :--- | :--- | :--- |
| **Claude 3.5 Lead Architect** | Anthropic Claude 3.5 Sonnet | Systems Design & Code Quality | Architecture DAGs, Refactoring, Clean Code |
| **DeepSeek-R1 Security Auditor** | DeepSeek Reasoner | Red Teaming & Formal Verification | Vulnerability Audits, Zero-Trust Policies |
| **OpenAI GPT-4o Core Synthesizer** | OpenAI GPT-4o | Multi-Domain Logic & Synthesis | High-Throughput Task Execution, Integrations |
| **Google Gemini 1.5 Pro Analyst** | Google Gemini 1.5 Pro | Massive Context & Knowledge Retrieval | 1M+ Token Analysis, Cross-Repo Inspection |
| **Groq Llama 3.3 70B Dispatcher** | Groq Llama 3.3 70B | Ultra-Low Latency Routing | 500+ tok/s Event Triage & Rapid Dispatch |
| **Supabase & Postgres Architect** | Anthropic Claude 3.5 Sonnet | Database & RLS Security | Migration DDL, Row-Level Security Policies |
| **API Pentester & Red Team Agent** | DeepSeek Reasoner | Automated Penetration Testing | OWASP Top 10 Auditing, Token Leak Detection |
| **DevOps SRE & Kubernetes Healer** | OpenAI GPT-4o | Incident Response & Self-Healing | CI/CD Monitoring, Rollback Automation |

---

## 🛠️ Universal Protocols: MCP & A2A

NEXUS natively bridges the two emerging standards of multi-agent interoperability:

- **Model Context Protocol (MCP)**:
  - Connects frontier models to local tools, databases, and filesystem servers via Server-Sent Events (SSE) and HTTP streaming.
  - Granular permission boundaries and real-time tool inspection.

- **Agent-to-Agent Communication Protocol (A2A)**:
  - Standardized JSON-RPC agent discovery through `.well-known/agent-card.json`.
  - Autonomous task delegation and cross-workspace agent peering.

---

## 📦 System Architecture

```
NEXUS/
├── electron/                 # Desktop runtime & window launchers
├── public/
│   ├── .well-known/          # A2A Agent Card discovery specifications
│   ├── manifest.json         # Desktop PWA configuration
│   └── sw.js                 # Service Worker offline caching
├── src/
│   ├── ai/                   # Frontier AI Engine & Providers
│   │   ├── modelRegistry.ts  # Unified model resolver & BYOK bridge
│   │   └── providers/        # Anthropic, DeepSeek, Gemini, Groq, OpenAI
│   ├── components/
│   │   ├── a2a/              # Agent-to-Agent discovery & delegation modals
│   │   ├── agent/            # Global Neural Command Orb & Co-Pilot
│   │   ├── agents/           # Agent execution and inspection interfaces
│   │   ├── app/              # Authenticated workspace shell & BYOK vault
│   │   ├── connectors/       # GitHub & Vercel live connector modals
│   │   ├── desktop/          # Desktop app installer & SmartScreen guidance
│   │   ├── marketplace/      # Ecosystem publishing & security scanner
│   │   ├── mcp/              # Model Context Protocol manager
│   │   ├── pages/            # Multi-page views (Swarm, Builder, Docs, Explore)
│   │   ├── swarm/            # Omni-Swarm multi-model consensus engine
│   │   └── workflows/        # Visual DAG Studio, YAML viewer, Run preview
│   ├── protocols/            # Standardized MCP & A2A runtime adapters
│   ├── services/             # Core business logic (Agents, Workflows, Connectors)
│   └── types/                # Strict TypeScript domain interfaces
├── supabase/
│   └── migrations/           # Database DDL & Row-Level Security policies
└── tailwind.config.js        # Universal sans-serif editorial design system
```

---

## 🏁 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**
- Modern Web Browser (Google Chrome, Microsoft Edge, Brave)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Priyanshu7977/NEXUS.git
cd NEXUS

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file from the example template:
```bash
cp .env.example .env
```

Configure your API keys (optional: you can also configure them directly in the UI via the **BYOK Vault**):
```ini
# Frontier AI Providers (Optional - can also be configured via in-app BYOK Vault)
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key
VITE_GROQ_API_KEY=your-groq-api-key

# Backend Database (Optional - runs in simulated local mode if omitted)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Launch the Development Server
```bash
npm run dev
```
Navigate to `http://127.0.0.1:5180` (or `http://localhost:5173`) in your browser.

### 4. Build for Production
```bash
# Type check and build optimized bundle
npx tsc -b
npm run build
```

---

## 💻 Desktop Experience & PWA

NEXUS is engineered as a first-class desktop application:

1. **Native 1-Click PWA Installation (Recommended)**:
   - Click **"Desktop App"** in the top navigation bar.
   - Click **"Install Desktop App"** to add NEXUS to your Windows Start Menu, Taskbar, and Desktop.
   - Completely bypasses browser SmartScreen warnings with zero configuration.

2. **Windows Desktop Launcher Script**:
   - Run `Launch-NEXUS-Desktop.cmd` from the project root.
   - Launches NEXUS in a standalone, borderless desktop window powered by Microsoft Edge WebView.

---

## 🛡️ Enterprise Security & Governance

- **Zero-Trust Tool Isolation**: Agent execution occurs within isolated sandboxes with per-node capability whitelisting.
- **Client-Side Key Protection**: BYOK API keys are encrypted in your local browser storage and never touch intermediary proxy servers.
- **Automated Secret Scanning**: All marketplace templates, workflows, and agent definitions are scanned for API tokens and private credentials before publishing.
- **Human-in-the-Loop Safeguards**: Destructive actions (deployments, git merges, production schema updates) require explicit human approval via interactive approval gates.

---

## 📄 License & Attribution

Licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for complete details.

Developed with ❤️ by **Priyanshu Singh** ([@Priyanshu7977](https://github.com/Priyanshu7977)).
