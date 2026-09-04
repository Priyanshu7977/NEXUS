# NEXUS — AI Agent Orchestration & Universal Protocol Platform

NEXUS is an enterprise-grade AI agent orchestration platform connecting autonomous agents, external services, universal tool protocols (MCP), and multi-agent communication protocols (A2A) into unified, observable, human-supervised workflows.

---

## 🌟 Core Architecture & Capabilities

- **Autonomous Agent Runtime**: Configurable AI reasoning workers powered by Google Gemini, equipped with approved tools, granular permission modes, and strict token/execution limits.
- **Universal Multi-Protocol Layer**:
  - **Native Connectors**: Deeply integrated external systems (GitHub, Vercel) for real-time webhooks, diff inspection, and deployment triggers.
  - **Model Context Protocol (MCP)**: Standardized dynamic tool discovery, SSE/HTTP streamable transport, and context retrieval.
  - **Agent-to-Agent (A2A)**: Standardized JSON-RPC agent discovery via `.well-known/agent-card.json` and autonomous task delegation.
- **Deterministic Workflow Engine**: Multi-agent DAG orchestration with event triggers, agent reasoning nodes, tool execution, and role-based human approval gates.
- **Discovery & Ecosystem Marketplace**: Production-ready registry for discovering and installing agents, connectors, workflows, and protocol servers with automated secret scanning and sandbox isolation.
- **End-to-End Observability**: Real-time event timelines, streaming execution logs, audit trails, and token/latency usage analytics.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Priyanshu7977/NEXUS.git
cd NEXUS

# Install dependencies
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:
```ini
# Supabase Configuration (Optional: runs in simulated local mode if omitted)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Provider API Keys
VITE_GEMINI_API_KEY=your-gemini-api-key

# GitHub Connector (Optional: for live OAuth and webhook ingestion)
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_CLIENT_SECRET=your-github-client-secret

# Vercel Connector (Optional: for production deployments)
VITE_VERCEL_API_TOKEN=your-vercel-token
```

### 4. Running the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to explore the public website or access the authenticated workspace at `/app`.

### 5. Building for Production

```bash
npm run build
```

---

## 📂 Project Structure

```
NEXUS/
├── src/
│   ├── components/
│   │   ├── a2a/              # Agent-to-Agent protocol modals & cards
│   │   ├── agents/           # Agent execution and configuration
│   │   ├── app/              # Authenticated shell, sidebar & layout
│   │   ├── connectors/       # Connector management & setup modals
│   │   ├── layout/           # Public navbar, footer & editorial layout
│   │   ├── marketplace/      # Installation, publishing & report modals
│   │   ├── mcp/              # Model Context Protocol configuration
│   │   ├── pages/            # Multi-page application & marketing views
│   │   └── workflows/        # Visual DAG builder & run modals
│   ├── context/              # Authentication & workspace context
│   ├── protocols/
│   │   ├── a2a/              # A2A client & schema adapters
│   │   └── mcp/              # MCP client & tool execution adapters
│   ├── services/             # Core business logic & database interaction
│   │   ├── agentService.ts
│   │   ├── connectorService.ts
│   │   ├── workflowService.ts
│   │   ├── marketplaceService.ts
│   │   └── secretScanner.ts
│   └── types/                # Strict TypeScript interfaces & database rows
├── supabase/
│   └── migrations/           # Complete database DDL & RLS policies
└── tailwind.config.js        # Editorial frozen design system tokens
```

---

## 🛡️ Security & Privacy
- **Sandboxed Execution**: Agent tools run within workspace-isolated boundaries.
- **Automated Secret Scanning**: Enforced prior to publishing any template or resource to the marketplace.
- **Credential Encryption**: Tokens and OAuth secrets are AES-256 encrypted at rest.
- **Human-in-the-Loop Gates**: Destructive actions and production deployments require manual human sign-off.

---

## 📄 License
Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
