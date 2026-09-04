import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { Button } from '../ui/Button';
import { BrandLogo } from '../brand/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch {
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const res = await signInWithOAuth('github');
      if (res.success) {
        navigate(from, { replace: true });
      } else if (res.error) {
        setError(res.error);
      }
    } catch {
      setError('GitHub authentication failed.');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <AuthLayout quote="Connect every agent. Make them work together.">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1.5">
          Welcome back.
        </h2>
        <p className="text-sm text-[#626873]">
          Continue building with NEXUS.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
          {error}
        </div>
      )}

      {/* GitHub OAuth Action */}
      <button
        type="button"
        disabled={oauthLoading || loading}
        onClick={handleGitHubLogin}
        className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-sm font-medium text-[#111318] transition-all mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <BrandLogo brand="github" size={18} />
        <span>{oauthLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="h-[1px] flex-1 bg-[#E5E5E2]" />
        <span className="text-[11px] text-[#8B919B]">or with email</span>
        <div className="h-[1px] flex-1 bg-[#E5E5E2]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-[#111318] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@nexus.dev"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAFAF8] focus:bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#111318]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#6D4AFF] hover:text-[#5B3CE8] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAFAF8] focus:bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          withArrow
          disabled={loading || oauthLoading}
          className="w-full mt-2"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#EFEFEA] text-center text-xs text-[#626873]">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#6D4AFF] font-semibold hover:text-[#5B3CE8] transition-colors">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
};
