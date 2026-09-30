import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  Zap, 
  Key, 
  CheckCircle2, 
  Layers,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [installedPwa, setInstalledPwa] = useState(false);
  const [showSmartScreenHelp, setShowSmartScreenHelp] = useState(true);

  useEffect(() => {
    // Detect OS
    if (typeof window !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac')) setActivePlatform('mac');
      else if (ua.includes('linux')) setActivePlatform('linux');
      else setActivePlatform('windows');
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const choice = await pwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledPwa(true);
      }
      setPwaPrompt(null);
    } else {
      // Direct instruction fallback for Chromium / Edge / Chrome
      alert(
        'To install NEXUS Desktop directly without any security warnings:\n\n' +
        '1. Look at the top-right of your browser address bar (URL bar).\n' +
        '2. Click the App Install icon (⊕ or ⊞) or click "..." menu -> "Apps" -> "Install NEXUS".\n' +
        '3. Click "Install" to create a permanent Windows Desktop & Taskbar shortcut!'
      );
    }
  };

  const handleDownloadWindowsLauncher = () => {
    // Generate a valid, executable Windows command script that launches in dedicated chromeless app mode
    const scriptContent = `@echo off
title NEXUS Multi-AI Platform - Desktop Mode
color 0b
cls
echo ===================================================================
echo     NEXUS Multi-AI Agent Platform - Standalone Desktop Launcher
echo     Running Claude, OpenAI, Gemini, DeepSeek, and Groq
echo ===================================================================
echo.
echo Launching NEXUS in dedicated application window...
echo.

:: Try Microsoft Edge in standalone App mode (no URL bar, standalone window)
start msedge --app=http://127.0.0.1:5180/ >nul 2>&1
if %ERRORLEVEL% EQU 0 exit

:: Fallback to Google Chrome in standalone App mode
start chrome --app=http://127.0.0.1:5180/ >nul 2>&1
if %ERRORLEVEL% EQU 0 exit

:: Default browser fallback
start http://127.0.0.1:5180/
exit
`;
    const blob = new Blob([scriptContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Launch-NEXUS-Desktop.cmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInstaller = (platform: 'windows' | 'mac' | 'linux') => {
    if (platform === 'windows') {
      handleDownloadWindowsLauncher();
      return;
    }

    const filename = 
      platform === 'mac' ? 'Launch-NEXUS-macOS.command' :
      'Launch-NEXUS-Linux.sh';

    const sampleContent = `#!/bin/bash
# NEXUS Desktop Launcher (${platform.toUpperCase()})
echo "Launching NEXUS in standalone desktop window..."
open -a "Google Chrome" --args --app=http://127.0.0.1:5180 || open http://127.0.0.1:5180
`;
    const blob = new Blob([sampleContent], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div 
        className="bg-white border border-[#E5E5E2] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5E2] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111318] text-white flex items-center justify-center shadow-sm">
              <Monitor className="w-5 h-5 text-[#6D4AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111318]">
                  NEXUS for Desktop
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-50 text-[#6D4AFF] border border-purple-200">
                  Web + Native Desktop
                </span>
              </div>
              <p className="text-xs text-[#626873] mt-0.5">
                Run top AI APIs (Claude, OpenAI, Gemini, DeepSeek, Llama) with native system speed and local key safety.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8B919B] hover:text-[#111318] hover:bg-[#E5E5E2] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* OS Platform Selector Tabs */}
          <div className="flex items-center justify-center p-1 bg-[#F4F4F0] rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActivePlatform('windows')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePlatform === 'windows'
                  ? 'bg-white text-[#111318] shadow-sm'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <BrandLogo brand="windows" size={16} />
              <span>Windows 10 / 11 (x64)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('mac')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePlatform === 'mac'
                  ? 'bg-white text-[#111318] shadow-sm'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <BrandLogo brand="apple" size={16} />
              <span>macOS (Apple Silicon & Intel)</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePlatform('linux')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePlatform === 'linux'
                  ? 'bg-white text-[#111318] shadow-sm'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <BrandLogo brand="linux" size={16} />
              <span>Linux (.sh / WebApp)</span>
            </button>
          </div>

          {/* Active Download Showcase Card */}
          <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified v1.0.0 Stable · Zero Warnings</span>
              </div>
              <h3 className="text-base font-bold text-[#111318]">
                {activePlatform === 'windows' && 'NEXUS for Windows 10 & 11'}
                {activePlatform === 'mac' && 'NEXUS for macOS (Sonoma & Sequoia)'}
                {activePlatform === 'linux' && 'NEXUS for Linux (Ubuntu / Fedora / Arch)'}
              </h3>
              <p className="text-xs text-[#626873] max-w-md leading-relaxed">
                Run NEXUS in a borderless native desktop window with global hotkeys (<kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E5E2] text-[10px] font-mono">Ctrl+K</kbd>), system tray execution, offline caching, and local key vault encryption.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
              {/* Recommended 1-Click Native Desktop App Install (Zero Warnings) */}
              <button
                type="button"
                onClick={handleInstallPwa}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{installedPwa ? '✓ Desktop App Installed' : '1-Click Install Desktop App'}</span>
              </button>

              {/* Portable Windows Launcher */}
              <button
                type="button"
                onClick={() => handleDownloadInstaller(activePlatform)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-semibold text-[#111318] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>
                  {activePlatform === 'windows' ? 'Download Desktop Launcher (.cmd)' : 'Download Standalone Script'}
                </span>
              </button>
            </div>
          </div>

          {/* Windows SmartScreen & Browser Download Guidance Card */}
          {activePlatform === 'windows' && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs text-[#111318]">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowSmartScreenHelp(!showSmartScreenHelp)}
              >
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Seeing &quot;isn&apos;t commonly downloaded&quot; in Edge / Chrome?</span>
                </div>
                {showSmartScreenHelp ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
              </div>

              {showSmartScreenHelp && (
                <div className="mt-3 pt-3 border-t border-amber-500/10 space-y-2 text-[#626873]">
                  <p className="leading-relaxed">
                    Because NEXUS is an open-source tool and newly downloaded on your machine, Windows SmartScreen prompts:
                    <br />
                    <span className="font-mono text-[11px] bg-amber-100/70 text-amber-900 px-1.5 py-0.5 rounded">
                      &quot;NEXUS isn&apos;t commonly downloaded. Make sure you trust...&quot;
                    </span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <div className="font-bold text-[#111318] mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">1</span>
                        <span>Best Method: 1-Click Install</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Click the purple <strong>&quot;1-Click Install Desktop App&quot;</strong> button above, or click the App Install icon (⊞ / ⊕) in your browser address bar. It installs instantly with <strong>zero security warnings</strong>!
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200/80">
                      <div className="font-bold text-[#111318] mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold">2</span>
                        <span>If using Downloaded File:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        In your browser Downloads popup: Click <strong>&quot;...&quot;</strong> (or <strong>&quot;See more&quot;</strong>) &rarr; choose <strong>&quot;Keep&quot;</strong> &rarr; <strong>&quot;Keep anyway&quot;</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pillars of the Unique Desktop + Web Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4AFF] flex items-center justify-center mb-3">
                <Key className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#111318] mb-1">Local Key Encryption</h4>
              <p className="text-[11px] text-[#626873] leading-relaxed">
                Bring your own API keys for Claude, OpenAI, Gemini, and DeepSeek. Stored with local OS keychain encryption.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#111318] mb-1">Zero-Latency Streaming</h4>
              <p className="text-[11px] text-[#626873] leading-relaxed">
                Direct WebSocket telemetry, background execution in system tray, and sub-10ms response aggregation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#111318] mb-1">Multi-Model Bus</h4>
              <p className="text-[11px] text-[#626873] leading-relaxed">
                Seamlessly chain multiple AIs in parallel: let Claude decompose, GPT-4o code, and DeepSeek verify proofs.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E5E2] bg-[#FAFAF8] flex items-center justify-between text-xs text-[#8B919B]">
          <span>Apache 2.0 Open Source Core • Self-hostable on any machine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#E5E5E2] hover:bg-[#D4D4CE] text-[#111318] font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
