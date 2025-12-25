import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

const DVD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    x: 100,
    y: 100,
    dx: 3,
    dy: 3,
    color: '#0ff',
    glow: 0,
    glowX: 0,
    glowY: 0
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    stateRef.current.glow = 20;
    stateRef.current.glowX = mx;
    stateRef.current.glowY = my;
    
    stateRef.current.x = mx - 50;
    stateRef.current.y = my - 25;
    stateRef.current.dx = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 6);
    stateRef.current.dy = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 6);
    stateRef.current.color = randomColor();
  };

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
    
    stateRef.current.x = Math.random() * (width - logoWidth);
    stateRef.current.y = Math.random() * (height - logoHeight);

    const update = () => {
      const s = stateRef.current;
      s.x += s.dx;
      s.y += s.dy;

      let hit = false;
      if (s.x + logoWidth > width) { s.x = width - logoWidth; s.dx *= -1; hit = true; }
      if (s.x < 0) { s.x = 0; s.dx *= -1; hit = true; }
      if (s.y + logoHeight > height) { s.y = height - logoHeight; s.dy *= -1; hit = true; }
      if (s.y < 0) { s.y = 0; s.dy *= -1; hit = true; }

      if (hit) s.color = randomColor();
      if (s.glow > 0) s.glow--;
      
      const cruisingSpeed = 3;
      if (Math.abs(s.dx) > cruisingSpeed) s.dx *= 0.98;
      if (Math.abs(s.dy) > cruisingSpeed) s.dy *= 0.98;
      
      if (Math.abs(s.dx) < 1) s.dx = s.dx < 0 ? -1 : 1;
      if (Math.abs(s.dy) < 1) s.dy = s.dy < 0 ? -1 : 1;
    };

    const draw = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      if (s.glow > 0) {
        ctx.save();
        // Use a safer way to handle HSL transparency: convert "hsl(h, s, l)" to "hsla(h, s, l, a)"
        const hslaColor = s.color.replace('hsl', 'hsla').replace(')', `, ${s.glow / 20})`);
        const grad = ctx.createRadialGradient(s.glowX, s.glowY, 0, s.glowX, s.glowY, s.glow * 15);
        grad.addColorStop(0, hslaColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.fillStyle = s.color;
      ctx.save();
      ctx.translate(s.x + logoWidth / 2, s.y + logoHeight / 2);
      ctx.scale(1, 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("DVD", s.x + logoWidth / 2, s.y + logoHeight / 2 + 5);
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

  return <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute top-0 left-0 w-full h-full cursor-pointer" />;
};

export default DVD;