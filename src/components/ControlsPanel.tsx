import React, { useState } from 'react';
import {
  Sun,
  Palette,
  Wind,
  Video,
  X,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Heart,
  Baby,
} from 'lucide-react';
import { BunnyBreed, BunnyData, CameraPreset, EnvironmentConfig, LightingConfig } from '../types';

interface ControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lighting: LightingConfig;
  onLightingChange: (config: LightingConfig) => void;
  environment: EnvironmentConfig;
  onEnvironmentChange: (config: Partial<EnvironmentConfig>) => void;
  breed: BunnyBreed;
  onBreedChange: (breed: BunnyBreed) => void;
  onCameraPresetChange: (preset: CameraPreset) => void;
  onResetLighting: () => void;
  bunnies: BunnyData[];
  selectedBunnyId: string;
  onSelectBunny: (id: string) => void;
  onAddBunny: (breed?: BunnyBreed, isBaby?: boolean) => void;
  onRemoveBunny: (id: string) => void;
  onToggleBaby: (isBaby: boolean) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isOpen,
  onClose,
  lighting,
  onLightingChange,
  environment,
  onEnvironmentChange,
  breed,
  onBreedChange,
  onCameraPresetChange,
  onResetLighting,
  bunnies,
  selectedBunnyId,
  onSelectBunny,
  onAddBunny,
  onRemoveBunny,
  onToggleBaby,
}) => {
  const [activeTab, setActiveTab] = useState<'fluffle' | 'lighting' | 'meadow' | 'camera'>('fluffle');

  if (!isOpen) return null;

  const breeds: { id: BunnyBreed; name: string; desc: string; color: string }[] = [
    { id: 'cotton_white', name: 'Cotton Snow', desc: 'Fluffy white with soft pink inner ears', color: '#ffffff' },
    { id: 'holland_lop', name: 'Holland Lop', desc: 'Droopy floppy ears & warm butterscotch fur', color: '#d8b58a' },
    { id: 'dutch_two_tone', name: 'Dutch Two-Tone', desc: 'Classic black mask with white blaze', color: '#333333' },
    { id: 'cinnamon', name: 'Cinnamon Copper', desc: 'Rich reddish-copper coat with amber eyes', color: '#ad582a' },
    { id: 'golden_fawn', name: 'Golden Fawn', desc: 'Bright sunny honey-blonde fur', color: '#e5a65d' },
    { id: 'midnight_black', name: 'Midnight Obsidian', desc: 'Sleek dark coat with radiant sheen', color: '#1a1a1d' },
  ];

  const cameraPresets: { id: CameraPreset; label: string; desc: string }[] = [
    { id: 'portrait', label: 'Portrait Close-Up', desc: 'Focuses on the selected bunny face and ears' },
    { id: 'cinematic', label: 'Cinematic Meadow', desc: 'Wide perspective showcasing the fluffle & landscape' },
    { id: 'macro', label: 'Grass Macro', desc: 'Ground-level view nestled in the wildflowers' },
    { id: 'birds_eye', label: "Bird's Eye", desc: 'Top-down aerial view of the full meadow' },
  ];

  const selectedBunny = bunnies.find((b) => b.id === selectedBunnyId) || bunnies[0];

  return (
    <div className="absolute top-20 right-4 z-30 w-[350px] max-h-[calc(100vh-140px)] flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-zinc-700/50 shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Meadow Studio</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Fluffle management, coat colors & lighting</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 pt-3 border-b border-zinc-200/50 dark:border-zinc-800/50 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fluffle')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === 'fluffle'
              ? 'text-zinc-900 dark:text-white border-b-2 border-pink-500 bg-pink-500/10'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Fluffle ({bunnies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lighting')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === 'lighting'
              ? 'text-zinc-900 dark:text-white border-b-2 border-amber-500 bg-amber-500/10'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Lighting</span>
        </button>

        <button
          onClick={() => setActiveTab('meadow')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === 'meadow'
              ? 'text-zinc-900 dark:text-white border-b-2 border-emerald-500 bg-emerald-500/10'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Meadow</span>
        </button>

        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === 'camera'
              ? 'text-zinc-900 dark:text-white border-b-2 border-indigo-500 bg-indigo-500/10'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Camera</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* FLUFFLE TAB */}
        {activeTab === 'fluffle' && (
          <div className="space-y-4">
            {/* Fluffle Roster */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Fluffle Roster ({bunnies.length}/10)
                </span>
                {bunnies.length < 10 && (
                  <button
                    onClick={() => onAddBunny()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-medium text-[11px] transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adopt Bunny</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {bunnies.map((b) => {
                  const isSelected = b.id === selectedBunnyId;
                  return (
                    <div
                      key={b.id}
                      onClick={() => onSelectBunny(b.id)}
                      className={`flex items-center justify-between p-2 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/40 dark:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">🐰</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span className="truncate">{b.name}</span>
                            {isSelected && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-pink-500 text-white rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {b.isBaby ? 'Baby Kit' : 'Adult'} • {b.carrotsEaten} snacks
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5 text-rose-500 font-medium text-[11px]">
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span>{b.happiness}%</span>
                        </div>
                        {bunnies.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveBunny(b.id);
                            }}
                            title="Remove bunny from meadow"
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Bunny Customizer */}
            {selectedBunny && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Coat for {selectedBunny.name}
                  </span>
                  {/* Baby Kit toggle */}
                  <button
                    onClick={() => onToggleBaby(!selectedBunny.isBaby)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                      selectedBunny.isBaby
                        ? 'bg-amber-500/10 border-amber-400 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Baby className="w-3 h-3" />
                    <span>{selectedBunny.isBaby ? 'Baby Kit (Mini)' : 'Adult Size'}</span>
                  </button>
                </div>

                {/* Coat & Breed Selection for Active Bunny */}
                <div className="grid grid-cols-1 gap-1.5">
                  {breeds.map((b) => {
                    const selected = selectedBunny.breed === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => onBreedChange(b.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/10 shadow-inner flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: b.color }}
                        >
                          {selected && <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{b.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{b.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIGHTING TAB */}
        {activeTab === 'lighting' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Physically Based Lights</span>
              <button
                onClick={onResetLighting}
                className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            {/* Sun Elevation */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Sun Elevation (Angle)</span>
                <span className="font-mono">{Math.round(lighting.sunElevation)}°</span>
              </div>
              <input
                type="range"
                min="2"
                max="88"
                step="1"
                value={lighting.sunElevation}
                onChange={(e) => onLightingChange({ ...lighting, sunElevation: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Sun Azimuth */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Sun Azimuth (Compass)</span>
                <span className="font-mono">{Math.round(lighting.sunAzimuth)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="2"
                value={lighting.sunAzimuth}
                onChange={(e) => onLightingChange({ ...lighting, sunAzimuth: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Sun Intensity */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Sun Direct Intensity</span>
                <span className="font-mono">{lighting.sunIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={lighting.sunIntensity}
                onChange={(e) => onLightingChange({ ...lighting, sunIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Ambient Intensity */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Sky Ambient Bounce</span>
                <span className="font-mono">{lighting.ambientIntensity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={lighting.ambientIntensity}
                onChange={(e) => onLightingChange({ ...lighting, ambientIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Rim Fur Light */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Fur Rim Light Highlight</span>
                <span className="font-mono">{lighting.rimLightIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={lighting.rimLightIntensity}
                onChange={(e) => onLightingChange({ ...lighting, rimLightIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Fog Density */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Atmospheric Fog</span>
                <span className="font-mono">{(lighting.fogDensity * 100).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.06"
                step="0.002"
                value={lighting.fogDensity}
                onChange={(e) => onLightingChange({ ...lighting, fogDensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Soft Shadows Toggle */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Realistic Soft Shadows</span>
                <p className="text-[10px] text-zinc-500">High-resolution PCF shadow map</p>
              </div>
              <input
                type="checkbox"
                checked={lighting.shadowsEnabled}
                onChange={(e) => onLightingChange({ ...lighting, shadowsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* MEADOW TAB */}
        {activeTab === 'meadow' && (
          <div className="space-y-4">
            {/* Wind Speed */}
            <div>
              <div className="flex justify-between mb-1 text-zinc-600 dark:text-zinc-400">
                <span>Wind Breeze Speed</span>
                <span className="font-mono">{environment.windSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={environment.windSpeed}
                onChange={(e) => onEnvironmentChange({ windSpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Elements Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Wildflowers in Grass</span>
                <input
                  type="checkbox"
                  checked={environment.showFlowers}
                  onChange={(e) => onEnvironmentChange({ showFlowers: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Fluttering Butterflies</span>
                <input
                  type="checkbox"
                  checked={environment.showButterflies}
                  onChange={(e) => onEnvironmentChange({ showButterflies: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Floating Pollen & Fireflies</span>
                <input
                  type="checkbox"
                  checked={environment.showPollen}
                  onChange={(e) => onEnvironmentChange({ showPollen: e.target.checked, showFireflies: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-zinc-700 dark:text-zinc-300">Meadow Pond Corner</span>
                <input
                  type="checkbox"
                  checked={environment.showPond}
                  onChange={(e) => onEnvironmentChange({ showPond: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* CAMERA TAB */}
        {activeTab === 'camera' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Select a curated dynamic camera angle:
            </p>
            {cameraPresets.map((cam) => (
              <button
                key={cam.id}
                onClick={() => onCameraPresetChange(cam.id)}
                className="w-full text-left p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{cam.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{cam.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
