
import React, { useState, ChangeEvent, useMemo } from 'react';
import { Upload, ClipboardList, Trash2, ArrowRight, UserPlus, UserCheck, AlertCircle } from 'lucide-react';

interface InputSectionProps {
  participants: string[];
  onUpdate: (names: string[]) => void;
  onNext: () => void;
}

const SAMPLE_NAMES = [
  '王小明', '李大華', '張美美', '陳小建', '林志明', 
  '趙雅婷', '孫悟空', '豬八戒', '沙悟淨', '唐三藏', 
  '劉備', '關羽', '張飛', '諸葛亮', '周瑜',
  '黃蓉', '郭靖', '小龍女', '楊過', '張無忌'
];

const InputSection: React.FC<InputSectionProps> = ({ participants, onUpdate, onNext }) => {
  const [textInput, setTextInput] = useState<string>(participants.join('\n'));

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextInput(value);
    const names = value.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    onUpdate(names);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const names = content.split(/[\n,\r]+/).map(n => n.trim()).filter(n => n.length > 0);
      onUpdate(names);
      setTextInput(names.join('\n'));
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    onUpdate(SAMPLE_NAMES);
    setTextInput(SAMPLE_NAMES.join('\n'));
  };

  const clearAll = () => {
    setTextInput('');
    onUpdate([]);
  };

  const removeDuplicates = () => {
    const uniqueNames = Array.from(new Set(participants));
    onUpdate(uniqueNames);
    setTextInput(uniqueNames.join('\n'));
  };

  // Identify duplicates for UI feedback
  const duplicateStats = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
    const dupes = participants.filter(name => counts[name] > 1);
    return {
      dupeCount: participants.length - Object.keys(counts).length,
      dupeNames: new Set(dupes)
    };
  }, [participants]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">名單來源</h2>
          <p className="text-slate-500 mt-1">您可以手動貼上姓名或上傳 CSV 檔案。</p>
        </div>
        <button 
          onClick={loadSample}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl transition-all"
        >
          <UserPlus size={16} />
          <span>載入模擬名單</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
            <ClipboardList size={18} className="text-indigo-600" />
            <span>貼上姓名名單 (每行一個或以逗號分隔)</span>
          </label>
          <textarea
            value={textInput}
            onChange={handleTextChange}
            placeholder="例如：&#10;王小明&#10;李大華&#10;陳美女..."
            className="w-full h-80 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none font-medium text-slate-700"
          />
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
              <Upload size={18} className="text-indigo-600" />
              <span>上傳 CSV 檔案</span>
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 group-hover:bg-indigo-50 group-hover:border-indigo-400 transition-all"
              >
                <Upload className="text-slate-400 group-hover:text-indigo-500 mb-2" size={32} />
                <span className="text-sm text-slate-600 group-hover:text-indigo-700 font-medium">點擊選擇檔案或拖曳至此</span>
                <span className="text-xs text-slate-400 mt-1">支援 .csv 或 .txt</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">名單統計</h3>
              <div className="flex items-center space-x-2">
                {duplicateStats.dupeCount > 0 && (
                  <button 
                    onClick={removeDuplicates}
                    className="flex items-center space-x-1 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors border border-red-100"
                  >
                    <UserCheck size={14} />
                    <span>移除 {duplicateStats.dupeCount} 個重複項</span>
                  </button>
                )}
                <button onClick={clearAll} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="清除全部">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-indigo-600">{participants.length}</span>
                <span className="text-slate-500 font-medium text-sm">位參與者</span>
              </div>
              {duplicateStats.dupeCount > 0 && (
                <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                  <AlertCircle size={14} />
                  <span className="text-xs font-bold">發現重複項目</span>
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {participants.slice(0, 50).map((name, idx) => {
                const isDupe = duplicateStats.dupeNames.has(name);
                return (
                  <span 
                    key={idx} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isDupe 
                      ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                      : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {name}
                  </span>
                );
              })}
              {participants.length > 50 && (
                <span className="px-3 py-1.5 text-xs text-slate-400 bg-slate-100 rounded-xl">
                  及其他 {participants.length - 50} 位...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={participants.length === 0}
          className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all shadow-lg ${
            participants.length > 0 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>進入下一步</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default InputSection;
