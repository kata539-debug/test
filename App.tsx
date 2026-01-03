
import React, { useState, useMemo } from 'react';
import { ViewMode, Participant } from './types';
import InputSection from './components/InputSection';
import LuckyDraw from './components/LuckyDraw';
import Grouping from './components/Grouping';
import { Users, Gift, ListPlus, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.INPUT);

  const handleNamesUpdate = (names: string[]) => {
    setParticipants(names);
  };

  const navItems = [
    { id: ViewMode.INPUT, label: '名單輸入', icon: ListPlus },
    { id: ViewMode.DRAW, label: '獎品抽籤', icon: Gift, disabled: participants.length === 0 },
    { id: ViewMode.GROUP, label: '自動分組', icon: Users, disabled: participants.length === 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">HR</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pro Toolkit</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              目前人數: {participants.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <nav className="lg:col-span-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setCurrentView(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : item.disabled
                    ? 'text-slate-300 cursor-not-allowed opacity-50'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {!item.disabled && <ChevronRight size={16} />}
              </button>
            ))}
            
            {participants.length === 0 && currentView !== ViewMode.INPUT && (
              <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                請先上傳名單或貼上姓名後才能使用抽籤與分組功能。
              </p>
            )}
          </nav>

          {/* Feature View */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[600px] border border-slate-100">
              {currentView === ViewMode.INPUT && (
                <InputSection participants={participants} onUpdate={handleNamesUpdate} onNext={() => setCurrentView(ViewMode.DRAW)} />
              )}
              {currentView === ViewMode.DRAW && (
                <LuckyDraw names={participants} />
              )}
              {currentView === ViewMode.GROUP && (
                <Grouping names={participants} />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-100">
        © 2024 HR Pro Toolkit - Built for high efficiency teams
      </footer>
    </div>
  );
};

export default App;
