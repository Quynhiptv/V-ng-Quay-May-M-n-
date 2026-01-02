
import React, { useEffect, useRef } from 'react';
import { Participant } from '../types';

interface WheelProps {
  participants: Participant[];
  rotation: number;
  isSpinning: boolean;
}

const Wheel: React.FC<WheelProps> = ({ participants, rotation, isSpinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 10;
    const total = participants.length;
    const arc = (2 * Math.PI) / total;

    ctx.clearRect(0, 0, size, size);

    // Draw shadow
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    participants.forEach((p, i) => {
      const angle = i * arc;
      
      // Vẽ segment bình thường cho tất cả mọi người
      ctx.beginPath();
      ctx.fillStyle = p.color; 
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();
      
      // Segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      
      const fontSize = total > 15 ? '10px' : total > 10 ? '12px' : '16px';
      ctx.font = `bold ${fontSize} Inter`;
      
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      
      const displayText = p.name;
      ctx.fillText(displayText.length > 12 ? displayText.substring(0, 10) + '..' : displayText, radius - 20, 6);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [participants]);

  return (
    <div className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] md:w-[400px] md:h-[400px] mx-auto select-none">
      {/* Indicator */}
      <div 
        className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-0 h-0 
        border-t-[12px] border-t-transparent 
        border-b-[12px] border-b-transparent 
        border-r-[24px] border-r-yellow-400 drop-shadow-md md:border-t-[15px] md:border-b-[15px] md:border-r-[30px]"
      />
      
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full h-full transition-transform duration-[9000ms] cubic-bezier(0.15, 0, 0.15, 1) drop-shadow-2xl"
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
};

export default Wheel;
