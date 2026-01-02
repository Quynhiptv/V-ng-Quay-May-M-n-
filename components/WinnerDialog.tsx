
import React, { useEffect, useState, useRef } from 'react';
import { Participant } from '../types';
import { X, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';
import { AUDIO_URLS } from '../constants';

interface WinnerDialogProps {
  winner: Participant | null;
  onClose: () => void;
  isMuted: boolean;
}

const WinnerDialog: React.FC<WinnerDialogProps> = ({ winner, onClose, isMuted }) => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    if (winner && !isMuted) {
      if (!audioRef.current) {
        audioRef.current = new Audio(AUDIO_URLS.WIN);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Autoplay blocked or audio error:', err));
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [winner, isMuted]);

  if (!winner) return null;

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />
      
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="mb-6 inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 animate-bounce">
          <Trophy size={48} />
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">Chúc Mừng!</h3>
        <p className="text-gray-500 mb-6">Người may mắn hôm nay là:</p>
        
        <div 
          className="text-4xl font-black mb-8 px-6 py-4 rounded-2xl shadow-inner inline-block w-full"
          style={{ backgroundColor: `${winner.color}20`, color: winner.color }}
        >
          {winner.name}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          Tuyệt vời!
        </button>
      </div>
    </div>
  );
};

export default WinnerDialog;
