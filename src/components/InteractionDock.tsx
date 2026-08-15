import React from 'react';
import {
  Sparkles,
  Footprints,
  Moon,
  Sun,
  HandMetal,
  Info,
} from 'lucide-react';

interface InteractionDockProps {
  onFeedCarrot: () => void;
  onPetBunny: () => void;
  onHop: () => void;
  onToggleSleep: () => void;
  isSleeping: boolean;
}

export const InteractionDock: React.FC<InteractionDockProps> = ({
  onFeedCarrot,
  onPetBunny,
  onHop,
  onToggleSleep,
  isSleeping,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 max-w-[92vw] pointer-events-none">
      {/* Interactive Helper Banner */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-black/60 dark:bg-black/70 backdrop-blur-md text-white rounded-full text-[11px] font-medium shadow-md border border-white/10 pointer-events-auto">
        <Info className="w-3.5 h-3.5 text-amber-400" />
        <span>Click anywhere in the meadow to drop a carrot • Drag to rotate camera</span>
      </div>

      {/* Main Action Dock */}
      <div className="flex items-center gap-2 p-1.5 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-zinc-700/50 shadow-2xl pointer-events-auto">
        {/* Feed Carrot Button */}
        <button
          onClick={onFeedCarrot}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all"
        >
          <span className="text-base leading-none">🥕</span>
          <span>Feed Carrot</span>
        </button>

        {/* Pet Bunny */}
        <button
          onClick={onPetBunny}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-pink-200 dark:border-pink-900/50 transition-all"
        >
          <HandMetal className="w-4 h-4 text-pink-500" />
          <span>Pet</span>
        </button>

        {/* Hop */}
        <button
          onClick={onHop}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-emerald-200 dark:border-emerald-900/50 transition-all"
        >
          <Footprints className="w-4 h-4 text-emerald-500" />
          <span>Hop</span>
        </button>

        {/* Sleep Toggle */}
        <button
          onClick={onToggleSleep}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border transition-all ${
            isSleeping
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {isSleeping ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isSleeping ? 'Wake' : 'Nap'}</span>
        </button>
      </div>
    </div>
  );
};
