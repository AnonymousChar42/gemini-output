import React, { useEffect, useRef } from 'react';
import { randomColor } from '../../utils/math';

interface Curve {
  points: { x: number; y: number; dx: number; dy: number }[];
  color: string;
}

const Bezier: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curvesRef = useRef<Curve[]>([]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    curvesRef.current.forEach(curve => {
      curve.points.forEach(p => {
        const dx = mx - p.x;
        const dy = my - p.y;
        p.dx += dx * 0.15;
        p.dy += dy * 0.15;
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

    curvesRef.current = Array.from({ length: 3 }).map(() => ({
      color: randomColor(),
      points: Array.from({ length: 4 }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
      })),
    }));

    const trail: Curve[][] = [];
    const maxTrail = 30;

    const update = () => {
      curvesRef.current.forEach((curve) => {
        curve.points.forEach((p) => {
          p.x += p.dx;
          p.y += p.dy;
          
          const cruisingSpeed = 5;
          const currentSpeed = Math.sqrt(p.dx * p.dx + p.dy * p.dy) || 1;
          
          if (currentSpeed > cruisingSpeed) {
            p.dx *= 0.98;
            p.dy *= 0.98;
          } else {
            p.dx *= 1.005;
            p.dy *= 1.005;
          }

          if (p.x <= 0) { p.x = 0; p.dx = Math.abs(p.dx); }
          if (p.x >= width) { p.x = width; p.dx = -Math.abs(p.dx); }
          if (p.y <= 0) { p.y = 0; p.dy = Math.abs(p.dy); }
          if (p.y >= height) { p.y = height; p.dy = -Math.abs(p.dy); }
        });
      });

      const snapshot = curvesRef.current.map(c => ({
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

  return <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute top-0 left-0 w-full h-full cursor-crosshair" />;
};

export default Bezier;