import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../auth/AuthLayout';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await updatePassword(password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/app');
        }, 2000);
      } else {
        setError(res.error || 'Failed to update password. Please try requesting a new reset link.');
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
          Set new password.
        </h2>
        <p className="text-sm text-[#626873]">
          Enter your new password to restore access to your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#111318] mb-1">
            Password updated successfully
          </h3>
          <p className="text-xs text-[#626873] mb-4">
            Redirecting to your workspace...
          </p>
          <Button size="sm" onClick={() => navigate('/app')} className="w-full">
            Go to workspace now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              New Password (8+ characters)
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

          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
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
            {loading ? 'Updating password...' : 'Update password'}
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
