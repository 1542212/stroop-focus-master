
export type ColorKey = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'PURPLE' | 'PINK' | 'CYAN';

export interface ColorDefinition {
  name: string;
  hex: string;
  label: string;
  textColor: string;
}

export type GameMode = 'CLASSIC' | 'REVERSE' | 'MASTER';

export interface GameResult {
  timestamp: number;
  score: number;
  accuracy: number;
  avgResponseTime: number;
  totalTrials: number;
  congruentRt: number;
  incongruentRt: number;
  mode: GameMode;
}

export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface TrialData {
  word: ColorKey;
  color: ColorKey;
  targetType: 'COLOR' | 'WORD'; // Which attribute to name
  isCongruent: boolean;
  startTime: number;
}
