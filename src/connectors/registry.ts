import { ConnectorDefinition } from '../types/connector';
import { GITHUB_DEFINITION } from './adapters/githubAdapter';
import { VERCEL_DEFINITION } from './adapters/vercelAdapter';

export const CONNECTOR_REGISTRY: Record<string, ConnectorDefinition> = {
  github: GITHUB_DEFINITION,
  vercel: VERCEL_DEFINITION,
  docker: {
    id: 'docker',
    name: 'Docker',
    slug: 'docker',
    brand: 'docker',
    category: 'Development',
    description: 'Isolated container runtimes for sandboxed task and testing execution.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['containers:read', 'containers:write'],
    capabilities: [
      {
        id: 'docker.containers.run',
        name: 'Spawn Ephemeral Container',
        description: 'Spin up isolated container runtime for unit tests.',
        status: 'active'
      }
    ]
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    slug: 'openai',
    brand: 'openai',
    category: 'AI',
    description: 'GPT-4o, o1, and o3-mini models for deep reasoning and tool invocation.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['models:read', 'completions:write'],
    capabilities: [
      {
        id: 'openai.chat.completions',
        name: 'Model Inference',
        description: 'Execute structured tool calling with GPT-4o.',
        status: 'active'
      }
    ]
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    slug: 'gemini',
    brand: 'gemini',
    category: 'AI',
    description: 'Multimodal reasoning across text, code, audio, and large contexts with Gemini 2.5.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['models:generate'],
    capabilities: [
      {
        id: 'gemini.content.generate',
        name: 'Gemini Multimodal Inference',
        description: 'Context processing and token streaming with Gemini models.',
        status: 'active'
      }
    ]
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    slug: 'anthropic',
    brand: 'anthropic',
    category: 'AI',
    description: 'Claude 3.7 Sonnet for hybrid reasoning, code synthesis, refactoring, and planning.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['messages:create'],
    capabilities: [
      {
        id: 'anthropic.messages.create',
        name: 'Claude Message Synthesis',
        description: 'High-capability reasoning and code editing with Claude.',
        status: 'active'
      }
    ]
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    slug: 'supabase',
    brand: 'supabase',
    category: 'Data',
    description: 'PostgreSQL database, authentication context, and real-time subscriptions.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['database:read', 'database:write'],
    capabilities: [
      {
        id: 'supabase.sql.query',
        name: 'Execute SQL & Migrations',
        description: 'Query tables and manage database schema migrations.',
        status: 'active'
      }
    ]
  },
  postgres: {
    id: 'postgres',
    name: 'PostgreSQL',
    slug: 'postgres',
    brand: 'postgres',
    category: 'Data',
    description: 'Direct SQL query execution and schema inspection for specialized agents.',
    status: 'available',
    authType: 'service_account',
    requiredScopes: ['connect', 'query'],
    capabilities: [
      {
        id: 'postgres.query.execute',
        name: 'Read/Write SQL Execution',
        description: 'Execute queries with parameterized guards and connection pooling.',
        status: 'active'
      }
    ]
  },
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    slug: 'mongodb',
    brand: 'mongodb',
    category: 'Data',
    description: 'Document database storage, vector search, and change streams for agent memory.',
    status: 'available',
    authType: 'api_key',
    requiredScopes: ['data:read', 'data:write'],
    capabilities: [
      {
        id: 'mongodb.documents.crud',
        name: 'Document Management',
        description: 'Query, insert, and update JSON documents in collections.',
        status: 'active'
      }
    ]
  },
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    slug: 'wordpress',
    brand: 'wordpress',
    category: 'CMS',
    description: 'Headless content management, drafts, and publishing for marketing agents.',
    status: 'available',
    authType: 'oauth2',
    requiredScopes: ['posts:write', 'media:upload'],
    capabilities: [
      {
        id: 'wordpress.posts.manage',
        name: 'Manage Content Posts',
        description: 'Create and update articles, pages, and media.',
        status: 'active'
      }
    ]
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    slug: 'shopify',
    brand: 'shopify',
    category: 'CMS',
    description: 'Storefront APIs, inventory webhooks, and product catalog synchronization.',
    status: 'available',
    authType: 'oauth2',
    requiredScopes: ['read_products', 'write_inventory'],
    capabilities: [
      {
        id: 'shopify.products.sync',
        name: 'Product Catalog Sync',
        description: 'Fetch and update store inventory and products.',
        status: 'active'
      }
    ]
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    slug: 'slack',
    brand: 'slack',
    category: 'Communication',
    description: 'Human-in-the-loop approvals, status alerts, and thread interactions.',
    status: 'available',
    authType: 'oauth2',
    requiredScopes: ['chat:write', 'channels:read'],
    capabilities: [
      {
        id: 'slack.messages.send',
        name: 'Dispatch Channel Messages',
        description: 'Send interactive block cards and approval requests.',
        status: 'active'
      }
    ]
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    slug: 'notion',
    brand: 'notion',
    category: 'CMS',
    description: 'Ingest documentation, specs, and knowledge bases into agent memory.',
    status: 'available',
    authType: 'oauth2',
    requiredScopes: ['pages:read', 'databases:read'],
    capabilities: [
      {
        id: 'notion.pages.index',
        name: 'Index Pages & Databases',
        description: 'Read workspace documentation for contextual agent tasks.',
        status: 'active'
      }
    ]
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    slug: 'discord',
    brand: 'discord',
    category: 'Communication',
    description: 'Community bot interactions, automated notices, and feedback channels.',
    status: 'available',
    authType: 'oauth2',
    requiredScopes: ['bot', 'messages.read'],
    capabilities: [
      {
        id: 'discord.messages.send',
        name: 'Channel Alerts',
        description: 'Post updates to designated Discord channels.',
        status: 'active'
      }
    ]
  },
  firebase: {
    id: 'firebase',
    name: 'Firebase',
    slug: 'firebase',
    brand: 'firebase',
    category: 'Data',
    description: 'Firestore databases, Cloud Storage, and client authentication state synchronization.',
    status: 'available',
    authType: 'service_account',
    requiredScopes: ['firestore:read', 'firestore:write'],
    capabilities: [
      {
        id: 'firebase.firestore.sync',
        name: 'Firestore Sync',
        description: 'Read and update Firestore document collections.',
        status: 'active'
      }
    ]
  }
};

export const getAllConnectors = (): ConnectorDefinition[] => {
  return Object.values(CONNECTOR_REGISTRY);
};

export const getConnectorById = (id: string): ConnectorDefinition | undefined => {
  return CONNECTOR_REGISTRY[id];
};
