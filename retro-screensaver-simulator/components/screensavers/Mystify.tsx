import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

interface Polygon {
  points: { x: number; y: number; dx: number; dy: number }[];
  color: string;
}

const Mystify: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const polygonsRef = useRef<Polygon[]>([]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    polygonsRef.current.forEach(poly => {
      poly.color = randomColor();
      poly.points.forEach(p => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 40;
        p.dx += (dx / dist) * force;
        p.dy += (dy / dist) * force;
      });
    });
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

    polygonsRef.current = Array.from({ length: 2 }).map(() => ({
      color: randomColor(),
      points: Array.from({ length: 4 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5,
      })),
    }));

    const trail: { polygons: Polygon[] }[] = [];
    const maxTrail = 12;

    const update = () => {
      polygonsRef.current.forEach((poly) => {
        poly.points.forEach((p) => {
          p.x += p.dx;
          p.y += p.dy;

          // Cruising logic
          const cruisingSpeed = 4;
          const currentSpeed = Math.sqrt(p.dx * p.dx + p.dy * p.dy) || 1;
          
          if (currentSpeed > cruisingSpeed) {
            // Apply damping only if above cruising speed
            p.dx *= 0.97;
            p.dy *= 0.97;
          } else {
            // Very slowly accelerate towards cruising speed if too slow
            p.dx *= 1.01;
            p.dy *= 1.01;
          }

          // Handle boundaries
          if (p.x < 0) { p.x = 0; p.dx = Math.abs(p.dx); }
          if (p.x > width) { p.x = width; p.dx = -Math.abs(p.dx); }
          if (p.y < 0) { p.y = 0; p.dy = Math.abs(p.dy); }
          if (p.y > height) { p.y = height; p.dy = -Math.abs(p.dy); }
        });
      });

      const snapshot = polygonsRef.current.map(p => ({
        color: p.color,
        points: p.points.map(pt => ({ ...pt }))
      }));
      
      trail.push({ polygons: snapshot });
      if (trail.length > maxTrail) trail.shift();
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      trail.forEach((frame, index) => {
        const opacity = (index + 1) / trail.length;
        ctx.lineWidth = 1;
        
        frame.polygons.forEach((poly) => {
          ctx.strokeStyle = poly.color;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(poly.points[0].x, poly.points[0].y);
          for (let i = 1; i < poly.points.length; i++) {
            ctx.lineTo(poly.points[i].x, poly.points[i].y);
          }
          ctx.closePath();
          ctx.stroke();
        });
      });
      ctx.globalAlpha = 1.0;
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

  return <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute top-0 left-0 w-full h-full cursor-crosshair" />;
};

export default Mystify;