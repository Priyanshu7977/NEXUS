# NEXUS Enterprise Privacy Policy & Data Sovereignty Guarantee

Last Updated: September 2026

At **NEXUS Orchestration Inc.** ("NEXUS", "we", "us", or "our"), privacy, confidentiality, and data sovereignty are fundamental architectural design principles. This Privacy Policy details how NEXUS handles, protects, and isolates code, credentials, prompt contexts, and telemetry when you use the NEXUS platform.

---

## 1. The Zero-Training Guarantee

**We guarantee that your code, prompts, tool outputs, and proprietary data are never used to train public or foundational artificial intelligence models.**

- **AI Model Providers**: All external AI provider calls (Google Gemini, Anthropic Claude, OpenAI) are executed under enterprise zero-data-retention and zero-model-training commercial agreements.
- **Privacy Headers**: NEXUS automatically attaches privacy flags (e.g. `X-Do-Not-Train: 1`, `X-Privacy-Mode: strict-zero-retention`) to prevent any provider from logging or utilizing inference payloads for model improvement.
- **Local / Self-Hosted Compatibility**: NEXUS supports local model runtimes (Ollama, vLLM, private VPC endpoints) where zero external data ever leaves your own infrastructure.

---

## 2. Multi-Tenant Data Isolation & Sovereignty

NEXUS enforces strict, mathematically deterministic boundaries between customer workspaces:

1. **Row Level Security (RLS)**: Every query, database access, and session context is bound to an authenticated `tenant_id` / `workspace_id`. Multi-tenant isolation is enforced at the database kernel level in PostgreSQL/Supabase.
2. **Deterministic Context Verification**: The `verifyTenantIsolation` service performs pre-execution validation ensuring that agents cannot cross tenant boundaries or access records from another organization.
3. **Ephemeral Sandbox Execution**: Agent runs execute in compartmentalized environments. When an execution concludes, ephemeral scratch buffers, process memory, and intermediate variables are completely decommissioned.

---

## 3. Cryptographic Protections

NEXUS employs defense-in-grade cryptography to secure your data at every state:

| State | Cryptographic Standard | Implementation |
| :--- | :--- | :--- |
| **At Rest** | AES-256-GCM / PBKDF2 (100,000 iterations) | OAuth tokens, API secrets, and sensitive credentials are encrypted prior to database persistence or browser storage. |
| **In Transit** | TLS 1.3 / Perfect Forward Secrecy (PFS) | All data transmitted between clients, NEXUS servers, MCP endpoints, and LLM APIs is encrypted in flight. |
| **In Memory** | Cryptographic Buffer Zeroization | In-memory cryptographic keys and secret byte arrays are actively overwritten with random noise and zeros (`zeroizeBuffer`) upon execution completion to prevent cold-boot memory recovery. |

---

## 4. Automated PII & Credential Scrubbing

Before prompts or tool results are stored or evaluated by agents, NEXUS executes real-time redaction:
- **API Keys & Secrets**: GitHub personal access tokens (`ghp_`), OpenAI keys (`sk-`), Google API keys (`AIzaSy`), JWTs, and AWS credentials are automatically masked with `[REDACTED_SECRET]`.
- **Personal Identifiers**: Email addresses, IP addresses, and private contact markers are scrubbed or tokenized unless explicitly required by an authorized connector.
- **Indirect Injection Neutralization**: External inputs returned by third-party APIs (e.g. GitHub issue comments, webhook payloads) are scanned and neutralized to prevent prompt extraction attacks.

---

## 5. Information We Collect and Process

### A. Account & Authentication Data
- Email address and encrypted authentication credentials (managed via Supabase Auth).
- Organization/Workspace name and profile metadata.

### B. Workspace Configurations
- Agent configurations, custom instructions, tool definitions, and workflow DAG structures.
- Connector scopes and encrypted OAuth tokens (stored strictly as ciphertext).

### C. Execution Logs & Observability
- Execution traces, token consumption, latency metrics, and run status.
- Traces are retained strictly within your tenant boundary and can be purged at any time by organization administrators.

### D. Information We NEVER Collect or Store in Plaintext
- Third-party repository private codebases (processed ephemerally in-memory during task execution).
- Raw plain-text passwords or secret keys.
- Financial payment details (processed directly by PCI-DSS compliant processors).

---

## 6. Your Rights & Regulatory Compliance (GDPR, CCPA/CPRA)

Regardless of your geographic location, NEXUS extends enterprise-grade data rights:
- **Right to Access & Portability**: You may export your entire workspace, agent definitions, workflow specifications, and audit logs in standardized JSON format at any time.
- **Right to Rectification**: Update your profile, workspace settings, and connector configurations directly through the UI or API.
- **Right to Erasure ("Right to be Forgotten")**: You can delete agents, workflows, execution traces, or your entire organization. Upon deletion, all associated data and encrypted secrets are permanently destroyed across all databases and backups.
- **Local Storage Purge**: Use `purgeAllSecureItems()` or account logout to instantly wipe all device-bound encrypted tokens from client storage.

---

## 7. Data Subprocessors

NEXUS partners with infrastructure providers who maintain SOC 2 Type II, ISO 27001, and GDPR compliance:
- **Supabase / AWS**: Database hosting, authentication, and encrypted data storage.
- **Google Cloud Platform**: LLM inference execution (Gemini Enterprise) under zero-data-retention terms.
- **Vercel**: Edge routing, CDN, and static asset distribution.

---

## 8. Contact Our Data Protection Team

If you have questions regarding this Privacy Policy, wish to exercise your data rights, or require an enterprise Data Processing Agreement (DPA), please contact:

- **Data Protection Officer**: [privacy@nexus.dev](mailto:privacy@nexus.dev)
- **Security Response Team**: [security@nexus.dev](mailto:security@nexus.dev)
- **Mailing Address**: NEXUS Orchestration Inc., 548 Market St, Suite 39210, San Francisco, CA 94104
