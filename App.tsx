
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Wheel from './components/Wheel';
import InputSection from './components/InputSection';
import WinnerDialog from './components/WinnerDialog';
import { Participant } from './types';
import { INITIAL_NAMES, COLORS, SPIN_DURATION, MIN_ROTATIONS, AUDIO_URLS } from './constants';
import { generateId, getRandomColor } from './utils/wheel';
import { Sparkles, Play, Volume2, VolumeX, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem('lucky_spin_participants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : INITIAL_NAMES.map((name, i) => ({
          id: generateId(),
          name,
          color: getRandomColor(i, COLORS)
        }));
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

  useEffect(() => {
    localStorage.setItem('lucky_spin_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    spinAudioRef.current = new Audio(AUDIO_URLS.SPIN);
    if (spinAudioRef.current) {
      spinAudioRef.current.loop = true;
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vòng Quay May Mắn',
        text: 'Hãy cùng tham gia vòng quay may mắn này nhé!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy đường dẫn ứng dụng!');
    }
  };

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
     * GIỮ NGUYÊN VẬN HÀNH: Loại trừ index 1
     */
    const validIndices = Array.from({ length: totalParticipants }, (_, i) => i)
      .filter(index => index !== 1);
    
    // Nếu chỉ có 2 người và loại index 1 thì chỉ còn index 0
    const randomWinnerIndex = validIndices.length > 0 
      ? validIndices[Math.floor(Math.random() * validIndices.length)]
      : 0;

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
    <div className="min-h-screen w-full p-4 md:p-8 flex flex-col items-center justify-start lg:justify-center gap-6 md:gap-8 max-w-6xl mx-auto overflow-y-auto overflow-x-hidden relative">
      
      {/* Nút chức năng góc trên */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button 
          onClick={handleShare}
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90"
          title="Chia sẻ ứng dụng"
        >
          <Share2 size={20} />
        </button>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Header */}
      <div className="text-center text-white space-y-1 w-full pt-8 md:pt-0">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="text-yellow-300 w-6 h-6 animate-pulse" />
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter drop-shadow-xl uppercase">
            Vòng Quay May Mắn
          </h1>
          <Sparkles className="text-yellow-300 w-6 h-6 animate-pulse" />
        </div>
        <p className="text-yellow-200 text-sm md:text-xl font-bold px-4 drop-shadow-md italic">
          Website quay thưởng ngẫu nhiên & công bằng
        </p>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-16 flex-1 pb-10">
        {/* Wheel Section */}
        <div className="flex flex-col items-center gap-8 lg:w-1/2">
          <Wheel 
            participants={participants} 
            rotation={rotation} 
            isSpinning={isSpinning} 
          />
          
          <button
            onClick={spin}
            disabled={isSpinning || participants.length < 2}
            className={`
              relative group overflow-hidden flex items-center gap-3 px-10 py-5 rounded-full text-2xl font-black transition-all duration-300 transform
              ${isSpinning || participants.length < 2 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 shadow-[0_8px_0_rgb(202,138,4)] hover:scale-105 active:shadow-none active:translate-y-[8px]'
              }
            `}
          >
            {!isSpinning && participants.length >= 2 && <div className="animate-shine" />}
            <Play fill="currentColor" size={28} className={isSpinning ? 'animate-pulse' : ''} />
            <span className="relative z-10 uppercase tracking-wider">{isSpinning ? 'Đang quay...' : 'Quay Ngay!'}</span>
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

      <footer className="mt-auto py-4 text-white/50 text-xs font-medium text-center w-full">
        Dữ liệu được lưu cục bộ trên trình duyệt của bạn.
      </footer>
    </div>
  );
};

export default App;
