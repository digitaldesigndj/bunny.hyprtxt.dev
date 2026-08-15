import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Volume2,
  VolumeX,
  Camera,
  Sliders,
  Sparkles,
  Heart,
} from 'lucide-react';
import { TimeOfDayPreset } from '../types';

interface HeaderBarProps {
  timeOfDay: TimeOfDayPreset;
  onTimeOfDayChange: (t: TimeOfDayPreset) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTakeScreenshot: () => void;
  onToggleSettings: () => void;
  showSettings: boolean;
  happiness: number;
  carrotsEaten: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  timeOfDay,
  onTimeOfDayChange,
  isMuted,
  onToggleMute,
  onTakeScreenshot,
  onToggleSettings,
  showSettings,
  happiness,
  carrotsEaten,
}) => {
  const timePresets: { id: TimeOfDayPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'dawn', label: 'Dawn', icon: <Sun className="w-4 h-4 text-amber-300" /> },
    { id: 'noon', label: 'Noon', icon: <Sun className="w-4 h-4 text-yellow-400" /> },
    { id: 'sunset', label: 'Sunset', icon: <Sunset className="w-4 h-4 text-orange-400" /> },
    { id: 'twilight', label: 'Twilight', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'night', label: 'Night', icon: <Moon className="w-4 h-4 text-blue-300" /> },
  ];

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Brand & Stats */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 dark:border-zinc-700/50">
          <span className="text-xl" role="img" aria-label="bunny">🐇</span>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              Meadow Bunny 3D
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Interactive Three.js Experience
            </p>
          </div>
        </div>

        {/* Live Bunny Stats */}
        <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/40 dark:border-zinc-700/50 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{happiness}%</span>
          </div>
          <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="text-sm leading-none">🥕</span>
            <span>{carrotsEaten} snacks</span>
          </div>
        </div>
      </div>

      {/* Center: Time of Day Selector */}
      <div className="pointer-events-auto flex items-center p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/40 dark:border-zinc-700/50 shadow-lg">
        {timePresets.map((p) => {
          const active = timeOfDay === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onTimeOfDayChange(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {p.icon}
              <span className="hidden md:inline">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Sound, Photo & Studio Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute nature sounds' : 'Mute nature sounds'}
          className={`p-2.5 rounded-2xl backdrop-blur-md border shadow-md transition-all ${
            !isMuted
              ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20'
              : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-white/40 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onTakeScreenshot}
          title="Capture high-res photo"
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 shadow-md hover:bg-white dark:hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSettings}
          title="Lighting & Environment Studio"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-md font-medium text-xs transition-all ${
            showSettings
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent'
              : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-white/40 dark:border-zinc-700/50 hover:bg-white dark:hover:bg-zinc-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Studio Controls</span>
        </button>
      </div>
    </header>
  );
};
