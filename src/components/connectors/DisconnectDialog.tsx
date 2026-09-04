import React from 'react';
import { BrandLogo, BrandName } from '../brand/BrandLogo';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DisconnectDialogProps {
  isOpen: boolean;
  connectorName: string;
  brand: BrandName;
  accountName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DisconnectDialog: React.FC<DisconnectDialogProps> = ({
  isOpen,
  connectorName,
  brand,
  accountName,
  loading,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border border-[#E5E5E2] rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 relative">
            <BrandLogo brand={brand} size={22} />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5" />
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111318] mb-1">
              Disconnect {connectorName}?
            </h3>
            <p className="text-xs text-[#626873] leading-relaxed">
              Are you sure you want to disconnect <span className="font-semibold text-[#111318]">@{accountName}</span> from this workspace?
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] mb-6 text-xs text-[#626873] leading-relaxed">
          <p className="mb-1.5 font-medium text-[#111318]">
            What happens after disconnecting:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>NEXUS agents will immediately lose access to repository metadata and branch trees.</li>
            <li>Stored OAuth tokens will be permanently deleted from database records.</li>
            <li>You can reconnect this or another account anytime.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
