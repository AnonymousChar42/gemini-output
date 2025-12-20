import React, { useEffect, useRef } from 'react';
import { engine } from '../utils/AudioEngine';

export const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const analyser = engine.getAnalyser();

      if (canvas && analyser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw simple frequency bars
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            // Cyberpunk gradient
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#0f3460');
            gradient.addColorStop(0.5, '#533483');
            gradient.addColorStop(1, '#e94560');

            ctx.fillStyle = gradient;
            // Draw bar scaled to canvas height
            const h = (barHeight / 255) * canvas.height;
            ctx.fillRect(x, canvas.height - h, barWidth, h);

            x += barWidth + 1;
          }
        }
      }
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl h-32 bg-black rounded-lg mb-6 border border-gray-800 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative">
      <div className="absolute top-2 left-2 text-[10px] text-gray-600 font-mono tracking-widest">VISUALIZER // FFT</div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={128} 
        className="w-full h-full opacity-80"
      />
    </div>
  );
};