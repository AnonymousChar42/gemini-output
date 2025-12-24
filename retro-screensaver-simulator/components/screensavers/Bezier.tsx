import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

interface Curve {
  points: { x: number; y: number; dx: number; dy: number }[]; // 4 points for cubic bezier
  color: string;
}

const Bezier: React.FC = () => {
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

    const numCurves = 3;
    const curves: Curve[] = Array.from({ length: numCurves }).map(() => ({
      color: randomColor(),
      points: Array.from({ length: 4 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
      })),
    }));

    const trail: Curve[][] = [];
    const maxTrail = 40;

    const update = () => {
      curves.forEach((curve) => {
        curve.points.forEach((p) => {
          p.x += p.dx;
          p.y += p.dy;
          if (p.x <= 0 || p.x >= width) p.dx *= -1;
          if (p.y <= 0 || p.y >= height) p.dy *= -1;
        });
      });

      // Snapshot
      const snapshot = curves.map(c => ({
        color: c.color,
        points: c.points.map(p => ({ ...p }))
      }));
      trail.push(snapshot);
      if (trail.length > maxTrail) trail.shift();
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      trail.forEach((frame, idx) => {
        const opacity = (idx + 1) / trail.length;
        ctx.globalAlpha = opacity;
        
        frame.forEach((curve) => {
          ctx.strokeStyle = curve.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(curve.points[0].x, curve.points[0].y);
          ctx.bezierCurveTo(
            curve.points[1].x, curve.points[1].y,
            curve.points[2].x, curve.points[2].y,
            curve.points[3].x, curve.points[3].y
          );
          ctx.stroke();
        });
      });
      ctx.globalAlpha = 1;
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

export default Bezier;