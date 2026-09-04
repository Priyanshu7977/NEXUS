import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || 'Unable to send password reset link.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Deterministic security and control for AI workflows.">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1.5">
          Reset your password.
        </h2>
        <p className="text-sm text-[#626873]">
          Enter your email address to receive password reset instructions.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
          {error}
        </div>
      )}

      {submitted ? (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#111318] mb-1">
            Check your inbox
          </h3>
          <p className="text-xs text-[#626873] mb-4">
            We sent a reset link to <span className="text-[#111318] font-mono">{email}</span>.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="sm" className="w-full">
              Back to log in
            </Button>
          </Link>
        </div>
      ) : (
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

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Sending link...' : 'Send reset link'}
          </Button>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-[#626873] hover:text-[#111318] transition-colors">
              ← Return to log in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
