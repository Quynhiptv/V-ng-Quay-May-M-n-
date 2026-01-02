
import React, { useState } from 'react';
import { Participant } from '../types';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { COLORS } from '../constants';
import { generateId, getRandomColor } from '../utils/wheel';

interface InputSectionProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  isSpinning: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ participants, setParticipants, isSpinning }) => {
  const [newName, setNewName] = useState('');

  const addParticipant = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    
    const newP: Participant = {
      id: generateId(),
      name: newName.trim(),
      color: getRandomColor(participants.length, COLORS),
    };
    
    setParticipants([...participants, newP]);
    setNewName('');
  };

  const removeParticipant = (id: string) => {
    if (isSpinning) return;
    setParticipants(participants.filter(p => p.id !== id));
  };

  const clearAll = () => {
    if (isSpinning) return;
    setParticipants([]);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl w-full max-w-md mx-auto h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
        Danh sách tham gia ({participants.length})
        <button 
          onClick={clearAll}
          className="text-xs font-normal text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          disabled={isSpinning}
        >
          <RotateCcw size={14} /> Xóa hết
        </button>
      </h2>

      <form onSubmit={addParticipant} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nhập tên..."
          disabled={isSpinning}
          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 text-gray-800"
        />
        <button
          type="submit"
          disabled={isSpinning || !newName.trim()}
          className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
        {participants.length === 0 ? (
          <p className="text-center text-gray-400 py-4 italic">Chưa có ai tham gia...</p>
        ) : (
          participants.map((p, index) => (
            <div 
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl border group animate-in slide-in-from-left duration-200 bg-gray-50 border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: p.color }} 
                />
                <span className="font-medium text-gray-700">
                  {p.name}
                </span>
              </div>
              <button
                onClick={() => removeParticipant(p.id)}
                disabled={isSpinning}
                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:hidden"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
        Hệ thống quay ngẫu nhiên công bằng.
        <br />Cần tối thiểu 2 người để có thể bắt đầu.
      </div>
    </div>
  );
};

export default InputSection;
