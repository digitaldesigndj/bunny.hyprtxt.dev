export type TimeOfDayPreset = 'dawn' | 'noon' | 'sunset' | 'twilight' | 'night';

export type BunnyBreed = 'cotton_white' | 'holland_lop' | 'dutch_two_tone' | 'cinnamon' | 'midnight_black' | 'golden_fawn';

export type CameraPreset = 'portrait' | 'cinematic' | 'macro' | 'birds_eye';

export interface LightingConfig {
  timeOfDay: TimeOfDayPreset;
  sunElevation: number; // 0 to 90 degrees
  sunAzimuth: number; // 0 to 360 degrees
  sunIntensity: number; // 0 to 5
  sunColor: string;
  skyColor: string;
  groundColor: string;
  ambientIntensity: number;
  shadowIntensity: number; // 0 to 1
  shadowSoftness: number; // shadow bias / radius
  shadowsEnabled: boolean;
  rimLightIntensity: number;
  fogDensity: number;
}

export interface EnvironmentConfig {
  windSpeed: number;
  grassDensity: number;
  showFlowers: boolean;
  showButterflies: boolean;
  showFireflies: boolean;
  showPollen: boolean;
  showPond: boolean;
}

export interface BunnyState {
  breed: BunnyBreed;
  isHopping: boolean;
  isSleeping: boolean;
  isEating: boolean;
  lookAtCursor: boolean;
  earWiggle: boolean;
  scale: number;
  position: { x: number; y: number; z: number };
  happiness: number;
  carrotsEaten: number;
}

export interface SceneAction {
  type: 'feed_carrot' | 'pet' | 'hop_to' | 'whistle' | 'toggle_sleep';
  targetPos?: { x: number; y: number; z: number };
}
