import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

interface Polygon {
  points: { x: number; y: number; dx: number; dy: number }[];
  color: string;
}

const Mystify: React.FC = () => {
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

    const polygons: Polygon[] = Array.from({ length: 2 }).map(() => ({
      color: randomColor(),
      points: Array.from({ length: 4 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 10,
        dy: (Math.random() - 0.5) * 10,
      })),
    }));

    // Trail buffer
    const trail: { polygons: Polygon[] }[] = [];
    const maxTrail = 10;

    const update = () => {
      polygons.forEach((poly) => {
        poly.points.forEach((p) => {
          p.x += p.dx;
          p.y += p.dy;

          if (p.x < 0 || p.x > width) p.dx *= -1;
          if (p.y < 0 || p.y > height) p.dy *= -1;
        });
      });

      // Deep copy for trail
      const snapshot = polygons.map(p => ({
        color: p.color,
        points: p.points.map(pt => ({ ...pt }))
      }));
      
      trail.push({ polygons: snapshot });
      if (trail.length > maxTrail) trail.shift();
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw trails
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

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default Mystify;