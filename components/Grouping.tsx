
import React, { useState, useEffect } from 'react';
import { Users, Shuffle, LayoutGrid, Download, Sparkles } from 'lucide-react';
import { Group } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface GroupingProps {
  names: string[];
}

const Grouping: React.FC<GroupingProps> = ({ names }) => {
  const [groupCount, setGroupCount] = useState<number>(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const performGrouping = async () => {
    setIsGenerating(true);
    
    // Shuffle logic
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < groupCount; i++) {
      newGroups.push({
        id: i + 1,
        name: `第 ${i + 1} 組`,
        members: []
      });
    }

    shuffled.forEach((name, index) => {
      newGroups[index % groupCount].members.push(name);
    });

    // Optional AI Step for Group Names
    if (useAI) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `為這 ${groupCount} 個小組提供創意名稱。這是一個辦公室活動。輸出 JSON 陣列。`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });
        
        const aiNames = JSON.parse(response.text);
        if (Array.isArray(aiNames)) {
          newGroups.forEach((g, idx) => {
            if (aiNames[idx]) g.name = aiNames[idx];
          });
        }
      } catch (err) {
        console.error("AI naming failed, using defaults", err);
      }
    }

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const downloadResult = () => {
    // Generate CSV content
    const csvRows = ['小組名稱,成員姓名'];
    groups.forEach(group => {
      group.members.forEach(member => {
        // Handle names that might have commas by wrapping in quotes
        const escapedName = member.includes(',') ? `"${member}"` : member;
        const escapedGroupName = group.name.includes(',') ? `"${group.name}"` : group.name;
        csvRows.push(`${escapedGroupName},${escapedName}`);
      });
    });
    
    // Add BOM for UTF-8 Excel support
    const csvString = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `分組結果_${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">自動分組</h2>
        <p className="text-slate-500 mt-1">
          將 {names.length} 位參與者平均分配到指定數量的組別中。
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1 space-y-4">
            <label className="block text-sm font-bold text-slate-700">要分為幾組？</label>
            <div className="flex items-center space-x-4">
                <input 
                    type="range" 
                    min="2" 
                    max={Math.min(names.length, 20)} 
                    value={groupCount}
                    onChange={(e) => setGroupCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm">
                    {groupCount}
                </span>
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <button 
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    useAI ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-400 border border-slate-200'
                }`}
                title="讓 AI 為你的小組想個好聽的名字"
            >
                <Sparkles size={16} className={useAI ? 'animate-pulse' : ''} />
                <span>AI 創意命名</span>
            </button>
            <button 
                onClick={performGrouping}
                disabled={isGenerating}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center space-x-2"
            >
                {isGenerating ? <Shuffle className="animate-spin" size={20} /> : <LayoutGrid size={20} />}
                <span>{isGenerating ? '正在分組...' : '開始分組'}</span>
            </button>
        </div>
      </div>

      {/* Results Section */}
      {groups.length > 0 && (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                    <Users size={20} className="text-indigo-600" />
                    <span>分組結果</span>
                </h3>
                <button onClick={downloadResult} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center space-x-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                    <Download size={16} />
                    <span>匯出 CSV 紀錄</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors truncate">{group.name}</span>
                            <span className="text-[10px] font-bold bg-white text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                                {group.members.length} 人
                            </span>
                        </div>
                        <div className="p-4 flex flex-wrap gap-2">
                            {group.members.map((member, mIdx) => (
                                <span key={mIdx} className="px-3 py-1.5 bg-indigo-50/50 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-100">
                                    {member}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Grouping;
