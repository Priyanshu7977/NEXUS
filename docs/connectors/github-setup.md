# GitHub Connector Integration Guide

This guide explains how to connect your GitHub account or organization to **NEXUS** for automated agent repository reading and code analysis.

---

## 1. Overview

The **GitHub Connector** allows workspace agents in NEXUS to securely:
- Read public and private repositories accessible to your account.
- Inspect branches, commit trees, and repository metadata.
- Provide codebase context to planning and coding agents.

NEXUS encrypts all provider access tokens at rest using **AES-GCM (256-bit)** and restricts access through strict workspace-level **Row Level Security (RLS)**.

---

## 2. Authentication Methods

NEXUS supports two connection flows:
1. **GitHub OAuth 2.0 App** (Recommended for multi-user workspaces and 1-click connect).
2. **Personal Access Token (PAT)** (Recommended for local testing and personal development environments).

---

## 3. Option A: Setting Up a GitHub OAuth App

### Step 1: Register an OAuth Application
1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/applications/new).
2. Fill in the application registration form:
   - **Application name**: `NEXUS Agent Orchestration`
   - **Homepage URL**: `http://localhost:5180/` (or your production URL)
   - **Application description**: `AI agent orchestration platform connection`
   - **Authorization callback URL**:
     ```
     http://localhost:5180/app/connectors/callback/github
     ```
     *(For production deployments, replace `http://localhost:5180` with your domain, e.g., `https://nexus.ai/app/connectors/callback/github`)*

3. Click **Register application**.

### Step 2: Generate Client Secret
1. On your newly created application page, copy the **Client ID**.
2. Click **Generate a new client secret** and copy the resulting string.

### Step 3: Configure NEXUS Environment Variables
Add the keys to your `.env` file in the NEXUS project root:

```bash
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_GITHUB_CLIENT_SECRET=your_client_secret_here
VITE_CONNECTOR_ENCRYPTION_KEY=your_random_32_char_secret_key!
```

Restart your Vite development server.

---

## 4. Option B: Personal Access Token (PAT)

If you don't want to register an OAuth application:
1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens/new).
2. Note: `NEXUS Agent Orchestrator`.
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read all user profile data)
4. Click **Generate token** and copy the `ghp_...` string.
5. In NEXUS:
   - Open **Connectors** → Click **Token** on the GitHub card.
   - Paste your token and click **Connect GitHub**.

---

## 5. Security & Token Storage Architecture

```
User Authorizes ──> OAuth Callback (/app/connectors/callback/github)
                             │
                             ▼
                    Token Crypto Service
               (AES-GCM 256-bit Encryption)
                             │
                             ▼
                 PostgreSQL / Supabase Table
                 (public.connector_connections)
                             │
                             ▼
                 Row Level Security (RLS)
         (Only workspace owners & admins have access)
```

- **Encrypted at Rest**: Raw tokens are never stored in plaintext in the database.
- **Never Logged**: Raw tokens are stripped from all frontend telemetry and console outputs.
- **Instant Revocation**: Clicking "Disconnect" instantly deletes the cryptographic payload and revokes workspace agent access.
