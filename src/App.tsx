import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Layout & Marketing Pages
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './components/pages/HomePage';
import { ExplorePage } from './components/pages/ExplorePage';
import { ResourceDetailPage } from './components/pages/ResourceDetailPage';
import { PricingPage } from './components/pages/PricingPage';
import { DevelopersPage } from './components/pages/DevelopersPage';
import { DocsPage } from './components/pages/DocsPage';
import { SecurityPage } from './components/pages/SecurityPage';
import { OpenSourcePage } from './components/pages/OpenSourcePage';
import { ChangelogPage } from './components/pages/ChangelogPage';
import { AboutPage } from './components/pages/AboutPage';
import { SwarmPage } from './components/pages/SwarmPage';
import { StudioPage } from './components/pages/StudioPage';

// Public Auth Pages
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { RawOpenApiPage } from './components/pages/RawOpenApiPage';

// Authenticated App Shell & Pages
import { AppLayout } from './components/app/AppLayout';
import { DashboardPage } from './components/pages/DashboardPage';
import { AgentsPage } from './components/pages/AgentsPage';
import { AgentNewPage } from './components/pages/AgentNewPage';
import { AgentDetailPage } from './components/pages/AgentDetailPage';
import { ConnectorsPage } from './components/pages/ConnectorsPage';
import { ConnectorDetailPage } from './components/pages/ConnectorDetailPage';
import { GitHubCallbackPage } from './components/pages/GitHubCallbackPage';
import { WorkflowsPage } from './components/pages/WorkflowsPage';
import { WorkflowBuilderPage } from './components/pages/WorkflowBuilderPage';
import { WorkflowDetailPage } from './components/pages/WorkflowDetailPage';
import { ActivityPage } from './components/pages/ActivityPage';
import { ExecutionDetailPage } from './components/pages/ExecutionDetailPage';
import { UsagePage } from './components/pages/UsagePage';
import { SettingsPage } from './components/pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes (Wrapped with PublicLayout: Navbar + Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
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
            <Route path="/studio" element={<StudioPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
