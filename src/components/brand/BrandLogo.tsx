import React from 'react';

export type BrandName =
  | 'github'
  | 'vercel'
  | 'openai'
  | 'gemini'
  | 'google gemini'
  | 'anthropic'
  | 'claude'
  | 'supabase'
  | 'mongodb'
  | 'postgres'
  | 'postgresql'
  | 'wordpress'
  | 'shopify'
  | 'slack'
  | 'notion'
  | 'discord'
  | 'docker'
  | 'firebase'
  | 'opentelemetry'
  | 'nexus'
  | 'nexus-core';

export interface BrandLogoProps {
  brand: BrandName | string;
  size?: number;
  className?: string;
  monochrome?: boolean;
  hoverEffect?: boolean;
  title?: string;
}

function resolveBrand(input: string): string {
  const s = (input || '').toLowerCase().trim();
  if (s.includes('anthropic') || s.includes('claude')) return 'anthropic';
  if (s.includes('gemini') || s.includes('google')) return 'gemini';
  if (s.includes('openai') || s.includes('gpt')) return 'openai';
  if (s.includes('github') || s.includes('git')) return 'github';
  if (s.includes('vercel')) return 'vercel';
  if (s.includes('supabase')) return 'supabase';
  if (s.includes('mongo')) return 'mongodb';
  if (s.includes('postgres')) return 'postgres';
  if (s.includes('wordpress')) return 'wordpress';
  if (s.includes('shopify')) return 'shopify';
  if (s.includes('slack')) return 'slack';
  if (s.includes('notion')) return 'notion';
  if (s.includes('discord')) return 'discord';
  if (s.includes('docker') || s.includes('container')) return 'docker';
  if (s.includes('firebase')) return 'firebase';
  if (s.includes('telemetry') || s.includes('otel') || s.includes('opentelemetry')) return 'opentelemetry';
  if (s.includes('nexus')) return 'nexus';
  return s;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brand,
  size = 20,
  className = '',
  monochrome = false,
  hoverEffect = false,
  title
}) => {
  const normalized = resolveBrand(brand);

  // Render official SVG for each brand with crisp subpixel rendering
  const renderIcon = () => {
    switch (normalized) {
      case 'github':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="GitHub" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        );

      case 'vercel':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Vercel" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M24 22.525H0l12-21.05 12 21.05z" />
          </svg>
        );

      case 'openai':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="OpenAI" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.771-4.205 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.746-7.074zm-9.022 12.608a4.475 4.475 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.692 18.045a4.475 4.475 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.048-1.905zm-1.636-8.913a4.485 4.485 0 0 1 2.34-1.974V12.75a.776.776 0 0 0 .39.676l5.845 3.372-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.056 9.132zm16.142 3.256l-5.845-3.372 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.68a.79.79 0 0 0-.4-.676zm2.11-4.48a4.49 4.49 0 0 1 .535 3.014l-.142-.085-4.783-2.759a.771.771 0 0 0-.78 0l-5.843 3.369V9.156a.08.08 0 0 1 .033-.062l4.932-2.847a4.5 4.5 0 0 1 6.048 1.905zM8.343 14.542l2.956-1.705 2.956 1.705v3.411l-2.956 1.705-2.956-1.705v-3.411z" />
          </svg>
        );

      case 'gemini':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Google Gemini" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
          </svg>
        );

      case 'anthropic':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Anthropic Claude" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M13.827 2.164a.75.75 0 0 0-.96 0L8.293 6.05a.75.75 0 0 0-.256.456l-1.39 6.81a.75.75 0 0 0 .428.825l6.096 2.875a.75.75 0 0 0 .907-.184l4.966-5.815a.75.75 0 0 0 .148-.567l-1.077-6.862a.75.75 0 0 0-.288-.479l-4.007-2.965zm-2.072 6.42a1.5 1.5 0 1 1 2.298-1.927 1.5 1.5 0 0 1-2.298 1.927zM2.87 14.494a.75.75 0 0 1 .91-.538l6.815 1.73a.75.75 0 0 1 .53.518l2.128 6.57a.75.75 0 0 1-.84.954l-7.394-1.637a.75.75 0 0 1-.571-.62l-.578-6.977zm18.26 0a.75.75 0 0 0-.91-.538l-6.815 1.73a.75.75 0 0 0-.53.518l-2.128 6.57a.75.75 0 0 0 .84.954l7.394-1.637a.75.75 0 0 0 .571-.62l.578-6.977z" />
          </svg>
        );

      case 'supabase':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Supabase" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.32 14.077a.79.79 0 0 0 .618 1.277h9.362v8.958a.396.396 0 0 0 .716.233l10.964-13.914a.79.79 0 0 0-.618-1.277z" />
          </svg>
        );

      case 'mongodb':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="MongoDB" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M12 0C11.83 0 11.66.08 11.53.22 8.65 3.39 4.5 8.78 4.5 14.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-5.72-4.15-11.11-7.03-14.28A1.95 1.95 0 0 0 12 0zm.04 2.1c2.14 2.68 5.46 7.39 5.46 12.4 0 3.03-2.47 5.5-5.5 5.5-.66 0-1.28-.12-1.87-.33l4.31-7.86c.27-.49-.08-1.09-.64-1.09h-3.4l2.19-5.12c.21-.49-.15-1.04-.68-1.04-.15 0-.3.04-.43.12L7.36 9.38c-.37.24-.49.73-.28 1.12l3.41 6.22C8.36 15.93 7 14.36 7 12.5c0-4.01 2.89-7.72 5.04-10.4z" />
          </svg>
        );

      case 'postgres':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="PostgreSQL" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M11.97 0C5.358 0 0 5.358 0 11.97c0 4.673 2.673 8.72 6.544 10.686-.1-.58-.163-1.233-.163-1.957 0-3.155 1.705-5.32 3.824-5.32.33 0 .647.053.948.149a4.87 4.87 0 0 0-.256-1.543c-.496-1.524-1.595-2.22-3.119-2.22-2.316 0-4.14 1.884-4.14 4.2 0 .393.057.77.159 1.13C1.512 15.341.5 12.775.5 11.97.5 5.635 5.635.5 11.97.5c6.336 0 11.47 5.135 11.47 11.47 0 .805-1.012 3.371-3.493 4.905.102-.36.159-.737.159-1.13 0-2.316-1.824-4.2-4.14-4.2-1.524 0-2.623.696-3.119 2.22-.116.357-.197.88-.256 1.543.301-.096.618-.149.948-.149 2.119 0 3.824 2.165 3.824 5.32 0 .724-.063 1.377-.163 1.957C21.327 20.69 24 16.643 24 11.97 24 5.358 18.582 0 11.97 0z" />
          </svg>
        );

      case 'wordpress':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="WordPress" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M12.158 12.786l-2.698 7.86c.806.236 1.657.365 2.54.365 1.047 0 2.051-.181 2.986-.51-.024-.038-.046-.079-.065-.123l-2.763-7.592zm-8.48-1.57c0 3.125 1.613 5.867 4.025 7.447L3.923 8.35a8.96 8.96 0 0 0-.245 2.866zm15.656-3.05a8.97 8.97 0 0 0-4.63-4.142l4.47 12.246c1.62-1.637 2.62-3.89 2.62-6.38 0-.61-.06-1.205-.17-1.78l-2.29.056zm-7.334-5.75c-.65 0-1.28.08-1.89.23l2.84 8.24 2.85-7.8c-.01 0-.02-.01-.03-.01-.98-.44-2.26-.66-3.77-.66zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
        );

      case 'shopify':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Shopify" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M19.467 4.41c-.04-.2-.2-.36-.4-.38-.2-.03-6.52-.45-6.52-.45s-1.84-1.82-2.03-2.02c-.2-.2-.59-.14-.76.01l-1.07 1.07L6.8 3.32c-.32.06-.47.45-.34.74l3.19 18.06c.07.4.42.69.83.69h.1c.36-.03 10.9-1.32 10.9-1.32s.06-.01.09-.03c.27-.18.42-.48.37-.81L19.467 4.41zm-6.2 1.34l-2.82.88 1.4-1.4 1.42.52zm-3.82.88l-1.93.6 1.4-1.4.53.8zm2.6 13.5l-2.63-14.9 2.67-.84 2.64 15.34-2.68.4zm4.84-.75l-1.52-8.87 2.86-.9 1.25 9.09-2.59.68z" />
          </svg>
        );

      case 'slack':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Slack" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
          </svg>
        );

      case 'notion':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Notion" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L18.3 2.296c-.466-.373-.98-.746-2.286-.653L2.873 2.67c-.42.046-.513.326-.373.56l1.959.978zm.56 3.173v13.627c0 .793.42 1.12 1.26 1.073l14.195-.84c.84-.047.933-.56.933-1.12V6.634c0-.606-.233-.886-.793-.84l-14.802.887c-.56.046-.793.326-.793.7zm12.37.793l.14 9.893c0 .513-.233.7-.606.746-.374.047-.7-.14-.933-.513l-4.529-6.953v6.72c0 .466-.233.7-.7.746l-1.354.093c-.42.047-.653-.187-.653-.653V9.108c0-.466.233-.7.7-.746l1.82-.14c.467-.046.84.187 1.12.653l4.295 6.58V8.921c0-.466.28-.7.747-.746l1.4-.093c.467-.047.7.187.7.653z" />
          </svg>
        );

      case 'discord':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Discord" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        );

      case 'docker':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Docker" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.714h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H2.216a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185M23.76 9.89c-.365-.246-.94-.365-1.57-.365-.242 0-.486.018-.724.054-.343-1.026-1.127-1.85-2.193-2.316l-.372-.16-.275.303c-.66.726-1.022 1.686-1.022 2.705 0 .285.028.567.085.845-.37-.024-.766-.024-1.17-.024H.76a.76.76 0 00-.76.76v.38c0 3.23 1.547 6.138 4.246 7.983C6.73 21.6 9.68 22.5 12.82 22.5c8.32 0 11.18-5.71 11.18-10.74 0-.69-.08-1.37-.24-1.87z" />
          </svg>
        );

      case 'firebase':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="Firebase" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.28l3.543 6.638zm16.787 2.133L18.43 3.655a.542.542 0 0 0-.962-.207l-4.512 8.448 4.887 2.82zM1.464 17.848L3.25 6.772a.542.542 0 0 1 .974-.239l11.17 11.233-6.666 3.754a2.036 2.036 0 0 1-1.928.028z" />
          </svg>
        );

      case 'opentelemetry':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-label="OpenTelemetry" shapeRendering="geometricPrecision" className="shrink-0">
            <path d="M12.002 0c-.57 0-1.12.23-1.52.64L7.69 3.43a2.15 2.15 0 0 0 0 3.04l.79.79-2.07 2.07a2.15 2.15 0 0 0 0 3.04l.79.79-4.8 4.8a2.15 2.15 0 0 0 0 3.04l1.41 1.41c.4.4.95.63 1.52.63s1.12-.23 1.52-.63l4.8-4.8.79.79a2.15 2.15 0 0 0 3.04 0l2.07-2.07.79.79a2.15 2.15 0 0 0 3.04 0l2.79-2.79c.84-.84.84-2.2 0-3.04l-2.79-2.79a2.15 2.15 0 0 0-3.04 0l-.79.79-2.07-2.07.79-.79a2.15 2.15 0 0 0 0-3.04L13.52.64c-.4-.41-.95-.64-1.52-.64z" />
          </svg>
        );

      case 'nexus':
      case 'nexus-core':
        return (
          <svg viewBox="0 0 32 32" width={size} height={size} fill="none" shapeRendering="geometricPrecision" aria-label="NEXUS" className="shrink-0">
            <polygon
              points="16,3 28,10 28,22 16,29 4,22 4,10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <line x1="16" y1="3" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="28" y1="22" x2="16" y2="16" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="4" y1="22" x2="16" y2="16" stroke="#6D4AFF" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="#6D4AFF" />
            <circle cx="16" cy="16" r="1.2" fill="#FFFFFF" />
            <circle cx="16" cy="3" r="1.5" fill="#3B82F6" />
            <circle cx="28" cy="22" r="1.5" fill="#6D4AFF" />
            <circle cx="4" cy="22" r="1.5" fill="#3B82F6" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision" aria-label={brand} className="shrink-0">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        );
    }
  };

  const colorClass = className.includes('text-')
    ? ''
    : monochrome
    ? 'text-[#4B5563]'
    : 'text-[#111318]';

  return (
    <div
      title={title || brand}
      className={`inline-flex items-center justify-center shrink-0 ${colorClass} ${
        hoverEffect ? 'hover:opacity-85 transition-opacity' : ''
      } ${className}`}
    >
      {renderIcon()}
    </div>
  );
};
