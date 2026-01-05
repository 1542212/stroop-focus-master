
import React from 'react';
import { ColorKey } from '../types';
import { COLORS } from '../constants';

interface TrialCardProps {
  word: ColorKey;
  color: ColorKey;
  targetType: 'COLOR' | 'WORD';
  feedback?: 'correct' | 'incorrect' | null;
  combo: number;
}

const TrialCard: React.FC<TrialCardProps> = ({ word, color, targetType, feedback, combo }) => {
  const colorDef = COLORS[color];
  const wordDef = COLORS[word];

  // Higher combo = more distraction
  const distractionClass = combo > 10 ? 'animate-disturb' : combo > 5 ? 'animate-float' : '';

  return (
    <div className={`relative w-full max-w-md h-72 flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl transition-all duration-300 border-8 ${
      targetType === 'COLOR' ? 'border-indigo-500' : 'border-amber-400'
    } ${
      feedback === 'correct' ? 'scale-105' : 
      feedback === 'incorrect' ? 'animate-shake' : ''
    }`}>
      {/* Task Label */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 rounded-full text-white text-sm font-bold tracking-widest shadow-lg ${
        targetType === 'COLOR' ? 'bg-indigo-500' : 'bg-amber-400'
      }`}>
        {targetType === 'COLOR' ? '看颜色' : '看文字'}
      </div>

      <span 
        className={`text-8xl font-black tracking-widest select-none transition-transform ${distractionClass}`}
        style={{ color: colorDef.hex }}
      >
        {wordDef.label}
      </span>
      
      {feedback && (
        <div className="absolute top-4 right-4 animate-bounce">
          {feedback === 'correct' ? (
            <div className="bg-green-100 p-2 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="bg-red-100 p-2 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Switch hint footer */}
      <div className="absolute bottom-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
        {targetType === 'COLOR' ? 'Ignore Meaning' : 'Ignore Color'}
      </div>
    </div>
  );
};

export default TrialCard;
