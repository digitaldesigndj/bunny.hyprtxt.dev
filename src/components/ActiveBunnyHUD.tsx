import React from 'react';
import { Heart, Sparkles, Footprints, Baby, User } from 'lucide-react';
import { BunnyBreed, BunnyData } from '../types';

interface ActiveBunnyHUDProps {
  bunnies: BunnyData[];
  selectedBunnyId: string;
  onSelectBunny: (id: string) => void;
  onAddBunny: () => void;
  onWhistle: () => void;
}

const BREED_LABELS: Record<BunnyBreed, string> = {
  cotton_white: 'Cotton Snow',
  holland_lop: 'Holland Lop',
  dutch_two_tone: 'Dutch Two-Tone',
  cinnamon: 'Cinnamon Copper',
  golden_fawn: 'Golden Fawn',
  midnight_black: 'Midnight Obsidian',
};

export const ActiveBunnyHUD: React.FC<ActiveBunnyHUDProps> = ({
  bunnies,
  selectedBunnyId,
  onSelectBunny,
  onAddBunny,
  onWhistle,
}) => {
  const selectedBunny = bunnies.find((b) => b.id === selectedBunnyId) || bunnies[0];

  if (!selectedBunny) return null;

  return (
    <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 max-w-[280px] pointer-events-none">
      {/* Active Bunny Focus Card */}
      <div className="p-3 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-white/40 dark:border-zinc-700/50 shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🐰</span>
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              {selectedBunny.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
              {selectedBunny.isBaby ? 'Baby Kit' : 'Adult'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-500">
            <Heart className="w-3 h-3 fill-rose-500" />
            <span>{selectedBunny.happiness}%</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {BREED_LABELS[selectedBunny.breed] || selectedBunny.breed}
          {selectedBunny.isSleeping && ' • 💤 Sleeping'}
          {selectedBunny.isEating && ' • 🥕 Nibbling'}
          {selectedBunny.isHopping && ' • 🐾 Hopping'}
        </p>

        {/* Fluffle Avatars Quick-Switch Bar */}
        <div className="mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1.5 overflow-x-auto">
          {bunnies.map((b) => {
            const isCurrent = b.id === selectedBunnyId;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBunny(b.id)}
                title={`${b.name} (${b.isBaby ? 'Kit' : 'Adult'}) - Click to focus`}
                className={`relative px-2 py-1 rounded-xl text-[11px] font-medium transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-sm font-semibold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {b.name}
              </button>
            );
          })}

          {bunnies.length < 10 && (
            <button
              onClick={onAddBunny}
              title="Adopt another bunny into the meadow"
              className="px-2 py-1 rounded-xl text-[11px] font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 border border-pink-200 dark:border-pink-900/40 shrink-0 transition-all"
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
