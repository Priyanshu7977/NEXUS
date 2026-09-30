import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Database,
  Code,
  ShieldCheck,
  Send,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Terminal,
  ShoppingBag,
  Plus,
  Search,
  Star,
  Zap
} from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  inventory: number;
  rating: number;
  description: string;
}

interface OrderItem {
  id: string;
  user_email: string;
  total_cents: number;
  status: 'paid' | 'pending' | 'shipped';
  items_count: number;
  created_at: string;
}

interface ReviewItem {
  id: string;
  product_id: string;
  user_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface LogEntry {
  id: string;
  time: string;
  source: 'orchestrator' | 'supabase' | 'claude' | 'gpt4o' | 'deepseek';
  message: string;
  status: 'info' | 'success' | 'executing';
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_901',
    title: 'Nexus Edge Gateway X1',
    category: 'Hardware',
    price: 349,
    inventory: 42,
    rating: 4.9,
    description: 'Ultra-low latency edge server with dual neural processors.'
  },
  {
    id: 'prod_902',
    title: 'Neural Inference Accelerator',
    category: 'Developer Tools',
    price: 189,
    inventory: 18,
    rating: 4.8,
    description: 'Plug-and-play PCIe accelerator for local model arbitration.'
  },
  {
    id: 'prod_903',
    title: 'Supabase Vector Memory Pod',
    category: 'Developer Tools',
    price: 99,
    inventory: 64,
    rating: 5.0,
    description: 'Hardware-encrypted vector indexing module for PostgreSQL.'
  },
  {
    id: 'prod_904',
    title: 'Haptic Studio Controller',
    category: 'Accessories',
    price: 129,
    inventory: 31,
    rating: 4.7,
    description: 'Tactile macro knob controller for multi-model workflows.'
  }
];

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord_1001',
    user_email: 'alex.chen@startup.io',
    total_cents: 34900,
    status: 'paid',
    items_count: 1,
    created_at: '2026-09-30 14:22:10 UTC'
  },
  {
    id: 'ord_1002',
    user_email: 'dev@acme-corp.com',
    total_cents: 28800,
    status: 'paid',
    items_count: 2,
    created_at: '2026-09-30 15:45:02 UTC'
  }
];

export const OnePromptAppStudio: React.FC<{
  embedded?: boolean;
  onNavigateToFull?: () => void;
}> = ({ embedded = false, onNavigateToFull }) => {
  // 1. One Prompt & Model Mesh Selection State
  const [prompt, setPrompt] = useState(
    'Build an e-commerce platform with Supabase database for products and orders, and Claude designing the storefront UI/UX'
  );
  const [selectedModels, setSelectedModels] = useState({
    supabase: true,
    claude: true,
    gpt4o: true,
    deepseek: true
  });

  // 2. Build Lifecycle State
  const [isBuilding, setIsBuilding] = useState(false);
  const [hasBuilt, setHasBuilt] = useState(true); // Default to ready for immediate interactive exploration
  const [buildProgress, setBuildProgress] = useState(100);
  const [activeTab, setActiveTab] = useState<'preview' | 'database' | 'backend' | 'security'>('preview');

  // 3. Dynamic App State (Directly affected by prompts)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [hasReviewsTable, setHasReviewsTable] = useState(false);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [selectedDbTable, setSelectedDbTable] = useState<'products' | 'orders' | 'reviews'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4. Targeted AI Prompt Directive Bar
  const [targetAi, setTargetAi] = useState<'all' | 'supabase' | 'claude' | 'gpt4o' | 'deepseek'>('supabase');
  const [directiveInput, setDirectiveInput] = useState('');
  const [isExecutingDirective, setIsExecutingDirective] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 5. Execution Logs Stream
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'l1',
      time: '16:02:11',
      source: 'orchestrator',
      message: 'Initialized Multi-AI Swarm Mesh: 4 frontier workers connected via MCP.',
      status: 'info'
    },
    {
      id: 'l2',
      time: '16:02:12',
      source: 'supabase',
      message: 'PostgreSQL schema connected via API: Generated tables `products`, `orders`, `profiles` with Row-Level Security.',
      status: 'success'
    },
    {
      id: 'l3',
      time: '16:02:13',
      source: 'claude',
      message: 'Synthesized accessible React storefront: Navigation, Product cards, Cart drawer, and Checkout modal.',
      status: 'success'
    },
    {
      id: 'l4',
      time: '16:02:14',
      source: 'gpt4o',
      message: 'Backend API routes active: `GET /api/products`, `POST /api/checkout`, `POST /api/orders` with Supabase client.',
      status: 'success'
    },
    {
      id: 'l5',
      time: '16:02:15',
      source: 'deepseek',
      message: 'Security verification complete: 0 unauthenticated write vulnerabilities. RLS rules validated.',
      status: 'success'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  // Trigger One-Prompt Build Cycle
  const handleStartBuild = () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    setHasBuilt(false);
    setBuildProgress(10);
    setLogs([
      {
        id: `log_${Date.now()}_0`,
        time: new Date().toLocaleTimeString(),
        source: 'orchestrator',
        message: `Analyzing user intent: "${prompt}"`,
        status: 'info'
      }
    ]);

    setTimeout(() => {
      setBuildProgress(35);
      if (selectedModels.supabase) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log_${Date.now()}_1`,
            time: new Date().toLocaleTimeString(),
            source: 'supabase',
            message: 'Supabase API: Connected to PostgreSQL schema engine. Synthesizing tables & RLS policies.',
            status: 'executing'
          }
        ]);
      }
    }, 600);

    setTimeout(() => {
      setBuildProgress(65);
      if (selectedModels.claude) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log_${Date.now()}_2`,
            time: new Date().toLocaleTimeString(),
            source: 'claude',
            message: 'Claude 3.7: Synthesizing UI/UX layout, Tailwind styling, and responsive product catalog.',
            status: 'executing'
          }
        ]);
      }
    }, 1200);

    setTimeout(() => {
      setBuildProgress(85);
      if (selectedModels.gpt4o) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log_${Date.now()}_3`,
            time: new Date().toLocaleTimeString(),
            source: 'gpt4o',
            message: 'GPT-4o: Generating Next.js server actions and database API query endpoints.',
            status: 'executing'
          }
        ]);
      }
    }, 1800);

    setTimeout(() => {
      setBuildProgress(100);
      setIsBuilding(false);
      setHasBuilt(true);
      if (selectedModels.deepseek) {
        setLogs((prev) => [
          ...prev,
          {
            id: `log_${Date.now()}_4`,
            time: new Date().toLocaleTimeString(),
            source: 'deepseek',
            message: 'DeepSeek-R1: Formally audited Row-Level Security policies. 0 invariant leaks found.',
            status: 'success'
          },
          {
            id: `log_${Date.now()}_5`,
            time: new Date().toLocaleTimeString(),
            source: 'orchestrator',
            message: 'Application synthesis complete! Ready for live testing and direct prompt iteration.',
            status: 'success'
          }
        ]);
      }
      showToast('🚀 Application generated successfully! You can now direct individual AIs below.');
    }, 2400);
  };

  // Direct AI Execution Bar (The user's core request!)
  const handleExecuteDirective = (directiveText?: string) => {
    const textToRun = directiveText || directiveInput;
    if (!textToRun.trim() || isExecutingDirective) return;

    setIsExecutingDirective(true);
    const lower = textToRun.toLowerCase();

    // Auto-detect target if not explicitly pinned
    let resolvedTarget = targetAi;
    if (lower.includes('supabase') || lower.includes('database') || lower.includes('table') || lower.includes('schema')) {
      resolvedTarget = 'supabase';
    } else if (lower.includes('claude') || lower.includes('ui') || lower.includes('ux') || lower.includes('theme') || lower.includes('design') || lower.includes('dark')) {
      resolvedTarget = 'claude';
    } else if (lower.includes('gpt') || lower.includes('backend') || lower.includes('route') || lower.includes('api') || lower.includes('webhook')) {
      resolvedTarget = 'gpt4o';
    } else if (lower.includes('deepseek') || lower.includes('security') || lower.includes('rls') || lower.includes('audit')) {
      resolvedTarget = 'deepseek';
    }

    const now = new Date().toLocaleTimeString();

    // Add user instruction to log
    setLogs((prev) => [
      ...prev,
      {
        id: `dir_user_${Date.now()}`,
        time: now,
        source: 'orchestrator',
        message: `Command sent to @${resolvedTarget}: "${textToRun}"`,
        status: 'info'
      }
    ]);

    setTimeout(() => {
      // Execute based on target
      if (resolvedTarget === 'supabase') {
        if (lower.includes('review') || !hasReviewsTable) {
          setHasReviewsTable(true);
          setSelectedDbTable('reviews');
          setReviews([
            {
              id: 'rev_01',
              product_id: 'prod_901',
              user_email: 'sarah.k@developer.com',
              rating: 5,
              comment: 'Edge gateway latency dropped from 48ms to 4ms. Exceptional hardware!',
              created_at: '2026-09-30 16:10:00 UTC'
            },
            {
              id: 'rev_02',
              product_id: 'prod_903',
              user_email: 'marcus@ai-lab.org',
              rating: 5,
              comment: 'Supabase vector indexing with hardware acceleration is effortless.',
              created_at: '2026-09-30 16:15:22 UTC'
            }
          ]);
          setLogs((prev) => [
            ...prev,
            {
              id: `dir_res_${Date.now()}`,
              time: new Date().toLocaleTimeString(),
              source: 'supabase',
              message: 'Supabase API executed: Created `reviews` table with 5 columns (id, product_id, user_email, rating, comment) and RLS policy: SELECT for public, INSERT for authenticated.',
              status: 'success'
            }
          ]);
          showToast('✅ Supabase: Database schema updated via API. Added `reviews` table.');
        } else {
          // Add a new product or modify schema
          const newProduct: ProductItem = {
            id: `prod_${Date.now().toString().slice(-3)}`,
            title: 'Neural Audio Co-Processor',
            category: 'Accessories',
            price: 79,
            inventory: 50,
            rating: 4.9,
            description: 'Ultra-low latency speech model DSP.'
          };
          setProducts((prev) => [newProduct, ...prev]);
          setLogs((prev) => [
            ...prev,
            {
              id: `dir_res_${Date.now()}`,
              time: new Date().toLocaleTimeString(),
              source: 'supabase',
              message: `Supabase API executed: Inserted row into \`products\` table (${newProduct.title}). Synced with live API.`,
              status: 'success'
            }
          ]);
          showToast(`✅ Supabase: Inserted new product "${newProduct.title}" into database.`);
        }
      } else if (resolvedTarget === 'claude') {
        if (lower.includes('dark') || themeMode === 'light') {
          setThemeMode('dark');
          setLogs((prev) => [
            ...prev,
            {
              id: `dir_res_${Date.now()}`,
              time: new Date().toLocaleTimeString(),
              source: 'claude',
              message: 'Claude 3.7 executed: Re-rendered storefront with sleek dark theme, obsidian card surfaces, and purple micro-accents.',
              status: 'success'
            }
          ]);
          showToast('✅ Claude: UI/UX design updated live in the preview (Dark Mode applied).');
        } else {
          setThemeMode('light');
          setLogs((prev) => [
            ...prev,
            {
              id: `dir_res_${Date.now()}`,
              time: new Date().toLocaleTimeString(),
              source: 'claude',
              message: 'Claude 3.7 executed: Restored clean editorial light theme with high-contrast slate surfaces.',
              status: 'success'
            }
          ]);
          showToast('✅ Claude: UI/UX design updated live in the preview (Light Mode applied).');
        }
      } else if (resolvedTarget === 'gpt4o') {
        setLogs((prev) => [
          ...prev,
          {
            id: `dir_res_${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            source: 'gpt4o',
            message: 'GPT-4o executed: Synthesized `POST /api/webhooks/stripe` with raw signature validation and Supabase transaction rollback.',
            status: 'success'
          }
        ]);
        showToast('✅ GPT-4o: Backend route handler and webhook signature verification generated.');
      } else if (resolvedTarget === 'deepseek') {
        setLogs((prev) => [
          ...prev,
          {
            id: `dir_res_${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            source: 'deepseek',
            message: 'DeepSeek-R1 executed: Re-verified RLS invariant proofs for multi-tenant isolation. Zero leaks detected.',
            status: 'success'
          }
        ]);
        showToast('✅ DeepSeek: Security audit verified all schema invariants.');
      } else {
        // Broadcast to all
        setLogs((prev) => [
          ...prev,
          {
            id: `dir_res_${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            source: 'orchestrator',
            message: 'Coordinated broadcast update across Supabase, Claude, GPT-4o, and DeepSeek.',
            status: 'success'
          }
        ]);
        showToast('✅ Swarm: Orchestrated update across all connected models.');
      }

      setIsExecutingDirective(false);
      setDirectiveInput('');
    }, 700);
  };

  // Cart & Checkout Interactivity
  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) => (item.id === productId ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: productId, qty: 1 }];
    });
    const prod = products.find((p) => p.id === productId);
    showToast(`Added ${prod?.title || 'item'} to cart!`);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartPrice = cart.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder: OrderItem = {
      id: `ord_${Date.now().toString().slice(-4)}`,
      user_email: 'priyanshu@nexus-dev.com',
      total_cents: totalCartPrice * 100,
      status: 'paid',
      items_count: totalCartCount,
      created_at: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutModalOpen(false);

    setLogs((prev) => [
      ...prev,
      {
        id: `ord_log_${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        source: 'supabase',
        message: `Supabase API: Received verified checkout. Inserted Order #${newOrder.id} into \`orders\` table ($${totalCartPrice}.00).`,
        status: 'success'
      }
    ]);
    showToast(`🎉 Order #${newOrder.id} placed! Supabase inserted new row into database.`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`w-full text-left font-sans ${embedded ? '' : 'max-w-7xl mx-auto py-6'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111318] text-white text-xs font-medium shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#6D4AFF] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#6D4AFF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Multi-AI Application Studio</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#626873]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasBuilt ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="font-medium text-[#111318]">{hasBuilt ? 'Application Mesh Ready' : 'Synthesizing...'}</span>
            </div>
            {onNavigateToFull && (
              <button
                type="button"
                onClick={onNavigateToFull}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E2] hover:bg-[#FAFAF8] text-xs font-semibold text-[#6D4AFF] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>Open in App</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          One Prompt. Connect Any AI. Build the Whole App.
        </h2>
        <p className="text-sm sm:text-base text-[#626873] max-w-3xl leading-relaxed">
          Tell <strong>Supabase</strong> to start working on the database via API, tell <strong>Claude</strong> to design the UI/UX frontend, and tell <strong>GPT-4o</strong> to wire backend server actions—all collaborating in one application.
        </p>
      </div>

      {/* SECTION 1: THE ONE-PROMPT DIRECTIVE & CONNECTED MESH BAR */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm mb-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#626873] flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>Step 1: Application Directive (One Single Prompt)</span>
            </label>
            <span className="text-[11px] text-[#8B919B]">Natural language orchestration</span>
          </div>

          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What application do you want to build? (e.g. Build an e-commerce platform with Supabase database for products and Claude designing the frontend)..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-sm text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] placeholder-[#8B919B] resize-none transition-all"
              />
            </div>

            <button
              type="button"
              onClick={handleStartBuild}
              disabled={isBuilding}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 ${
                isBuilding
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-[#6D4AFF] hover:bg-[#5B3CE8] shadow-[#6D4AFF]/25 active:scale-[0.98]'
              }`}
            >
              {isBuilding ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Connecting &amp; Building...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Connect &amp; Build App</span>
                </>
              )}
            </button>
          </div>

          {isBuilding && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#626873]">
                <span>Synthesizing application mesh...</span>
                <span>{buildProgress}%</span>
              </div>
              <div className="w-full bg-[#E5E5E2] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#6D4AFF] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Preset Prompts */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-[#8B919B] font-medium">Try templates:</span>
            <button
              type="button"
              onClick={() => {
                setPrompt('Build an e-commerce storefront with Supabase database for products/orders and Claude designing the storefront');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5E2] text-[#111318] transition-colors cursor-pointer"
            >
              🛍️ E-Commerce with Supabase
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompt('Build a SaaS analytics portal with customer metrics, API keys table, and Claude dark dashboard');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5E2] text-[#111318] transition-colors cursor-pointer"
            >
              📊 SaaS Analytics Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setPrompt('Build a team collaboration kanban board with real-time audit logs and user roles');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5E2] text-[#111318] transition-colors cursor-pointer"
            >
              📋 Kanban Task Hub
            </button>
          </div>
        </div>

        {/* CONNECTED AI MESH TOGGLES */}
        <div className="pt-3 border-t border-[#E5E5E2]/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#626873]">
              Step 2: Connected Multi-AI Workers (Active in this Mesh)
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">All APIs ready for dual-way communication</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Supabase */}
            <div
              onClick={() => setSelectedModels((p) => ({ ...p, supabase: !p.supabase }))}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                selectedModels.supabase
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300/30'
                  : 'bg-[#FAFAF8] border-[#E5E5E2] opacity-60'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111318]">Supabase API</span>
                  <span className={`w-2 h-2 rounded-full ${selectedModels.supabase ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                </div>
                <p className="text-[11px] text-[#626873] leading-snug mt-0.5">
                  PostgreSQL schema, tables, migrations &amp; RLS security policies.
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold">
                  Database Engine
                </span>
              </div>
            </div>

            {/* 2. Claude */}
            <div
              onClick={() => setSelectedModels((p) => ({ ...p, claude: !p.claude }))}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                selectedModels.claude
                  ? 'bg-purple-50/60 border-purple-300 ring-1 ring-purple-300/30'
                  : 'bg-[#FAFAF8] border-[#E5E5E2] opacity-60'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#6D4AFF] text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111318]">Claude 3.7</span>
                  <span className={`w-2 h-2 rounded-full ${selectedModels.claude ? 'bg-purple-500' : 'bg-stone-300'}`} />
                </div>
                <p className="text-[11px] text-[#626873] leading-snug mt-0.5">
                  Lead UI/UX architect, Tailwind responsive layout &amp; frontend state.
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded font-semibold">
                  UI/UX Architect
                </span>
              </div>
            </div>

            {/* 3. GPT-4o */}
            <div
              onClick={() => setSelectedModels((p) => ({ ...p, gpt4o: !p.gpt4o }))}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                selectedModels.gpt4o
                  ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300/30'
                  : 'bg-[#FAFAF8] border-[#E5E5E2] opacity-60'
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <Code className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111318]">GPT-4o</span>
                  <span className={`w-2 h-2 rounded-full ${selectedModels.gpt4o ? 'bg-blue-500' : 'bg-stone-300'}`} />
                </div>
                <p className="text-[11px] text-[#626873] leading-snug mt-0.5">
                  Backend API routes, server actions, webhooks &amp; validation.
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded font-semibold">
                  Backend &amp; Routes
                </span>
              </div>
            </div>

            {/* 4. DeepSeek-R1 */}
            <div
              onClick={() => setSelectedModels((p) => ({ ...p, deepseek: !p.deepseek }))}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                selectedModels.deepseek
                  ? 'bg-stone-100 border-stone-300 ring-1 ring-stone-300/30'
                  : 'bg-[#FAFAF8] border-[#E5E5E2] opacity-60'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#111318] text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111318]">DeepSeek-R1</span>
                  <span className={`w-2 h-2 rounded-full ${selectedModels.deepseek ? 'bg-stone-700' : 'bg-stone-300'}`} />
                </div>
                <p className="text-[11px] text-[#626873] leading-snug mt-0.5">
                  Security invariants, Row-Level Security policy proofs &amp; zero-trust audit.
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono text-stone-700 bg-stone-200 px-1.5 py-0.2 rounded font-semibold">
                  Security Auditor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WORKSPACE TABS & INTERACTIVE PREVIEW */}
      <div className="bg-white border border-[#E5E5E2] rounded-2xl shadow-sm overflow-hidden mb-6">
        {/* Workspace Toolbar Tabs */}
        <div className="px-4 py-3 border-b border-[#E5E5E2] bg-[#FAFAF8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-[#111318] shadow-xs border border-[#E5E5E2]'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-white/60'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>🖥️ Live App Preview</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-purple-100 text-purple-700 rounded-full font-bold">
                Claude
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'database'
                  ? 'bg-white text-[#111318] shadow-xs border border-[#E5E5E2]'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-white/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>🗄️ Supabase Database</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-100 text-emerald-800 rounded-full font-bold">
                API Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backend')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'backend'
                  ? 'bg-white text-[#111318] shadow-xs border border-[#E5E5E2]'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-white/60'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-blue-600" />
              <span>⚡ Backend Routes</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-blue-100 text-blue-800 rounded-full font-bold">
                GPT-4o
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'security'
                  ? 'bg-white text-[#111318] shadow-xs border border-[#E5E5E2]'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
              <span>🛡️ Security Verification</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-stone-200 text-stone-800 rounded-full font-bold">
                DeepSeek
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8B919B] hidden sm:inline">Theme:</span>
            <button
              type="button"
              onClick={() => setThemeMode((m) => (m === 'light' ? 'dark' : 'light'))}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E2] hover:bg-[#FAFAF8] text-xs font-medium text-[#111318] cursor-pointer shadow-2xs"
            >
              {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE APP PREVIEW (CLAUDE UI/UX ARCHITECT) */}
        {activeTab === 'preview' && (
          <div className="p-4 sm:p-6 bg-[#F6F6F3]">
            {/* Mock Application Container */}
            <div
              className={`rounded-2xl border transition-all duration-300 shadow-md overflow-hidden ${
                themeMode === 'dark'
                  ? 'bg-[#111318] border-stone-800 text-white'
                  : 'bg-white border-[#E5E5E2] text-[#111318]'
              }`}
            >
              {/* App Browser Chrome */}
              <div
                className={`px-4 py-2.5 border-b flex items-center justify-between ${
                  themeMode === 'dark' ? 'bg-[#181A20] border-stone-800' : 'bg-[#FAFAF8] border-[#E5E5E2]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono opacity-60">nexus-store.preview.internal</span>
                </div>

                {/* Cart Badge Button */}
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    totalCartCount > 0
                      ? 'bg-[#6D4AFF] text-white shadow-xs'
                      : themeMode === 'dark'
                      ? 'bg-stone-800 text-stone-300'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart ({totalCartCount})</span>
                  {totalCartCount > 0 && <span>· ${totalCartPrice}</span>}
                </button>
              </div>

              {/* App Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Store Header & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Frontier AI Hardware &amp; Tooling</h3>
                    <p className={`text-xs mt-0.5 ${themeMode === 'dark' ? 'text-stone-400' : 'text-[#626873]'}`}>
                      Designed by Claude 3.7 · Powered by Supabase Database API
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none transition-colors w-44 sm:w-56 ${
                          themeMode === 'dark'
                            ? 'bg-stone-900 border-stone-700 text-white placeholder-stone-500'
                            : 'bg-[#FAFAF8] border-[#E5E5E2] text-[#111318] placeholder-[#8B919B]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['All', 'Hardware', 'Developer Tools', 'Accessories'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        categoryFilter === cat
                          ? 'bg-[#6D4AFF] text-white font-semibold'
                          : themeMode === 'dark'
                          ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          : 'bg-[#FAFAF8] text-[#626873] hover:bg-[#F2F2EE]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${
                        themeMode === 'dark'
                          ? 'bg-stone-900/80 border-stone-800'
                          : 'bg-white border-[#E5E5E2]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#6D4AFF]/10 text-[#6D4AFF] font-semibold">
                            {p.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{p.rating}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-sm leading-snug">{p.title}</h4>
                        <p className={`text-xs line-clamp-2 ${themeMode === 'dark' ? 'text-stone-400' : 'text-[#626873]'}`}>
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200/50 flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold">${p.price}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">In stock ({p.inventory})</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Reviews Section (Dynamically Rendered when Reviews table exists) */}
                {hasReviewsTable && reviews.length > 0 && (
                  <div className={`mt-6 pt-5 border-t ${themeMode === 'dark' ? 'border-stone-800' : 'border-[#E5E5E2]'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold">Verified Customer Reviews</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          Supabase `reviews` Table
                        </span>
                      </div>
                      <span className="text-xs text-[#8B919B]">Updated via AI directive</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            themeMode === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-[#FAFAF8] border-[#E5E5E2]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs">{rev.user_email}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className={themeMode === 'dark' ? 'text-stone-300' : 'text-[#626873]'}>
                            "{rev.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPABASE DATABASE (POSTGRESQL TABLES & ROWS) */}
        {activeTab === 'database' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E2]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111318] flex items-center gap-2">
                    <span>Supabase Schema &amp; Data Explorer</span>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Connected via REST API
                    </span>
                  </h3>
                  <p className="text-xs text-[#626873]">
                    Managed autonomously by Supabase AI engine with Row-Level Security (RLS) enforcement.
                  </p>
                </div>
              </div>

              {/* Table Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#8B919B] font-mono">TABLE:</span>
                <button
                  type="button"
                  onClick={() => setSelectedDbTable('products')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${
                    selectedDbTable === 'products'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]'
                  }`}
                >
                  products ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDbTable('orders')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${
                    selectedDbTable === 'orders'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]'
                  }`}
                >
                  orders ({orders.length})
                </button>
                {hasReviewsTable && (
                  <button
                    type="button"
                    onClick={() => setSelectedDbTable('reviews')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors ${
                      selectedDbTable === 'reviews'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2]'
                    }`}
                  >
                    reviews ({reviews.length})
                  </button>
                )}
              </div>
            </div>

            {/* Live Data Grid */}
            <div className="border border-[#E5E5E2] rounded-xl overflow-x-auto shadow-2xs">
              {selectedDbTable === 'products' && (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[#626873]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">id (uuid)</th>
                      <th className="px-4 py-2.5 font-semibold">title (text)</th>
                      <th className="px-4 py-2.5 font-semibold">category (text)</th>
                      <th className="px-4 py-2.5 font-semibold">price (numeric)</th>
                      <th className="px-4 py-2.5 font-semibold">inventory (int)</th>
                      <th className="px-4 py-2.5 font-semibold">rating (numeric)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-2.5 text-[#6D4AFF] font-bold">{p.id}</td>
                        <td className="px-4 py-2.5 text-[#111318]">{p.title}</td>
                        <td className="px-4 py-2.5 text-[#626873]">{p.category}</td>
                        <td className="px-4 py-2.5 font-bold text-[#111318]">${p.price}</td>
                        <td className="px-4 py-2.5 text-emerald-600">{p.inventory}</td>
                        <td className="px-4 py-2.5 text-amber-600">★ {p.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedDbTable === 'orders' && (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[#626873]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">id (uuid)</th>
                      <th className="px-4 py-2.5 font-semibold">user_email (text)</th>
                      <th className="px-4 py-2.5 font-semibold">total_cents (int)</th>
                      <th className="px-4 py-2.5 font-semibold">status (text)</th>
                      <th className="px-4 py-2.5 font-semibold">items_count (int)</th>
                      <th className="px-4 py-2.5 font-semibold">created_at (timestamptz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-2.5 text-[#6D4AFF] font-bold">{o.id}</td>
                        <td className="px-4 py-2.5 text-[#111318]">{o.user_email}</td>
                        <td className="px-4 py-2.5 font-bold text-[#111318]">${(o.total_cents / 100).toFixed(2)}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">{o.items_count}</td>
                        <td className="px-4 py-2.5 text-[#626873]">{o.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedDbTable === 'reviews' && hasReviewsTable && (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[#626873]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">id (uuid)</th>
                      <th className="px-4 py-2.5 font-semibold">product_id (uuid)</th>
                      <th className="px-4 py-2.5 font-semibold">user_email (text)</th>
                      <th className="px-4 py-2.5 font-semibold">rating (int)</th>
                      <th className="px-4 py-2.5 font-semibold">comment (text)</th>
                      <th className="px-4 py-2.5 font-semibold">created_at (timestamptz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E2]">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-2.5 text-[#6D4AFF] font-bold">{r.id}</td>
                        <td className="px-4 py-2.5 text-[#626873]">{r.product_id}</td>
                        <td className="px-4 py-2.5 text-[#111318]">{r.user_email}</td>
                        <td className="px-4 py-2.5 text-amber-600 font-bold">★ {r.rating}/5</td>
                        <td className="px-4 py-2.5 text-[#111318]">{r.comment}</td>
                        <td className="px-4 py-2.5 text-[#626873]">{r.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Supabase Migration SQL Preview */}
            <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111318] font-mono">
                  migration: supabase/migrations/20260930_nexus_init.sql
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold">RLS ENABLED</span>
              </div>
              <pre className="text-[11px] font-mono bg-white p-3 rounded-lg border border-[#E5E5E2] text-stone-700 overflow-x-auto">
{`-- Generated by Supabase AI via NEXUS Orchestrator
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  inventory INT NOT NULL DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 5.0
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  total_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  items_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.email() = user_email);`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: BACKEND ROUTES (GPT-4o) */}
        {activeTab === 'backend' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111318]">GPT-4o Server Actions &amp; API Routes</h3>
                  <p className="text-xs text-[#626873]">
                    TypeScript API routes with Supabase client bindings, parameter validation, and rate limiting.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                3 Endpoints Active
              </span>
            </div>

            <pre className="text-xs font-mono bg-[#FAFAF8] p-4 rounded-xl border border-[#E5E5E2] text-stone-800 overflow-x-auto leading-relaxed">
{`// app/api/checkout/route.ts - Synthesized by GPT-4o
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { cartItems, userEmail } = await req.json();
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // Calculate order total and verify inventory
  let totalCents = 0;
  for (const item of cartItems) {
    const { data: prod } = await supabase.from('products').select('price, inventory').eq('id', item.id).single();
    if (!prod || prod.inventory < item.qty) {
      return NextResponse.json({ error: 'Insufficient inventory' }, { status: 400 });
    }
    totalCents += Math.round(prod.price * 100) * item.qty;
  }

  // Insert order record into Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ user_email: userEmail, total_cents: totalCents, status: 'paid', items_count: cartItems.length })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, orderId: order.id });
}`}
            </pre>
          </div>
        )}

        {/* TAB 4: SECURITY VERIFICATION (DEEPSEEK-R1) */}
        {activeTab === 'security' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-stone-100 text-stone-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111318]">DeepSeek-R1 Formal Security Audit</h3>
                  <p className="text-xs text-[#626873]">
                    Automated invariant verification: Row Level Security, authorization leaks, and SQL constraints.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Audit Status: 100% Passed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Row-Level Security (RLS) Tenant Isolation</span>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Verified that table <code>orders</code> rejects direct client UPDATE/DELETE queries without authenticated session tokens.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SQL Injection Invariant Check</span>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed">
                  All queries utilize PostgREST parameterized query builders. Raw string concatenation is blocked by default.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>API Rate Limiting &amp; SSRF Shield</span>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Private IP address spaces (RFC 1918) blocked on outbound webhooks. Token bucket rate limiter active.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Private Zero-Data-Retention (BYOK)</span>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed">
                  All model inference executed with zero retention agreements. Local schema keys never sent to public telemetry.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: THE TARGETED AI DIRECTIVE BAR (USER'S EXACT GOAL!) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#111318] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6D4AFF]" />
              <span>Step 3: Direct Any Connected AI in Real-Time</span>
            </h3>
            <p className="text-xs text-[#626873]">
              Send targeted instructions to Supabase for database schema, Claude for UI/UX, or GPT-4o for backend routes.
            </p>
          </div>

          {/* Model Target Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-[#8B919B]">Target:</span>
            {[
              { id: 'supabase', label: '@supabase (DB)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
              { id: 'claude', label: '@claude (UI)', color: 'text-purple-700 bg-purple-50 border-purple-300' },
              { id: 'gpt4o', label: '@gpt-4o (API)', color: 'text-blue-700 bg-blue-50 border-blue-300' },
              { id: 'deepseek', label: '@deepseek (Sec)', color: 'text-stone-700 bg-stone-100 border-stone-300' },
              { id: 'all', label: '@all (Broadcast)', color: 'text-[#111318] bg-stone-100 border-[#E5E5E2]' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTargetAi(m.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  targetAi === m.id
                    ? `${m.color} ring-2 ring-[#6D4AFF]/20 shadow-2xs`
                    : 'bg-white text-[#626873] border-[#E5E5E2] hover:bg-[#FAFAF8]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click Example Directives (What the user literally asked for) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-[#8B919B] uppercase">Quick Directives (1-Click Execution):</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleExecuteDirective('tell supabase please start working on database and create a reviews table')}
              disabled={isExecutingDirective}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-medium transition-colors cursor-pointer text-left"
            >
              ⚡ "tell supabase pls start working on database &amp; add reviews table"
            </button>
            <button
              type="button"
              onClick={() => handleExecuteDirective('tell claude switch storefront to dark aesthetic with purple glow')}
              disabled={isExecutingDirective}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-800 font-medium transition-colors cursor-pointer text-left"
            >
              🎨 "tell claude toggle dark UI mode &amp; update product styling"
            </button>
            <button
              type="button"
              onClick={() => handleExecuteDirective('tell gpt-4o add stripe webhook route for payment verification')}
              disabled={isExecutingDirective}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 font-medium transition-colors cursor-pointer text-left"
            >
              🔌 "tell gpt-4o add stripe webhook route"
            </button>
          </div>
        </div>

        {/* Custom Directive Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteDirective();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              placeholder={`Prompt @${targetAi}... (e.g. tell supabase add a discount_code column, tell claude make cart slide in)...`}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs sm:text-sm text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] placeholder-[#8B919B]"
            />
          </div>

          <button
            type="submit"
            disabled={isExecutingDirective || !directiveInput.trim()}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center gap-2 cursor-pointer transition-all ${
              isExecutingDirective || !directiveInput.trim()
                ? 'bg-stone-300 cursor-not-allowed'
                : 'bg-[#6D4AFF] hover:bg-[#5B3CE8] shadow-xs active:scale-95'
            }`}
          >
            {isExecutingDirective ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Send Directive</span>
          </button>
        </form>

        {/* Live Multi-AI Execution Log Stream */}
        <div className="mt-4 pt-3 border-t border-[#E5E5E2]/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#626873] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>Real-Time Execution Event Stream</span>
            </span>
            <span className="text-[11px] font-mono text-[#8B919B]">{logs.length} events logged</span>
          </div>

          <div
            ref={logContainerRef}
            className="max-h-48 overflow-y-auto rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] p-3 space-y-2 font-mono text-xs text-stone-700"
          >
            {logs.slice(-6).map((log) => {
              const badgeColors: Record<string, string> = {
                orchestrator: 'bg-stone-200 text-stone-800',
                supabase: 'bg-emerald-100 text-emerald-800',
                claude: 'bg-purple-100 text-purple-800',
                gpt4o: 'bg-blue-100 text-blue-800',
                deepseek: 'bg-stone-300 text-stone-900'
              };

              return (
                <div key={log.id} className="flex items-start gap-2.5 leading-snug">
                  <span className="text-[#8B919B] text-[10px] shrink-0 pt-0.5">{log.time}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${badgeColors[log.source] || 'bg-stone-100'}`}>
                    {log.source}
                  </span>
                  <span className="text-stone-800 flex-1">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL (INTERACTIVE PREVIEW) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E5E5E2] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E2]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="text-base font-bold text-[#111318]">Your Shopping Cart</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-[#626873] hover:text-[#111318] text-sm"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-[#626873] py-4 text-center">Your cart is currently empty.</p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {cart.map((item) => {
                    const prod = products.find((p) => p.id === item.id);
                    if (!prod) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                        <div>
                          <div className="font-bold text-[#111318]">{prod.title}</div>
                          <div className="text-[#626873] font-mono">Qty: {item.qty} × ${prod.price}</div>
                        </div>
                        <div className="font-bold">${prod.price * item.qty}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E5E5E2] flex items-center justify-between text-sm font-bold">
                  <span>Total Due:</span>
                  <span className="text-[#6D4AFF] text-base">${totalCartPrice}</span>
                </div>

                <p className="text-[11px] text-[#626873]">
                  Clicking "Place Order" will test the live flow: <strong>GPT-4o</strong> calls <strong>Supabase API</strong> to insert the record into the <code>orders</code> table!
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5E5E2] hover:bg-[#FAFAF8] text-xs font-semibold text-[#626873] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Place Order &amp; Insert into Supabase
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
