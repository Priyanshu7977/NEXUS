import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { Button } from '../ui/Button';
import { BrandLogo } from '../brand/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const { signup, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        if (res.error) {
          setEmailConfirmationRequired(true);
        } else {
          navigate('/app');
        }
      } else {
        setError(res.error || 'Could not create account. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const res = await signInWithOAuth('github');
      if (res.success) {
        navigate('/app');
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
    <AuthLayout quote="Build the system your agents deserve.">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1.5">
          Build your agent system.
        </h2>
        <p className="text-sm text-[#626873]">
          Create your NEXUS workspace and start orchestrating.
        </p>
      </div>

      {emailConfirmationRequired ? (
        <div className="p-5 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#6D4AFF] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#111318] mb-1">
            Verification link sent
          </h3>
          <p className="text-xs text-[#626873] mb-4 leading-relaxed">
            We sent a confirmation email to <span className="text-[#111318] font-mono">{email}</span>. Click the link in the email to activate your account.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="sm" className="w-full">
              Go to log in
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
              {error}
            </div>
          )}

          {/* GitHub Quick Signup */}
          <button
            type="button"
            disabled={oauthLoading || loading}
            onClick={handleGitHubSignup}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-sm font-medium text-[#111318] transition-all mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <BrandLogo brand="github" size={18} />
            <span>{oauthLoading ? 'Connecting to GitHub...' : 'Sign up with GitHub'}</span>
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-[1px] flex-1 bg-[#E5E5E2]" />
            <span className="text-[11px] text-[#8B919B]">or with email</span>
            <div className="h-[1px] flex-1 bg-[#E5E5E2]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAFAF8] focus:bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAFAF8] focus:bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF] text-sm text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Password (8+ characters)
              </label>
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
              {loading ? 'Creating workspace...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EFEFEA] text-center text-xs text-[#626873]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6D4AFF] font-semibold hover:text-[#5B3CE8] transition-colors">
              Log in
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};
