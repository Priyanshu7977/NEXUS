import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Layout & Shell
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/app/AppLayout';

// Eagerly loaded primary landing & studio components (zero delay for first paint)
import { HomePage } from './components/pages/HomePage';
import { StudioPage } from './components/pages/StudioPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';

// Lazy-loaded secondary public routes (chunked on-demand)
const ExplorePage = lazy(() => import('./components/pages/ExplorePage').then((m) => ({ default: m.ExplorePage })));
const ResourceDetailPage = lazy(() => import('./components/pages/ResourceDetailPage').then((m) => ({ default: m.ResourceDetailPage })));
const PricingPage = lazy(() => import('./components/pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const DevelopersPage = lazy(() => import('./components/pages/DevelopersPage').then((m) => ({ default: m.DevelopersPage })));
const DocsPage = lazy(() => import('./components/pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const SecurityPage = lazy(() => import('./components/pages/SecurityPage').then((m) => ({ default: m.SecurityPage })));
const OpenSourcePage = lazy(() => import('./components/pages/OpenSourcePage').then((m) => ({ default: m.OpenSourcePage })));
const ChangelogPage = lazy(() => import('./components/pages/ChangelogPage').then((m) => ({ default: m.ChangelogPage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const SwarmPage = lazy(() => import('./components/pages/SwarmPage').then((m) => ({ default: m.SwarmPage })));

// Lazy-loaded public auth pages
const ForgotPasswordPage = lazy(() => import('./components/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./components/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const RawOpenApiPage = lazy(() => import('./components/pages/RawOpenApiPage').then((m) => ({ default: m.RawOpenApiPage })));

// Lazy-loaded authenticated application routes (chunked on-demand)
const DashboardPage = lazy(() => import('./components/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AgentsPage = lazy(() => import('./components/pages/AgentsPage').then((m) => ({ default: m.AgentsPage })));
const AgentNewPage = lazy(() => import('./components/pages/AgentNewPage').then((m) => ({ default: m.AgentNewPage })));
const AgentDetailPage = lazy(() => import('./components/pages/AgentDetailPage').then((m) => ({ default: m.AgentDetailPage })));
const ConnectorsPage = lazy(() => import('./components/pages/ConnectorsPage').then((m) => ({ default: m.ConnectorsPage })));
const ConnectorDetailPage = lazy(() => import('./components/pages/ConnectorDetailPage').then((m) => ({ default: m.ConnectorDetailPage })));
const GitHubCallbackPage = lazy(() => import('./components/pages/GitHubCallbackPage').then((m) => ({ default: m.GitHubCallbackPage })));
const WorkflowsPage = lazy(() => import('./components/pages/WorkflowsPage').then((m) => ({ default: m.WorkflowsPage })));
const WorkflowBuilderPage = lazy(() => import('./components/pages/WorkflowBuilderPage').then((m) => ({ default: m.WorkflowBuilderPage })));
const WorkflowDetailPage = lazy(() => import('./components/pages/WorkflowDetailPage').then((m) => ({ default: m.WorkflowDetailPage })));
const ActivityPage = lazy(() => import('./components/pages/ActivityPage').then((m) => ({ default: m.ActivityPage })));
const ExecutionDetailPage = lazy(() => import('./components/pages/ExecutionDetailPage').then((m) => ({ default: m.ExecutionDetailPage })));
const UsagePage = lazy(() => import('./components/pages/UsagePage').then((m) => ({ default: m.UsagePage })));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

// Universal Suspense Loading Spinner for route transitions
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" aria-live="polite">
    <div className="w-9 h-9 rounded-full border-2 border-[#6D4AFF]/20 border-t-[#6D4AFF] animate-spin mb-3" />
    <span className="text-xs font-mono font-semibold text-[#8B919B] uppercase tracking-wider">
      Loading NEXUS View...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Website Routes (Wrapped with PublicLayout: Navbar + Footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/explore/:slug" element={<ResourceDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/developers" element={<DevelopersPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/open-source" element={<OpenSourcePage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/swarm" element={<SwarmPage />} />
            </Route>

            {/* Public Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Standalone Pure OpenAPI 3.1 Specification (Clean & Chrome-Free) */}
            <Route path="/api/v1/openapi.json" element={<RawOpenApiPage />} />
            <Route path="/api/v1/openapi" element={<RawOpenApiPage />} />

            {/* Authenticated Application Shell Routes (Protected via ProtectedRoute) */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Overview / Dashboard */}
              <Route index element={<DashboardPage />} />
              <Route path="studio" element={<StudioPage />} />
              <Route path="builder" element={<Navigate to="/app/studio" replace />} />
              <Route path="swarm" element={<SwarmPage />} />

              {/* Explore / Marketplace */}
              <Route path="explore" element={<ExplorePage />} />
              <Route path="explore/:slug" element={<ResourceDetailPage />} />

              {/* Agents */}
              <Route path="agents" element={<AgentsPage />} />
              <Route path="agents/new" element={<AgentNewPage />} />
              <Route path="agents/:id" element={<AgentDetailPage />} />

              {/* Connectors */}
              <Route path="connectors" element={<ConnectorsPage />} />
              <Route path="connectors/:id" element={<ConnectorDetailPage />} />
              <Route path="connectors/callback/github" element={<GitHubCallbackPage />} />

              {/* Workflows */}
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/new" element={<WorkflowBuilderPage />} />
              <Route path="workflows/:id" element={<WorkflowDetailPage />} />

              {/* Activity & Logs */}
              <Route path="activity" element={<ActivityPage />} />
              <Route path="activity/:id" element={<ExecutionDetailPage />} />

              {/* Usage & Metrics */}
              <Route path="usage" element={<UsagePage />} />

              {/* Settings & Sub-pages */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/:tab" element={<SettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
