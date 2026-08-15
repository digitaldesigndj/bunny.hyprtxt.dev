import React from 'react';
import { Download, X, Share2, Sparkles } from 'lucide-react';

interface PhotoModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `meadow-bunny-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Meadow Photo Snapshot</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Image */}
        <div className="p-4 bg-black/40 flex items-center justify-center">
          <img
            src={photoUrl}
            alt="Meadow Bunny Snapshot"
            className="max-h-[60vh] w-auto rounded-2xl border border-zinc-800 shadow-lg object-contain"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/90">
          <p className="text-xs text-zinc-400">Captured in high-definition WebGL</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
