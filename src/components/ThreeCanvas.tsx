import React, { useEffect, useRef } from 'react';
import { SceneController } from './SceneController';
import { BunnyBreed, BunnyData, CameraPreset, EnvironmentConfig, LightingConfig, TimeOfDayPreset } from '../types';

interface ThreeCanvasProps {
  onControllerReady: (controller: SceneController) => void;
  onStatsUpdate: (happiness: number, carrots: number) => void;
  onBunniesUpdate?: (bunnies: BunnyData[], selectedId: string) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onControllerReady,
  onStatsUpdate,
  onBunniesUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new SceneController(containerRef.current);
    controller.onStatsUpdate = onStatsUpdate;
    if (onBunniesUpdate) {
      controller.onBunniesUpdate = onBunniesUpdate;
    }
    controllerRef.current = controller;
    onControllerReady(controller);

    const handleResize = () => {
      controller.handleResize();
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => {
      controller.handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      controller.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      id="three-canvas-container"
    />
  );
};
