
import { ColorKey, ColorDefinition } from './types';

export const COLORS: Record<ColorKey, ColorDefinition> = {
  RED: { name: 'RED', hex: '#ef4444', label: '红色', textColor: 'text-red-500' },
  BLUE: { name: 'BLUE', hex: '#3b82f6', label: '蓝色', textColor: 'text-blue-500' },
  GREEN: { name: 'GREEN', hex: '#22c55e', label: '绿色', textColor: 'text-green-500' },
  YELLOW: { name: 'YELLOW', hex: '#eab308', label: '黄色', textColor: 'text-yellow-500' },
  ORANGE: { name: 'ORANGE', hex: '#f97316', label: '橙色', textColor: 'text-orange-500' },
  PURPLE: { name: 'PURPLE', hex: '#a855f7', label: '紫色', textColor: 'text-purple-500' },
  PINK: { name: 'PINK', hex: '#ec4899', label: '粉色', textColor: 'text-pink-500' },
  CYAN: { name: 'CYAN', hex: '#06b6d4', label: '青色', textColor: 'text-cyan-500' },
};

export const COLOR_KEYS = Object.keys(COLORS) as ColorKey[];

export const GAME_DURATION = 30; // seconds
