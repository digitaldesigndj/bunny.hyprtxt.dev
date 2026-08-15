import React from 'react';
import {
  Footprints,
  Moon,
  Sun,
  HandMetal,
  Info,
  Radio,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface InteractionDockProps {
  onFeedCarrot: () => void;
  onFeedFeast: () => void;
  onPetBunny: () => void;
  onHop: () => void;
  onWhistle: () => void;
  onToggleSleep: () => void;
  onAddBunny: () => void;
  isSleeping: boolean;
  bunnyCount: number;
}

export const InteractionDock: React.FC<InteractionDockProps> = ({
  onFeedCarrot,
  onFeedFeast,
  onPetBunny,
  onHop,
  onWhistle,
  onToggleSleep,
  onAddBunny,
  isSleeping,
  bunnyCount,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[95vw] pointer-events-none">
      {/* Interactive Helper Banner */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-black/60 dark:bg-black/70 backdrop-blur-md text-white rounded-full text-[11px] font-medium shadow-md border border-white/10 pointer-events-auto">
        <Info className="w-3.5 h-3.5 text-amber-400" />
        <span>Click any bunny to pet & select • Click meadow to drop a carrot • Drag to rotate camera</span>
      </div>

      {/* Main Action Dock */}
      <div className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 p-1.5 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-zinc-700/50 shadow-2xl pointer-events-auto">
        {/* Feed Carrot Button */}
        <button
          onClick={onFeedCarrot}
          title="Drop a carrot near the selected bunny"
          className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all"
        >
          <span className="text-base leading-none">🥕</span>
          <span>Feed</span>
        </button>

        {/* Feast for All */}
        <button
          onClick={onFeedFeast}
          title="Scatter fresh carrots for every bunny in the meadow"
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-orange-200 dark:border-orange-900/50 transition-all"
        >
          <span className="text-sm">🥕🥕</span>
          <span className="hidden xs:inline">Feast All</span>
        </button>

        {/* Pet Bunny */}
        <button
          onClick={onPetBunny}
          title="Pet the focused bunny"
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-pink-200 dark:border-pink-900/50 transition-all"
        >
          <HandMetal className="w-4 h-4 text-pink-500" />
          <span>Pet</span>
        </button>

        {/* Whistle / Gather Call */}
        <button
          onClick={onWhistle}
          title="Whistle to call all bunnies together"
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-900/50 transition-all"
        >
          <Radio className="w-4 h-4 text-blue-500" />
          <span>Whistle</span>
        </button>

        {/* Hop */}
        <button
          onClick={onHop}
          title="Make bunnies hop happily"
          className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-emerald-200 dark:border-emerald-900/50 transition-all"
        >
          <Footprints className="w-4 h-4 text-emerald-500" />
          <span>Hop</span>
        </button>

        {/* Sleep Toggle */}
        <button
          onClick={onToggleSleep}
          title="Toggle sleep / nap for the bunnies"
          className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border transition-all ${
            isSleeping
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {isSleeping ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isSleeping ? 'Wake' : 'Nap'}</span>
        </button>

        {/* Add Bunny Button */}
        {bunnyCount < 10 && (
          <button
            onClick={onAddBunny}
            title="Adopt another bunny into the meadow"
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 active:scale-95 font-medium text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-900/50 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-purple-500" />
            <span className="hidden sm:inline">+ Bunny</span>
          </button>
        )}
      </div>
    </div>
  );
};
