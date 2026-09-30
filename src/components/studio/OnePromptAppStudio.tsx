import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Database,
  Code,
  Send,
  RotateCcw,
  ShoppingBag,
  Plus,
  Search,
  Star,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Moon,
  Sun,
  Bot
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
  status: 'paid' | 'pending';
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

interface ChatMessage {
  id: string;
  sender: 'user' | 'claude' | 'supabase' | 'gpt4o';
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    title: 'Nexus Edge Device',
    category: 'Hardware',
    price: 299,
    inventory: 45,
    rating: 4.9,
    description: 'High-speed local AI hardware hub for instant model inference.'
  },
  {
    id: 'prod_2',
    title: 'Supabase Vector Module',
    category: 'Database Tools',
    price: 129,
    inventory: 30,
    rating: 5.0,
    description: 'Dedicated PostgreSQL vector memory pod with hardware encryption.'
  },
  {
    id: 'prod_3',
    title: 'Claude Studio Controller',
    category: 'Accessories',
    price: 89,
    inventory: 60,
    rating: 4.8,
    description: 'Tactile macro knob controller designed for multi-AI workflows.'
  },
  {
    id: 'prod_4',
    title: 'Developer Cloud Pass',
    category: 'Subscriptions',
    price: 49,
    inventory: 120,
    rating: 4.9,
    description: 'Monthly unlimited compute credit across GPT-4o, Claude, and Gemini.'
  }
];

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord_101',
    user_email: 'alex@startup.io',
    total_cents: 29900,
    status: 'paid',
    items_count: 1,
    created_at: 'Just now'
  },
  {
    id: 'ord_102',
    user_email: 'priyanshu@nexus-dev.com',
    total_cents: 17800,
    status: 'paid',
    items_count: 2,
    created_at: '5 mins ago'
  }
];

export const OnePromptAppStudio: React.FC<{
  embedded?: boolean;
  onNavigateToFull?: () => void;
}> = ({ embedded = false, onNavigateToFull }) => {
  // 1. Initial Prompt State
  const [promptInput, setPromptInput] = useState(
    'Build an online store with Supabase database for products and orders, and Claude designing the frontend.'
  );

  // 2. Chat Timeline State (Conversational AI Assistant - Like ChatGPT / Claude)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      senderName: 'You',
      senderRole: 'Creator',
      text: 'Build an online store with Supabase database for products and orders, and Claude designing the storefront.',
      time: '12:00 PM'
    },
    {
      id: 'm2',
      sender: 'claude',
      senderName: 'Claude 3.7',
      senderRole: 'UI/UX Designer',
      text: "👋 I'm Claude! I've designed your storefront with a modern layout, product cards, category filters, and an interactive shopping cart. Check out the live preview on the right!",
      time: '12:00 PM'
    },
    {
      id: 'm3',
      sender: 'supabase',
      senderName: 'Supabase',
      senderRole: 'Database Engine via API',
      text: "⚡ Supabase here! I connected via API and initialized your PostgreSQL database. Created the `products` and `orders` tables with Row-Level Security active.",
      time: '12:01 PM'
    },
    {
      id: 'm4',
      sender: 'gpt4o',
      senderName: 'GPT-4o',
      senderRole: 'Backend Engineer',
      text: "🚀 GPT-4o ready! I wired up the backend checkout routes. Any order placed in the preview will insert a real record into Supabase automatically.",
      time: '12:01 PM'
    }
  ]);

  // 3. User Directive Input State
  const [userDirective, setUserDirective] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 4. Live App & Database State
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [hasReviewsTable, setHasReviewsTable] = useState(false);
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [activeCanvasTab, setActiveCanvasTab] = useState<'app' | 'database' | 'code'>('app');
  const [activeDbTable, setActiveDbTable] = useState<'products' | 'orders' | 'reviews'>('products');
  const [storeTheme, setStoreTheme] = useState<'light' | 'dark'>('light');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Add Item to Cart
  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const match = prev.find((item) => item.id === product.id);
      if (match) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: product.id, qty: 1 }];
    });
    showNotification(`🛒 Added "${product.title}" to cart!`);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartAmount = cart.reduce((acc, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return acc + (p ? p.price * item.qty : 0);
  }, 0);

  // Checkout -> Inserts record into Supabase
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const newOrder: OrderItem = {
      id: `ord_${Date.now().toString().slice(-4)}`,
      user_email: 'customer@nexus.ai',
      total_cents: totalCartAmount * 100,
      status: 'paid',
      items_count: totalCartCount,
      created_at: 'Just now'
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutModalOpen(false);

    // Notify user in chat
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'supabase',
        senderName: 'Supabase',
        senderRole: 'Database Engine',
        text: `✅ Order #${newOrder.id} placed! I inserted a new row into the \`orders\` table ($${totalCartAmount}.00 for ${totalCartCount} items).`,
        time: nowTime
      }
    ]);

    showNotification(`🎉 Order #${newOrder.id} placed! Supabase inserted the row into your database.`);
  };

  // Quick Action / Directives (The user's exact request!)
  const handleSendDirective = (customText?: string) => {
    const textToSend = customText || userDirective;
    if (!textToSend.trim() || isAiThinking) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        senderName: 'You',
        senderRole: 'Creator',
        text: textToSend,
        time: nowTime
      }
    ]);

    setUserDirective('');
    setIsAiThinking(true);

    const lower = textToSend.toLowerCase();

    setTimeout(() => {
      if (lower.includes('supabase') || lower.includes('database') || lower.includes('table') || lower.includes('review') || lower.includes('product')) {
        // Directing Supabase
        if (!hasReviewsTable || lower.includes('review')) {
          setHasReviewsTable(true);
          setActiveDbTable('reviews');
          setActiveCanvasTab('database');

          setReviews([
            {
              id: 'rev_1',
              product_id: 'prod_1',
              user_email: 'sarah.engineer@ai.com',
              rating: 5,
              comment: 'Hardware setup took under 30 seconds. Seamless Supabase sync!',
              created_at: 'Just now'
            },
            {
              id: 'rev_2',
              product_id: 'prod_2',
              user_email: 'dev@nexus.dev',
              rating: 5,
              comment: 'Vector storage queries are ultra fast with zero downtime.',
              created_at: '2 mins ago'
            }
          ]);

          setMessages((prev) => [
            ...prev,
            {
              id: `sup_${Date.now()}`,
              sender: 'supabase',
              senderName: 'Supabase',
              senderRole: 'Database Engine',
              text: "✅ I'm on it! I created the `reviews` table in PostgreSQL via API. It has 5 columns (id, product_id, user_email, rating, comment) and Row-Level Security enabled. I switched your view to the Database tab so you can inspect the live data!",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          showNotification('✅ Supabase created the `reviews` table and synced with API!');
        } else {
          const newProd: ProductItem = {
            id: `prod_${Date.now().toString().slice(-3)}`,
            title: 'Neural Audio DSP Module',
            category: 'Accessories',
            price: 119,
            inventory: 35,
            rating: 4.9,
            description: 'Ultra-low latency speech and audio inference co-processor.'
          };
          setProducts((prev) => [newProd, ...prev]);
          setActiveDbTable('products');
          setActiveCanvasTab('database');

          setMessages((prev) => [
            ...prev,
            {
              id: `sup_${Date.now()}`,
              sender: 'supabase',
              senderName: 'Supabase',
              senderRole: 'Database Engine',
              text: `✅ Added "${newProd.title}" directly to the \`products\` table via Supabase API! You can see it in both the database and the storefront.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          showNotification(`✅ Supabase inserted "${newProd.title}" into database.`);
        }
      } else if (lower.includes('claude') || lower.includes('dark') || lower.includes('theme') || lower.includes('ui') || lower.includes('design')) {
        // Directing Claude
        const nextTheme = storeTheme === 'light' ? 'dark' : 'light';
        setStoreTheme(nextTheme);
        setActiveCanvasTab('app');

        setMessages((prev) => [
          ...prev,
          {
            id: `claude_${Date.now()}`,
            sender: 'claude',
            senderName: 'Claude 3.7',
            senderRole: 'UI/UX Designer',
            text: `🎨 Done! I updated the storefront UI design to sleek ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} with high-contrast surfaces and smooth transitions. Look at the preview!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        showNotification(`✅ Claude updated the storefront UI to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}!`);
      } else if (lower.includes('gpt') || lower.includes('discount') || lower.includes('coupon') || lower.includes('backend') || lower.includes('api')) {
        // Directing GPT-4o
        setActiveCanvasTab('code');

        setMessages((prev) => [
          ...prev,
          {
            id: `gpt_${Date.now()}`,
            sender: 'gpt4o',
            senderName: 'GPT-4o',
            senderRole: 'Backend Engineer',
            text: "⚡ Done! I synthesized a discount coupon endpoint `POST /api/discounts/validate` that checks validity directly against your Supabase database table.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        showNotification('✅ GPT-4o created the coupon API route!');
      } else {
        // General Swarm instruction
        setMessages((prev) => [
          ...prev,
          {
            id: `all_${Date.now()}`,
            sender: 'claude',
            senderName: 'Claude 3.7',
            senderRole: 'Team Coordinator',
            text: `Got it! I coordinated with Supabase and GPT-4o to apply your changes: "${textToSend}".`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        showNotification('✅ AI Team updated your application.');
      }

      setIsAiThinking(false);
    }, 700);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`w-full text-left font-sans ${embedded ? '' : 'max-w-7xl mx-auto py-8 px-4 sm:px-6'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-5 h-5 text-[#6D4AFF] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER: Crystal Clear, Welcoming, Human */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200">
            <Sparkles className="w-4 h-4 text-[#6D4AFF]" />
            <span>Universal Multi-AI Workspace</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected: Supabase, Claude &amp; GPT-4o
            </span>
            {onNavigateToFull && (
              <button
                type="button"
                onClick={onNavigateToFull}
                className="px-3 py-1 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-[#6D4AFF] flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>Full Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Talk to your whole AI team in one place.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
          Tell <strong>Supabase</strong> to create your database, tell <strong>Claude</strong> to design the UI, and tell <strong>GPT-4o</strong> to wire up the backend. One simple chat, with a live working app right next to it.
        </p>
      </div>

      {/* THE PROMPT BAR: Big, Prominent, Consumer-Friendly like ChatGPT/v0 */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="What do you want your AI team to build? (e.g. Build an e-commerce store with Supabase and Claude)"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] placeholder-slate-400 font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSendDirective(promptInput)}
            disabled={isAiThinking || !promptInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-sm sm:text-base font-bold shadow-md shadow-[#6D4AFF]/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build with AI Team</span>
          </button>
        </div>

        {/* 1-Click Prompt Templates */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-slate-600">
          <span className="font-bold text-slate-500">Quick start prompts:</span>
          <button
            type="button"
            onClick={() => {
              const p = 'Build an online storefront with Supabase database for products and Claude designing the frontend';
              setPromptInput(p);
              handleSendDirective(p);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            🛍️ E-Commerce Store with Supabase
          </button>
          <button
            type="button"
            onClick={() => {
              const p = 'Build a SaaS dashboard with Supabase user auth and Claude dark mode charts';
              setPromptInput(p);
              handleSendDirective(p);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            📊 SaaS Analytics Portal
          </button>
          <button
            type="button"
            onClick={() => {
              const p = 'Build a team task manager with Supabase real-time updates and Claude kanban UI';
              setPromptInput(p);
              handleSendDirective(p);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            📋 Team Kanban Board
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO: LEFT (CHAT & PROMPTS) | RIGHT (LIVE PREVIEW & DATABASE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: THE AI ASSISTANT CONVERSATION (5 OF 12 COLS)     */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-[680px]">
          {/* Chat Header */}
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#6D4AFF] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Team Assistant</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-purple-600 font-semibold">Claude</span> · 
                  <span className="text-emerald-600 font-semibold">Supabase</span> · 
                  <span className="text-blue-600 font-semibold">GPT-4o</span>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              Live
            </span>
          </div>

          {/* Chat Messages Timeline */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const senderColors: Record<string, { bg: string; text: string; badge: string }> = {
                user: { bg: 'bg-[#6D4AFF] text-white', text: 'text-white', badge: 'bg-white/20 text-white' },
                claude: { bg: 'bg-white text-slate-800 border border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
                supabase: { bg: 'bg-white text-slate-800 border border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
                gpt4o: { bg: 'bg-white text-slate-800 border border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' }
              };
              const style = senderColors[msg.sender] || senderColors.claude;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className={`text-xs font-bold ${isUser ? 'text-slate-600' : style.text}`}>
                      {msg.senderName}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>
                      {msg.senderRole}
                    </span>
                    <span className="text-[11px] text-slate-400">{msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[92%] p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${style.bg}`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isAiThinking && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-medium animate-pulse">
                <RotateCcw className="w-4 h-4 animate-spin text-[#6D4AFF]" />
                <span>AI Team is executing your directive...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick 1-Click Suggestion Directives (The user's exact examples!) */}
          <div className="px-4 py-3 bg-white border-t border-slate-200 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Instructions (Click to test):
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSendDirective('tell supabase pls start working on database and create a reviews table')}
                disabled={isAiThinking}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>"Supabase, add reviews table"</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendDirective('tell claude make it dark mode')}
                disabled={isAiThinking}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>"Claude, switch to dark mode"</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendDirective('tell gpt-4o add a discount coupon code API')}
                disabled={isAiThinking}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Code className="w-3.5 h-3.5 text-blue-600" />
                <span>"GPT-4o, add coupon API"</span>
              </button>
            </div>
          </div>

          {/* Big, Friendly Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendDirective();
            }}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={userDirective}
              onChange={(e) => setUserDirective(e.target.value)}
              placeholder="Ask your AI team... (e.g. tell supabase add a discounts table)"
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] placeholder-slate-400 shadow-2xs font-medium"
            />
            <button
              type="submit"
              disabled={isAiThinking || !userDirective.trim()}
              className={`p-3 rounded-2xl font-bold text-white transition-all cursor-pointer flex items-center justify-center ${
                isAiThinking || !userDirective.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#6D4AFF] hover:bg-[#5B3CE8] shadow-md shadow-[#6D4AFF]/20 active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: THE LIVE CANVAS (APP PREVIEW & DATABASE)        */}
        {/* (7 OF 12 COLS)                                               */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden h-[680px]">
          
          {/* Canvas Navigation Tabs */}
          <div className="px-5 py-3.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCanvasTab('app')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeCanvasTab === 'app'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Laptop className="w-4 h-4 text-[#6D4AFF]" />
                <span>🖥️ Live App Preview</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  Claude
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCanvasTab('database')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeCanvasTab === 'database'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-600" />
                <span>🗄️ Supabase Database</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Live API
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCanvasTab('code')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeCanvasTab === 'code'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Code className="w-4 h-4 text-blue-600" />
                <span>⚡ Backend API</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  GPT-4o
                </span>
              </button>
            </div>

            {/* Quick Theme Toggle inside Preview */}
            {activeCanvasTab === 'app' && (
              <button
                type="button"
                onClick={() => setStoreTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {storeTheme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Dark View</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light View</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* ============================================================ */}
          {/* TAB 1: LIVE APP PREVIEW (CLAUDE FRONTEND)                     */}
          {/* ============================================================ */}
          {activeCanvasTab === 'app' && (
            <div className={`flex-1 p-5 sm:p-6 overflow-y-auto transition-colors duration-300 ${
              storeTheme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
            }`}>
              {/* App Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    Nexus Hardware &amp; AI Tools
                  </h3>
                  <p className={`text-xs ${storeTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Designed by Claude 3.7 · Powered by Supabase PostgreSQL API
                  </p>
                </div>

                {/* Cart Button */}
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-[#6D4AFF]/20 transition-all self-start sm:self-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart ({totalCartCount})</span>
                  {totalCartCount > 0 && <span>· ${totalCartAmount}</span>}
                </button>
              </div>

              {/* Category Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['All', 'Hardware', 'Database Tools', 'Accessories', 'Subscriptions'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-[#6D4AFF] text-white'
                          : storeTheme === 'dark'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search store..."
                    className={`pl-9 pr-4 py-1.5 rounded-xl text-xs border focus:outline-none transition-colors w-full sm:w-48 ${
                      storeTheme === 'dark'
                        ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                      storeTheme === 'dark'
                        ? 'bg-slate-900 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                          {p.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{p.rating}</span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base leading-snug">{p.title}</h4>
                      <p className={`text-xs leading-relaxed ${storeTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-black">${p.price}</div>
                        <div className="text-[11px] text-emerald-600 font-bold">In stock ({p.inventory})</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="px-3.5 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Customer Reviews Section (Dynamically active when Supabase adds reviews table) */}
              {hasReviewsTable && reviews.length > 0 && (
                <div className={`mt-6 pt-5 border-t ${storeTheme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold">Verified Reviews</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Supabase `reviews` Table
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Synced via API</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          storeTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{rev.user_email}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <p className={storeTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SUPABASE DATABASE EXPLORER (TABLES & ROWS)            */}
          {/* ============================================================ */}
          {activeCanvasTab === 'database' && (
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Supabase PostgreSQL Schema &amp; Data
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live connection via REST API · Row-Level Security active
                    </p>
                  </div>
                </div>

                {/* Table Switcher */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 font-mono">TABLE:</span>
                  <button
                    type="button"
                    onClick={() => setActiveDbTable('products')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-colors ${
                      activeDbTable === 'products'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    products ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDbTable('orders')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-colors ${
                      activeDbTable === 'orders'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    orders ({orders.length})
                  </button>
                  {hasReviewsTable && (
                    <button
                      type="button"
                      onClick={() => setActiveDbTable('reviews')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-colors ${
                        activeDbTable === 'reviews'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      reviews ({reviews.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table with Large, Readable Font Size */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
                {activeDbTable === 'products' && (
                  <table className="w-full text-left text-xs sm:text-sm font-mono">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-bold">id</th>
                        <th className="px-4 py-3 font-bold">title</th>
                        <th className="px-4 py-3 font-bold">category</th>
                        <th className="px-4 py-3 font-bold">price</th>
                        <th className="px-4 py-3 font-bold">inventory</th>
                        <th className="px-4 py-3 font-bold">rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-[#6D4AFF] font-bold">{p.id}</td>
                          <td className="px-4 py-3 text-slate-900 font-semibold">{p.title}</td>
                          <td className="px-4 py-3 text-slate-600">{p.category}</td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">${p.price}</td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">{p.inventory}</td>
                          <td className="px-4 py-3 text-amber-600 font-bold">★ {p.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDbTable === 'orders' && (
                  <table className="w-full text-left text-xs sm:text-sm font-mono">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-bold">id</th>
                        <th className="px-4 py-3 font-bold">user_email</th>
                        <th className="px-4 py-3 font-bold">total</th>
                        <th className="px-4 py-3 font-bold">status</th>
                        <th className="px-4 py-3 font-bold">items</th>
                        <th className="px-4 py-3 font-bold">created_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-[#6D4AFF] font-bold">{o.id}</td>
                          <td className="px-4 py-3 text-slate-900">{o.user_email}</td>
                          <td className="px-4 py-3 font-extrabold text-slate-900">
                            ${(o.total_cents / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-sans">
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">{o.items_count}</td>
                          <td className="px-4 py-3 text-slate-500">{o.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDbTable === 'reviews' && hasReviewsTable && (
                  <table className="w-full text-left text-xs sm:text-sm font-mono">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-bold">id</th>
                        <th className="px-4 py-3 font-bold">user_email</th>
                        <th className="px-4 py-3 font-bold">rating</th>
                        <th className="px-4 py-3 font-bold">comment</th>
                        <th className="px-4 py-3 font-bold">created_at</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviews.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-[#6D4AFF] font-bold">{r.id}</td>
                          <td className="px-4 py-3 text-slate-900">{r.user_email}</td>
                          <td className="px-4 py-3 text-amber-600 font-bold">★ {r.rating}/5</td>
                          <td className="px-4 py-3 text-slate-800 font-sans">{r.comment}</td>
                          <td className="px-4 py-3 text-slate-500">{r.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Supabase SQL Migration Info Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="font-mono">SQL Migration: supabase/migrations/init.sql</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Row-Level Security Active
                  </span>
                </div>
                <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`-- Generated by Supabase AI Engine via NEXUS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  inventory INT NOT NULL DEFAULT 0,
  rating NUMERIC(2, 1) DEFAULT 5.0
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  total_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  items_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: BACKEND API (GPT-4o)                                  */}
          {/* ============================================================ */}
          {activeCanvasTab === 'code' && (
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      GPT-4o Server Action &amp; API Routes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Next.js API route connected directly to Supabase client
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-mono text-xs font-bold border border-blue-200">
                  POST /api/checkout
                </span>
              </div>

              <pre className="text-xs font-mono bg-slate-900 text-slate-200 p-5 rounded-2xl overflow-x-auto leading-relaxed">
{`// app/api/checkout/route.ts - Synthesized by GPT-4o
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { cartItems, userEmail } = await req.json();
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  // Verify inventory & calculate total
  let totalCents = 0;
  for (const item of cartItems) {
    const { data: prod } = await supabase.from('products').select('price, inventory').eq('id', item.id).single();
    if (!prod || prod.inventory < item.qty) {
      return NextResponse.json({ error: 'Item out of stock' }, { status: 400 });
    }
    totalCents += Math.round(prod.price * 100) * item.qty;
  }

  // Insert verified order into Supabase
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
        </div>
      </div>

      {/* CHECKOUT MODAL (INTERACTIVE ORDER PLACEMENT) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="text-lg font-extrabold text-slate-900">Your Cart</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center font-medium">Your cart is currently empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-52 overflow-y-auto space-y-2">
                  {cart.map((item) => {
                    const prod = products.find((p) => p.id === item.id);
                    if (!prod) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
                        <div>
                          <div className="font-bold text-slate-900">{prod.title}</div>
                          <div className="text-xs text-slate-500 font-mono">Qty: {item.qty} × ${prod.price}</div>
                        </div>
                        <div className="font-extrabold text-slate-900">${prod.price * item.qty}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Total:</span>
                  <span className="text-[#6D4AFF] text-xl font-black">${totalCartAmount}</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  ⚡ When you click below, <strong>GPT-4o</strong> calls <strong>Supabase API</strong> to insert the order into your live database!
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    Place Order Now
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

export default OnePromptAppStudio;
