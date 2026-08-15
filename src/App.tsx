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
import { PhotoModal } from './components/PhotoModal';
import {
  BunnyBreed,
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
      const forwardAngle = controllerRef.current.bunny.group.rotation.y;
      const bx = controllerRef.current.bunny.group.position.x + Math.sin(forwardAngle) * 1.2;
      const bz = controllerRef.current.bunny.group.position.z + Math.cos(forwardAngle) * 1.2;
      controllerRef.current.dropCarrot(bx, bz);
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

  const handleToggleSleep = useCallback(() => {
    if (controllerRef.current) {
      const nextSleeping = controllerRef.current.toggleSleep();
      setIsSleeping(nextSleeping);
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
      />

      {/* Bottom Floating Interaction Dock */}
      <InteractionDock
        onFeedCarrot={handleFeedCarrot}
        onPetBunny={handlePetBunny}
        onHop={handleHop}
        onToggleSleep={handleToggleSleep}
        isSleeping={isSleeping}
      />

      {/* Screenshot Photo Modal */}
      <PhotoModal
        photoUrl={photoUrl}
        onClose={() => setPhotoUrl(null)}
      />
    </main>
  );
}
