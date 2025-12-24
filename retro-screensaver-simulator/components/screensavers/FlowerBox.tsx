import React, { useEffect, useRef } from 'react';
import { Point3D, Point2D } from '../../types';
import { rotateX, rotateY, rotateZ, project } from '../../utils/math';

const FlowerBox: React.FC = () => {
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

    // Cube vertices
    const baseVertices: Point3D[] = [
      { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 },
    ];

    // Edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting lines
    ];

    // Faces (indices of vertices) for simple painter's sorting if needed,
    // but wireframe is classic FlowerBox style.
    // Classic FlowerBox also morphs the shape.

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let morphPhase = 0;

    const loop = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      angleX += 0.02;
      angleY += 0.03;
      angleZ += 0.01;
      morphPhase += 0.05;

      const scale = 2 + Math.sin(morphPhase) * 0.5; // Pulsing size
      
      // Morph vertices based on phase - make it spikey
      const currentVertices = baseVertices.map(v => {
        const spikeFactor = 1 + Math.sin(morphPhase * 2 + v.x * 2) * 0.5;
        return {
          x: v.x * spikeFactor,
          y: v.y * spikeFactor,
          z: v.z * spikeFactor
        };
      });

      const projected: Point2D[] = currentVertices.map(v => {
        let r = rotateX(v, angleX);
        r = rotateY(r, angleY);
        r = rotateZ(r, angleZ);
        // Viewer distance 5 to avoid clipping too close
        return project(r, width, height, Math.min(width, height) * 0.4, 5); 
      });

      ctx.strokeStyle = `hsl(${morphPhase * 20}, 80%, 60%)`;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.stroke();

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

export default FlowerBox;