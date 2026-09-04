import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { 
  validateGitHubOAuthState, 
  exchangeGitHubCodeForToken, 
  fetchGitHubUser 
} from '../../services/githubService';
import { saveConnectorConnection } from '../../services/connectorService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const GitHubCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [status, setStatus] = useState<'validating' | 'exchanging' | 'success' | 'error'>('validating');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [connectedUser, setConnectedUser] = useState<string>('');
  const processedRef = useRef(false);

  useEffect(() => {
    // Avoid double invocation in React StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');

      // 1. Check for OAuth error from GitHub (e.g. user cancelled)
      if (error) {
        setStatus('error');
        setErrorMessage(
          error === 'access_denied'
            ? 'GitHub authorization request was cancelled or denied.'
            : (errorDesc || `GitHub returned error: ${error}`)
        );
        return;
      }

      if (!code || !stateParam) {
        setStatus('error');
        setErrorMessage('Invalid callback: missing authorization code or state parameter.');
        return;
      }

      // 2. Validate cryptographic state parameter
      setStatus('validating');
      const validation = validateGitHubOAuthState(stateParam);
      if (!validation.valid || !validation.payload) {
        setStatus('error');
        setErrorMessage(validation.error || 'OAuth state validation failed. The authorization request may have expired.');
        return;
      }

      const targetWorkspaceId = validation.payload.workspaceId || currentWorkspace?.id;
      if (!targetWorkspaceId) {
        setStatus('error');
        setErrorMessage('Could not identify target workspace for this connection.');
        return;
      }

      // 3. Exchange code for access token
      setStatus('exchanging');
      try {
        const tokenData = await exchangeGitHubCodeForToken(code);
        
        // 4. Fetch GitHub user profile
        const userProfile = await fetchGitHubUser(tokenData.accessToken);
        setConnectedUser(userProfile.login);

        // 5. Store connection in database
        const saveRes = await saveConnectorConnection(targetWorkspaceId, {
          connectorId: 'github',
          providerAccountId: String(userProfile.id),
          providerAccountName: userProfile.login,
          providerAvatarUrl: userProfile.avatar_url,
          scopes: tokenData.scopes,
          accessToken: tokenData.accessToken,
          metadata: {
            name: userProfile.name,
            html_url: userProfile.html_url,
            bio: userProfile.bio,
            public_repos: userProfile.public_repos,
            followers: userProfile.followers,
          },
        });

        if (saveRes.error) {
          setStatus('error');
          setErrorMessage(saveRes.error);
          return;
        }

        setStatus('success');
        setTimeout(() => {
          navigate(validation.payload?.returnUrl || '/app/connectors');
        }, 1500);
      } catch (exchangeErr: any) {
        setStatus('error');
        setErrorMessage(exchangeErr.message || 'Failed to exchange authorization code for access token.');
      }
    };

    handleCallback();
  }, [searchParams, currentWorkspace, navigate]);

  return (
    <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <BrandLogo brand="github" size={28} />
        </div>

        {status === 'validating' && (
          <div>
            <h2 className="text-lg font-bold text-[#111318] mb-2">
              Validating GitHub Authorization
            </h2>
            <p className="text-xs text-[#626873] mb-6">
              Verifying cryptographic state and security tokens...
            </p>
            <Loader2 className="w-6 h-6 text-[#6D4AFF] animate-spin mx-auto" />
          </div>
        )}

        {status === 'exchanging' && (
          <div>
            <h2 className="text-lg font-bold text-[#111318] mb-2">
              Connecting GitHub Account
            </h2>
            <p className="text-xs text-[#626873] mb-6">
              Securing access token and retrieving repository metadata...
            </p>
            <Loader2 className="w-6 h-6 text-[#6D4AFF] animate-spin mx-auto" />
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-[#111318] mb-1">
              GitHub Connected Successfully!
            </h2>
            <p className="text-xs text-[#626873] mb-6">
              Linked account <span className="font-mono font-semibold text-[#111318]">@{connectedUser}</span> to your workspace. Redirecting to Connectors...
            </p>
            <div className="w-full bg-[#FAFAF8] rounded-full h-1.5 overflow-hidden border border-[#E5E5E2]">
              <div className="bg-[#6D4AFF] h-full animate-[pulse_1s_infinite] w-full" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-left">
            <div className="flex items-center gap-2 mb-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <h2 className="text-base font-bold">
                GitHub Connection Failed
              </h2>
            </div>
            
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-mono mb-6 break-words">
              {errorMessage}
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/app/connectors')}
                className="w-full justify-center"
              >
                Return to Connectors
              </Button>
              <Link
                to="/app/connectors"
                className="text-xs text-center text-[#626873] hover:text-[#111318] transition-colors py-1"
              >
                Or configure with Personal Access Token
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
