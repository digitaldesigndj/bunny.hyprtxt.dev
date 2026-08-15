/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { SceneController } from './components/SceneController';
import { HeaderBar } from './components/HeaderBar';
import { ControlsPanel } from './components/ControlsPanel';
import { InteractionDock } from './components/InteractionDock';
import { ActiveBunnyHUD } from './components/ActiveBunnyHUD';
import { PhotoModal } from './components/PhotoModal';
import {
  BunnyBreed,
  BunnyData,
  CameraPreset,
  EnvironmentConfig,
  LightingConfig,
  TimeOfDayPreset,
} from './types';
import { soundFx } from './utils/audioSynthesizer';

export default function App() {
  const controllerRef = useRef<SceneController | null>(null);

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayPreset>('sunset');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [breed, setBreed] = useState<BunnyBreed>('cotton_white');
  const [happiness, setHappiness] = useState<number>(85);
  const [carrotsEaten, setCarrotsEaten] = useState<number>(0);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [bunnies, setBunnies] = useState<BunnyData[]>([
    {
      id: 'bunny-1',
      name: 'Bramble',
      breed: 'cotton_white',
      isBaby: false,
      happiness: 85,
      carrotsEaten: 0,
      isSleeping: false,
      isEating: false,
      isHopping: false,
    },
  ]);
  const [selectedBunnyId, setSelectedBunnyId] = useState<string>('bunny-1');

  const [lighting, setLighting] = useState<LightingConfig>({
    timeOfDay: 'sunset',
    sunElevation: 14,
    sunAzimuth: 240,
    sunIntensity: 2.4,
    sunColor: '#ff7733',
    skyColor: '#f79d65',
    groundColor: '#473c24',
    ambientIntensity: 0.85,
    shadowIntensity: 0.8,
    shadowSoftness: 1.2,
    shadowsEnabled: true,
    rimLightIntensity: 1.2,
    fogDensity: 0.016,
  });

  const [environment, setEnvironment] = useState<EnvironmentConfig>({
    windSpeed: 1.0,
    grassDensity: 1.0,
    showFlowers: true,
    showButterflies: true,
    showFireflies: true,
    showPollen: true,
    showPond: true,
  });

  const handleControllerReady = useCallback((controller: SceneController) => {
    controllerRef.current = controller;
    const initialBunnies = controller.getBunniesData();
    if (initialBunnies.length > 0) {
      setBunnies(initialBunnies);
      setSelectedBunnyId(controller.selectedBunnyId);
    }
  }, []);

  const handleBunniesUpdate = useCallback((newBunnies: BunnyData[], selId: string) => {
    setBunnies(newBunnies);
    setSelectedBunnyId(selId);
    const sel = newBunnies.find((b) => b.id === selId);
    if (sel) {
      setBreed(sel.breed);
      setIsSleeping(sel.isSleeping);
    }
  }, []);

  const handleStatsUpdate = useCallback((newHappiness: number, newCarrots: number) => {
    setHappiness(newHappiness);
    setCarrotsEaten(newCarrots);
  }, []);

  const handleTimeOfDayChange = useCallback((preset: TimeOfDayPreset) => {
    setTimeOfDay(preset);
    if (controllerRef.current) {
      const newConfig = controllerRef.current.setTimeOfDay(preset);
      setLighting(newConfig);
    }
  }, []);

  const handleLightingChange = useCallback((newLighting: LightingConfig) => {
    setLighting(newLighting);
    if (controllerRef.current) {
      controllerRef.current.updateLighting(newLighting);
    }
  }, []);

  const handleResetLighting = useCallback(() => {
    if (controllerRef.current) {
      const resetConfig = controllerRef.current.setTimeOfDay(timeOfDay);
      setLighting(resetConfig);
    }
  }, [timeOfDay]);

  const handleEnvironmentChange = useCallback((patch: Partial<EnvironmentConfig>) => {
    setEnvironment((prev) => {
      const updated = { ...prev, ...patch };
      if (controllerRef.current) {
        controllerRef.current.updateEnvironment(patch);
      }
      return updated;
    });
  }, []);

  const handleBreedChange = useCallback((newBreed: BunnyBreed) => {
    setBreed(newBreed);
    if (controllerRef.current) {
      controllerRef.current.setBreed(newBreed);
    }
  }, []);

  const handleCameraPresetChange = useCallback((preset: CameraPreset) => {
    if (controllerRef.current) {
      controllerRef.current.setCameraPreset(preset);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  }, [isMuted]);

  const handleFeedCarrot = useCallback(() => {
    if (controllerRef.current) {
      const activeBunny = controllerRef.current.selectedBunny;
      if (activeBunny) {
        const forwardAngle = activeBunny.group.rotation.y;
        const bx = activeBunny.group.position.x + Math.sin(forwardAngle) * 1.2;
        const bz = activeBunny.group.position.z + Math.cos(forwardAngle) * 1.2;
        controllerRef.current.dropCarrot(bx, bz);
      } else {
        controllerRef.current.dropCarrot(0, 0);
      }
    }
  }, []);

  const handleFeedFeast = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.feedFeast();
    }
  }, []);

  const handlePetBunny = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.petBunny();
    }
  }, []);

  const handleHop = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.triggerHop();
    }
  }, []);

  const handleWhistle = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.whistleAll();
    }
  }, []);

  const handleToggleSleep = useCallback(() => {
    if (controllerRef.current) {
      const nextSleeping = controllerRef.current.toggleSleep();
      setIsSleeping(nextSleeping);
    }
  }, []);

  const handleAddBunny = useCallback((bBreed?: BunnyBreed, isBaby?: boolean) => {
    if (controllerRef.current) {
      controllerRef.current.addBunny(bBreed, isBaby);
    }
  }, []);

  const handleRemoveBunny = useCallback((id: string) => {
    if (controllerRef.current) {
      controllerRef.current.removeBunny(id);
    }
  }, []);

  const handleSelectBunny = useCallback((id: string) => {
    if (controllerRef.current) {
      controllerRef.current.selectBunny(id);
      setSelectedBunnyId(id);
      const b = controllerRef.current.selectedBunny;
      if (b) {
        setBreed(b.breed);
        setIsSleeping(b.isSleeping);
      }
    }
  }, []);

  const handleToggleBaby = useCallback((isBaby: boolean) => {
    if (controllerRef.current) {
      controllerRef.current.setBaby(isBaby);
    }
  }, []);

  const handleTakeScreenshot = useCallback(() => {
    if (controllerRef.current) {
      const url = controllerRef.current.captureScreenshot();
      setPhotoUrl(url);
    }
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <ThreeCanvas
        onControllerReady={handleControllerReady}
        onStatsUpdate={handleStatsUpdate}
        onBunniesUpdate={handleBunniesUpdate}
      />

      {/* Top Header Bar */}
      <HeaderBar
        timeOfDay={timeOfDay}
        onTimeOfDayChange={handleTimeOfDayChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTakeScreenshot={handleTakeScreenshot}
        onToggleSettings={() => setShowSettings((v) => !v)}
        showSettings={showSettings}
        happiness={happiness}
        carrotsEaten={carrotsEaten}
        bunnyCount={bunnies.length}
        onAddBunny={() => handleAddBunny()}
      />

      {/* Active Bunny Focus HUD */}
      <ActiveBunnyHUD
        bunnies={bunnies}
        selectedBunnyId={selectedBunnyId}
        onSelectBunny={handleSelectBunny}
        onAddBunny={() => handleAddBunny()}
        onWhistle={handleWhistle}
      />

      {/* Floating Studio Controls Drawer */}
      <ControlsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        lighting={lighting}
        onLightingChange={handleLightingChange}
        environment={environment}
        onEnvironmentChange={handleEnvironmentChange}
        breed={breed}
        onBreedChange={handleBreedChange}
        onCameraPresetChange={handleCameraPresetChange}
        onResetLighting={handleResetLighting}
        bunnies={bunnies}
        selectedBunnyId={selectedBunnyId}
        onSelectBunny={handleSelectBunny}
        onAddBunny={handleAddBunny}
        onRemoveBunny={handleRemoveBunny}
        onToggleBaby={handleToggleBaby}
      />

      {/* Bottom Floating Interaction Dock */}
      <InteractionDock
        onFeedCarrot={handleFeedCarrot}
        onFeedFeast={handleFeedFeast}
        onPetBunny={handlePetBunny}
        onHop={handleHop}
        onWhistle={handleWhistle}
        onToggleSleep={handleToggleSleep}
        onAddBunny={() => handleAddBunny()}
        isSleeping={isSleeping}
        bunnyCount={bunnies.length}
      />

      {/* Screenshot Photo Modal */}
      <PhotoModal
        photoUrl={photoUrl}
        onClose={() => setPhotoUrl(null)}
      />
    </main>
  );
}
