import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

const DVD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const logoWidth = 100;
    const logoHeight = 50;
    
    let x = Math.random() * (width - logoWidth);
    let y = Math.random() * (height - logoHeight);
    let dx = 3;
    let dy = 3;
    let color = randomColor();

    const update = () => {
      x += dx;
      y += dy;

      let hit = false;
      if (x + logoWidth > width || x < 0) {
        dx = -dx;
        hit = true;
      }
      if (y + logoHeight > height || y < 0) {
        dy = -dy;
        hit = true;
      }

      if (hit) {
        color = randomColor();
      }
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Draw a simplified DVD logo shape
      ctx.save();
      ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
      ctx.scale(1, 0.5); // Squish for perspective
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      ctx.fillStyle = '#000';
      ctx.fillText("DVD", x + logoWidth / 2, y + logoHeight / 2 + 5);
      
      // Simple glare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.ellipse(x + logoWidth / 2, y + logoHeight / 2 - 10, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    loop();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default DVD;