import React, { useEffect, useRef } from 'react';
import { Point3D } from '../../types';
import { project, rotateY, rotateX, randomColor } from '../../utils/math';

interface PipeSegment { type: 'cylinder'; start: Point3D; end: Point3D; color: string; radius: number; }
interface Joint { type: 'sphere'; center: Point3D; color: string; radius: number; }
type SceneObject = PipeSegment | Joint;

const Pipes3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetSignal = useRef<Point3D | null>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    // Map mouse click to a rough grid start point
    resetSignal.current = { x: mx * 10, y: my * 10, z: 0 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth, height = window.innerHeight;
    const GRID_SIZE = 12, PIPE_RADIUS = 0.3, MAX_PIPES = 800;
    let objects: SceneObject[] = [], visited = new Set<string>(), heads: any[] = [];
    let rotationY = 0, rotationX = 0;

    const reset = (startPos?: Point3D) => {
      objects = []; visited.clear(); heads = [];
      const numStarts = startPos ? 1 : 2 + Math.floor(Math.random() * 2);
      for(let i=0; i<numStarts; i++) spawnHead(startPos);
    };

    const spawnHead = (forcedPos?: Point3D) => {
       const range = Math.floor(GRID_SIZE / 2) - 1;
       const startPos = forcedPos ? {
         x: Math.max(-range, Math.min(range, Math.round(forcedPos.x))),
         y: Math.max(-range, Math.min(range, Math.round(forcedPos.y))),
         z: Math.max(-range, Math.min(range, Math.round(forcedPos.z)))
       } : {
         x: Math.floor((Math.random() - 0.5) * 2 * range),
         y: Math.floor((Math.random() - 0.5) * 2 * range),
         z: Math.floor((Math.random() - 0.5) * 2 * range)
       };
       const key = `${startPos.x},${startPos.y},${startPos.z}`;
       if (visited.has(key)) return;
       visited.add(key);
       const color = randomColor();
       objects.push({ type: 'sphere', center: { ...startPos }, color: color, radius: PIPE_RADIUS * 1.2 });
       heads.push({ pos: startPos, dir: {x:1,y:0,z:0}, color: color, alive: true });
    };

    const updateLogic = () => {
      if (resetSignal.current) { reset(resetSignal.current); resetSignal.current = null; return; }
      heads.forEach(h => {
        if (!h.alive) return;
        const nextPos = { x: h.pos.x + h.dir.x, y: h.pos.y + h.dir.y, z: h.pos.z + h.dir.z };
        const limit = GRID_SIZE / 2;
        if (Math.abs(nextPos.x)>limit || Math.abs(nextPos.y)>limit || Math.abs(nextPos.z)>limit || visited.has(`${nextPos.x},${nextPos.y},${nextPos.z}`)) {
          h.alive = false; if (heads.filter(x=>x.alive).length < 2) spawnHead(); return;
        }
        visited.add(`${nextPos.x},${nextPos.y},${nextPos.z}`);
        objects.push({ type: 'cylinder', start: { ...h.pos }, end: { ...nextPos }, color: h.color, radius: PIPE_RADIUS });
        objects.push({ type: 'sphere', center: { ...nextPos }, color: h.color, radius: PIPE_RADIUS * 1.25 });
        h.pos = nextPos;
        if (Math.random() < 0.25) {
          const dirs = [{x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:-1,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1}];
          h.dir = dirs[Math.floor(Math.random()*dirs.length)];
        }
      });
      if (heads.every(h=>!h.alive) || objects.length > MAX_PIPES) reset();
    };

    const drawScene = () => {
       ctx.fillStyle = '#000'; ctx.fillRect(0, 0, width, height);
       const sorted = objects.map(obj => {
         const center = obj.type==='sphere' ? obj.center : {x:(obj.start.x+obj.end.x)/2,y:(obj.start.y+obj.end.y)/2,z:(obj.start.z+obj.end.z)/2};
         let r = rotateY(center, rotationY); r = rotateX(r, rotationX);
         return { obj, z: r.z };
       }).sort((a,b)=>b.z-a.z);
       sorted.forEach(s => {
          const fov=500, dist=20;
          if (s.obj.type==='sphere') {
             let p = rotateY(s.obj.center, rotationY); p = rotateX(p, rotationX);
             const proj = project(p, width, height, fov, dist);
             const r = s.obj.radius * (fov/(dist+p.z));
             const grad = ctx.createRadialGradient(proj.x-r*0.3, proj.y-r*0.3, r*0.1, proj.x, proj.y, r);
             grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, s.obj.color); grad.addColorStop(1, '#000');
             ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(proj.x, proj.y, r, 0, Math.PI*2); ctx.fill();
          } else {
             let p1 = rotateY(s.obj.start, rotationY); p1 = rotateX(p1, rotationX);
             let p2 = rotateY(s.obj.end, rotationY); p2 = rotateX(p2, rotationX);
             const pr1 = project(p1, width, height, fov, dist), pr2 = project(p2, width, height, fov, dist);
             const r1 = s.obj.radius*(fov/(dist+p1.z)), r2 = s.obj.radius*(fov/(dist+p2.z));
             const dx = pr2.x-pr1.x, dy = pr2.y-pr1.y, len = Math.sqrt(dx*dx+dy*dy);
             if (len < 1) return;
             const nx = -dy/len, ny = dx/len;
             ctx.fillStyle = s.obj.color;
             ctx.beginPath(); ctx.moveTo(pr1.x+nx*r1, pr1.y+ny*r1); ctx.lineTo(pr2.x+nx*r2, pr2.y+ny*r2); ctx.lineTo(pr2.x-nx*r2, pr2.y-ny*r2); ctx.lineTo(pr1.x-nx*r1, pr1.y-ny*r1); ctx.fill();
          }
       });
    };

    let f = 0; const loop = () => { rotationY+=0.003; rotationX+=0.001; if(f%6===0) updateLogic(); drawScene(); f++; animationId=requestAnimationFrame(loop); };
    canvas.width=width; canvas.height=height; reset(); loop();
    const handleResize = () => { width=window.innerWidth; height=window.innerHeight; canvas.width=width; canvas.height=height; reset(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, []);

  return <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute top-0 left-0 w-full h-full cursor-crosshair" />;
};

export default Pipes3D;