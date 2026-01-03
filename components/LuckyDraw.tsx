
import React, { useState, useEffect, useRef } from 'react';
// Import missing Gift icon from lucide-react
import { Trophy, RefreshCcw, ToggleLeft, ToggleRight, History, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyDrawProps {
  names: string[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ names }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [availableNames, setAvailableNames] = useState<string[]>(names);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  
  const drawIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setAvailableNames(names);
    setWinner(null);
    setHistory([]);
  }, [names]);

  const startDraw = () => {
    if (availableNames.length === 0) {
      alert("沒有剩餘名單可抽取！");
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    // Initial shuffle for display
    let counter = 0;
    const maxTicks = 30;
    
    drawIntervalRef.current = window.setInterval(() => {
      const randomNames = Array.from({ length: 5 }, () => availableNames[Math.floor(Math.random() * availableNames.length)]);
      setDisplayNames(randomNames);
      counter++;

      if (counter >= maxTicks) {
        finishDraw();
      }
    }, 100);
  };

  const finishDraw = () => {
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    
    const luckyIndex = Math.floor(Math.random() * availableNames.length);
    const luckyOne = availableNames[luckyIndex];

    setWinner(luckyOne);
    setHistory(prev => [luckyOne, ...prev]);
    setIsDrawing(false);
    
    // Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#818cf8', '#ffffff']
    });

    if (!allowRepeat) {
      setAvailableNames(prev => prev.filter((_, i) => i !== luckyIndex));
    }
  };

  const reset = () => {
    setAvailableNames(names);
    setWinner(null);
    setHistory([]);
    setDisplayNames([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">獎品抽籤</h2>
          <p className="text-slate-500 mt-1">
            {allowRepeat ? '重覆模式：同一個名字可被多次抽中' : `不重覆模式：剩餘 ${availableNames.length} 人`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setAllowRepeat(!allowRepeat)}
            disabled={isDrawing}
            className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            {allowRepeat ? <ToggleRight className="text-indigo-600" /> : <ToggleLeft className="text-slate-400" />}
            <span>允許重複中獎</span>
          </button>
          <button onClick={reset} disabled={isDrawing} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Draw Machine UI */}
        <div className="relative w-full max-w-md h-40 bg-indigo-950 rounded-3xl shadow-2xl overflow-hidden border-8 border-indigo-900 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none z-10"></div>
            
            {!isDrawing && !winner && (
                <div className="text-indigo-300 font-bold text-xl animate-pulse">準備好開獎了嗎？</div>
            )}

            {isDrawing && (
                <div className="flex flex-col space-y-2 w-full items-center">
                    {displayNames.map((n, i) => (
                        <div key={i} className={`text-white font-black text-2xl opacity-${100 - i * 20}`}>{n}</div>
                    ))}
                </div>
            )}

            {winner && !isDrawing && (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-300">
                    <Trophy className="text-yellow-400 mb-2" size={32} />
                    <div className="text-white font-black text-4xl tracking-wider drop-shadow-lg">{winner}</div>
                </div>
            )}
        </div>

        <button
          onClick={startDraw}
          disabled={isDrawing || availableNames.length === 0}
          className={`w-64 h-16 rounded-full font-black text-xl shadow-xl transition-all flex items-center justify-center space-x-3 ${
            isDrawing || availableNames.length === 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
          }`}
        >
          {isDrawing ? <RefreshCcw className="animate-spin" /> : <Gift size={24} />}
          <span>{isDrawing ? '正在開獎...' : '立即抽籤'}</span>
        </button>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center space-x-2 mb-4">
                <History size={18} className="text-slate-400" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">中獎歷史</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {history.map((name, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 group">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {history.length - idx}
                        </span>
                        <span className="font-semibold text-slate-700 truncate">{name}</span>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDraw;
