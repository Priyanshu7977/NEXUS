# @nexus/sdk

Official TypeScript & JavaScript SDK for **NEXUS** — Real-time Multi-Agent Orchestration, Connectors, and Universal Protocol Platform.

## Features

- ⚡ **Zero-Second Execution**: Directly trigger agent runs and multi-agent workflows.
- 🔒 **Secure Authentication**: Built-in Bearer API key support (`nxs_live_...`) with fine-grained scoping.
- 🔁 **Idempotent Operations**: Avoid duplicate executions using `Idempotency-Key` headers.
- 📡 **Webhook Verification**: Built-in HMAC-SHA256 signature calculation & verification (`t=...,v1=...`).
- 🛠️ **Custom Definitions**: `defineAgent()`, `defineTool()`, and `defineConnector()` helper factories.
- ⏱️ **Execution Observability**: Built-in `waitForCompletion()` helper with real-time progress callbacks.

## Installation

```bash
npm install @nexus/sdk
```

## Quick Start

```typescript
import { NexusClient } from '@nexus/sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY!,
});

// List available agents
const agents = await nexus.agents.list();
console.log('Available agents:', agents.map(a => a.name));

// Execute an agent and wait for completion
const execution = await nexus.agents.execute('agent-code-reviewer', {
  prompt: 'Review PR #42 for potential SQL injection vulnerabilities.',
  context: { repo: 'org/core-api', pull_number: 42 }
});

console.log(`Execution started: ${execution.id}`);

const result = await nexus.executions.waitForCompletion(execution.id, {
  pollIntervalMs: 1000,
  onUpdate: (status) => console.log(`Current status: ${status.status}`)
});

console.log('Final Result:', result.output);
```

## Verifying Incoming Webhooks

```typescript
import { verifyNexusWebhook } from '@nexus/sdk';

app.post('/api/nexus-webhook', async (req, res) => {
  const signature = req.headers['x-nexus-signature'] as string;
  const rawBody = req.body; // Ensure raw body string or Buffer
  const secret = process.env.NEXUS_WEBHOOK_SECRET!;

  const isValid = verifyNexusWebhook(rawBody, signature, secret);
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(rawBody);
  console.log(`Received event ${event.type}:`, event.data);
  res.status(200).send('OK');
});
```

## Defining Tools and Connectors

```typescript
import { defineTool, defineConnector } from '@nexus/sdk';

export const queryDatabase = defineTool({
  name: 'query_postgres',
  description: 'Execute a read-only SQL query against the primary cluster',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SELECT statement' },
    },
    required: ['query'],
  },
  handler: async ({ query }, context) => {
    return db.query(query);
  },
});
```

## License

Apache-2.0
