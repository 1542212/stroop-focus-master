
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ColorKey, TrialData, GameResult, GameMode } from './types';
import { COLOR_KEYS, COLORS, GAME_DURATION } from './constants';
import TrialCard from './components/TrialCard';
import HistoryChart from './components/HistoryChart';
import { getCognitiveInsight } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [currentTrial, setCurrentTrial] = useState<TrialData | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const trialsRef = useRef<{ isCongruent: boolean; rt: number; correct: boolean }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateTrial = useCallback((mode: GameMode) => {
    const randomWord = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    const randomColor = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    
    let targetType: 'COLOR' | 'WORD' = 'COLOR';
    if (mode === 'REVERSE') targetType = 'WORD';
    if (mode === 'MASTER') targetType = Math.random() > 0.5 ? 'COLOR' : 'WORD';

    setCurrentTrial({
      word: randomWord,
      color: randomColor,
      targetType,
      isCongruent: randomWord === randomColor,
      startTime: Date.now()
    });
    setFeedback(null);
  }, []);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    trialsRef.current = [];
    setAiInsight('');
    setGameState(GameState.PLAYING);
    generateTrial(mode);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(GameState.FINISHED);
    
    const results = trialsRef.current;
    if (results.length === 0) return;

    const totalTrials = results.length;
    const correctTrials = results.filter(r => r.correct);
    const accuracy = Math.round((correctTrials.length / totalTrials) * 100);
    const avgRt = Math.round(results.reduce((acc, curr) => acc + curr.rt, 0) / totalTrials);
    
    const congruentTrials = results.filter(r => r.isCongruent);
    const incongruentTrials = results.filter(r => !r.isCongruent);
    
    const congruentRt = congruentTrials.length > 0 
      ? Math.round(congruentTrials.reduce((acc, curr) => acc + curr.rt, 0) / congruentTrials.length) 
      : 0;
    const incongruentRt = incongruentTrials.length > 0 
      ? Math.round(incongruentTrials.reduce((acc, curr) => acc + curr.rt, 0) / incongruentTrials.length) 
      : 0;

    const finalResult: GameResult = {
      timestamp: Date.now(),
      score: score,
      accuracy,
      avgResponseTime: avgRt,
      totalTrials,
      congruentRt,
      incongruentRt,
      mode: gameMode
    };

    setHistory(prev => [...prev, finalResult]);
    
    setIsLoadingInsight(true);
    const insight = await getCognitiveInsight(finalResult);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  }, [score, gameMode]);

  const handleChoice = (choice: ColorKey) => {
    if (!currentTrial || feedback) return;

    const rt = Date.now() - currentTrial.startTime;
    const targetValue = currentTrial.targetType === 'COLOR' ? currentTrial.color : currentTrial.word;
    const isCorrect = choice === targetValue;

    trialsRef.current.push({
      isCongruent: currentTrial.isCongruent,
      rt,
      correct: isCorrect
    });

    if (isCorrect) {
      const bonus = Math.floor(combo / 5) * 5;
      setScore(prev => prev + 10 + bonus);
      setCombo(prev => prev + 1);
      setFeedback('correct');
    } else {
      setScore(prev => Math.max(0, prev - 10));
      setCombo(0);
      setFeedback('incorrect');
    }

    setTimeout(() => {
      generateTrial(gameMode);
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7 };
      if (keyMap[e.key] !== undefined) handleChoice(COLOR_KEYS[keyMap[e.key]]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentTrial, feedback]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 md:py-12 flex flex-col items-center overflow-x-hidden">
      <header className="max-w-4xl w-full flex flex-col items-center mb-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-indigo-200">
          <span>🧠 Neuro-Flexibility Training</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Stroop Focus Master</h1>
        <p className="text-slate-500 max-w-lg">
          {gameState === GameState.PLAYING 
            ? (currentTrial?.targetType === 'COLOR' ? "忽略文字，点击对应的颜色！" : "忽略颜色，点击文字含义！")
            : "通过“任务切换”挑战你的执行控制力。"}
        </p>
      </header>

      <main className="max-w-4xl w-full flex-grow flex flex-col items-center">
        {gameState === GameState.START && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              { id: 'CLASSIC', name: '经典模式', desc: '识别字体颜色', icon: '🎨', color: 'bg-blue-500' },
              { id: 'REVERSE', name: '逆向模式', desc: '识别文字含义', icon: '📖', color: 'bg-emerald-500' },
              { id: 'MASTER', name: '大师模式', desc: '随机切换规则', icon: '⚡', color: 'bg-indigo-600' },
            ].map((m) => (
              <button 
                key={m.id}
                onClick={() => startGame(m.id as GameMode)}
                className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-100"
              >
                <div className={`w-16 h-16 ${m.color} text-white rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {m.icon}
                </div>
                <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{m.desc}</p>
                <div className="mt-auto w-full py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  开始挑战
                </div>
              </button>
            ))}
          </div>
        )}

        {gameState === GameState.PLAYING && currentTrial && (
          <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="w-full flex justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase">时间</span>
                <span className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Combo</span>
                <span className="text-2xl font-black text-indigo-600">x{combo}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">分数</span>
                <span className="text-2xl font-black text-slate-800">{score}</span>
              </div>
            </div>

            <TrialCard 
              word={currentTrial.word} 
              color={currentTrial.color} 
              targetType={currentTrial.targetType}
              feedback={feedback}
              combo={combo}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
              {COLOR_KEYS.map((key, idx) => (
                <button
                  key={key}
                  onClick={() => handleChoice(key)}
                  className="group relative h-16 sm:h-20 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: COLORS[key].hex }} />
                  <div className="flex flex-col items-center z-10">
                    <span className="font-bold text-slate-700">{COLORS[key].label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">[{idx + 1}]</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === GameState.FINISHED && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mb-4">🏆</div>
              <h2 className="text-3xl font-black mb-6">训练报告 - {gameMode === 'MASTER' ? '大师模式' : gameMode === 'REVERSE' ? '逆向模式' : '经典模式'}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-8 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">总分</p>
                  <p className="text-3xl font-black text-indigo-600">{score}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">正确率</p>
                  <p className="text-3xl font-black text-emerald-500">{history[history.length - 1]?.accuracy}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">平均耗时</p>
                  <p className="text-2xl font-black text-slate-700">{history[history.length - 1]?.avgResponseTime}ms</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">干扰指数</p>
                  <p className="text-2xl font-black text-rose-500">{Math.max(0, (history[history.length - 1]?.incongruentRt || 0) - (history[history.length - 1]?.congruentRt || 0))}ms</p>
                </div>
              </div>

              <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                <h4 className="text-indigo-600 font-bold text-sm uppercase mb-2 flex items-center">✨ AI 神经反馈</h4>
                {isLoadingInsight ? (
                  <div className="flex space-x-2"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" /></div>
                ) : (
                  <p className="text-slate-700 font-medium italic leading-relaxed">{aiInsight}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full">
                <button onClick={() => startGame(gameMode)} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all">再次挑战</button>
                <button onClick={() => setGameState(GameState.START)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all">更换模式</button>
              </div>
            </div>
            <HistoryChart data={history} />
          </div>
        )}
      </main>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(1deg); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        @keyframes disturb { 0%, 100% { transform: translate(0,0) scale(1); } 25% { transform: translate(5px,-5px) scale(0.98); } 75% { transform: translate(-5px,5px) scale(1.02); } }
        .animate-disturb { animation: disturb 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
