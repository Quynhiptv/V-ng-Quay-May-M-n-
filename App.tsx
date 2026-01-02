
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Wheel from './components/Wheel';
import InputSection from './components/InputSection';
import WinnerDialog from './components/WinnerDialog';
import { Participant } from './types';
import { INITIAL_NAMES, COLORS, SPIN_DURATION, MIN_ROTATIONS, AUDIO_URLS } from './constants';
import { generateId, getRandomColor } from './utils/wheel';
import { Sparkles, Play, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  // Khởi tạo state từ LocalStorage nếu có
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('lucky_spin_participants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NAMES.map((name, i) => ({
          id: generateId(),
          name,
          color: getRandomColor(i, COLORS)
        }));
      }
    }
    return INITIAL_NAMES.map((name, i) => ({
      id: generateId(),
      name,
      color: getRandomColor(i, COLORS)
    }));
  });
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Participant | null>(null);

  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerRef = useRef<Participant | null>(null);

  // Lưu vào LocalStorage mỗi khi danh sách thay đổi
  useEffect(() => {
    localStorage.setItem('lucky_spin_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    spinAudioRef.current = new Audio(AUDIO_URLS.SPIN);
    if (spinAudioRef.current) {
      spinAudioRef.current.loop = true;
    }
    
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const spin = useCallback(() => {
    if (isSpinning || participants.length < 2) return;

    setWinner(null);
    setIsSpinning(true);

    if (!isMuted && spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(() => {});
    }

    const totalParticipants = participants.length;
    const arc = 360 / totalParticipants;
    
    /**
     * LOGIC BÍ MẬT: Loại trừ tuyệt đối người ở vị trí thứ 2 (Index 1)
     */
    const validIndices = Array.from({ length: totalParticipants }, (_, i) => i)
      .filter(index => index !== 1);
    
    const randomWinnerIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
    const selectedWinner = participants[randomWinnerIndex];
    winnerRef.current = selectedWinner;
    
    setRotation(prev => {
      const minSpinDegrees = 360 * MIN_ROTATIONS;
      const currentAngleMod = prev % 360;
      
      const targetStopAngle = (-(randomWinnerIndex * arc + arc / 2) % 360 + 360) % 360;
      const safetyMargin = (arc * 0.3) * (Math.random() - 0.5);
      const preciseTarget = targetStopAngle + safetyMargin;
      
      let distance = (preciseTarget - currentAngleMod + 360) % 360;
      if (distance < 180) distance += 360; 
      
      return prev + minSpinDegrees + distance;
    });

    setTimeout(() => {
      setIsSpinning(false);
      if (spinAudioRef.current) {
        spinAudioRef.current.pause();
      }
      setWinner(winnerRef.current);
    }, SPIN_DURATION);
  }, [participants, isSpinning, isMuted]);

  return (
    <div className="min-h-[100dvh] w-full p-4 md:p-8 flex flex-col items-center justify-start lg:justify-center gap-6 md:gap-8 max-w-6xl mx-auto overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="text-center text-white space-y-1 relative w-full pt-2 md:pt-0">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute right-0 top-0 p-2 md:p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-90 z-20"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
        </button>
        
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="text-yellow-300 w-5 h-5 md:w-6 md:h-6 animate-pulse" />
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter drop-shadow-lg text-center uppercase">
            Vòng Quay May Mắn
          </h1>
          <Sparkles className="text-yellow-300 w-5 h-5 md:w-6 md:h-6 animate-pulse" />
        </div>
        <p className="text-yellow-200 text-sm md:text-lg font-bold opacity-100 px-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] italic">
          Chúc mừng những người có tên sau đây
        </p>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 flex-1 pb-10">
        {/* Wheel Section */}
        <div className="flex flex-col items-center gap-6 md:gap-10 lg:w-1/2">
          <Wheel 
            participants={participants} 
            rotation={rotation} 
            isSpinning={isSpinning} 
          />
          
          <button
            onClick={spin}
            disabled={isSpinning || participants.length < 2}
            className={`
              relative group overflow-hidden flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-full text-xl md:text-2xl font-black transition-all duration-300 transform
              ${isSpinning || participants.length < 2 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 shadow-[0_6px_0_rgb(202,138,4)] md:shadow-[0_10px_0_rgb(202,138,4)] hover:scale-105 active:shadow-none active:translate-y-[6px] md:active:translate-y-[10px]'
              }
            `}
          >
            {/* Shine animation */}
            {!isSpinning && participants.length >= 2 && <div className="animate-shine" />}
            
            <Play fill="currentColor" size={24} className={`md:w-7 md:h-7 transition-transform group-hover:scale-110 ${isSpinning ? 'animate-pulse' : ''}`} />
            <span className="relative z-10">{isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY!'}</span>
            
            {!isSpinning && participants.length >= 2 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-6 md:w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 md:h-6 md:w-6 bg-yellow-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Control Section */}
        <div className="lg:w-1/2 w-full max-w-md">
          <InputSection 
            participants={participants} 
            setParticipants={setParticipants} 
            isSpinning={isSpinning}
          />
        </div>
      </div>

      <WinnerDialog 
        winner={winner} 
        onClose={() => setWinner(null)} 
        isMuted={isMuted}
      />

      <footer className="mt-auto py-2 text-white/40 text-[10px] md:text-xs font-medium text-center w-full">
        Dữ liệu đã được lưu tự động trên trình duyệt này
      </footer>
    </div>
  );
};

export default App;
