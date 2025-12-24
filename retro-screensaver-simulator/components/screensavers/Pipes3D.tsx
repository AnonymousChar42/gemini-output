import React, { useEffect, useRef } from 'react';
import { Point3D } from '../../types';
import { project, rotateY, rotateX, randomColor } from '../../utils/math';

interface PipeSegment {
  type: 'cylinder';
  start: Point3D;
  end: Point3D;
  color: string;
  radius: number;
}

interface Joint {
  type: 'sphere';
  center: Point3D;
  color: string;
  radius: number;
}

type SceneObject = PipeSegment | Joint;

const Pipes3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const GRID_SIZE = 12; // Larger grid for more space
    const PIPE_RADIUS = 0.3; // Thicker pipes relative to cell size (1.0)
    const MAX_PIPES = 800; // More pipes before reset
    
    // Scene State
    let objects: SceneObject[] = [];
    let visited = new Set<string>();
    
    // Active pipe heads
    interface PipeHead {
      pos: Point3D;
      dir: Point3D; // current direction
      color: string;
      alive: boolean;
    }
    
    let heads: PipeHead[] = [];
    let rotationY = 0;
    let rotationX = 0;

    const reset = () => {
      objects = [];
      visited.clear();
      heads = [];
      
      // Start with multiple pipes for action
      const numStarts = 2 + Math.floor(Math.random() * 2); 
      for(let i=0; i<numStarts; i++) {
        spawnHead();
      }
    };

    const spawnHead = () => {
       // Start somewhere within grid
       // We center the grid at 0,0,0. Range is -GRID_SIZE/2 to GRID_SIZE/2
       const range = Math.floor(GRID_SIZE / 2) - 1;
       const startPos = {
         x: Math.floor((Math.random() - 0.5) * 2 * range),
         y: Math.floor((Math.random() - 0.5) * 2 * range),
         z: Math.floor((Math.random() - 0.5) * 2 * range)
       };
       
       const key = `${startPos.x},${startPos.y},${startPos.z}`;
       if (visited.has(key)) return; // occupied
       visited.add(key);
       
       const color = randomColor();
       
       // Add starting joint
       objects.push({
         type: 'sphere',
         center: { ...startPos },
         color: color,
         radius: PIPE_RADIUS * 1.2
       });
       
       heads.push({
         pos: startPos,
         dir: getRandomDir(),
         color: color,
         alive: true
       });
    };

    const getRandomDir = (currentDir?: Point3D): Point3D => {
      const dirs = [
        {x:1, y:0, z:0}, {x:-1, y:0, z:0},
        {x:0, y:1, z:0}, {x:0, y:-1, z:0},
        {x:0, y:0, z:1}, {x:0, y:0, z:-1}
      ];
      // Filter out reverse direction if currentDir exists (don't go back)
      const valid = currentDir 
        ? dirs.filter(d => !(d.x === -currentDir.x && d.y === -currentDir.y && d.z === -currentDir.z))
        : dirs;
      return valid[Math.floor(Math.random() * valid.length)];
    };

    const updateLogic = () => {
      let allDead = true;
      let activeCount = 0;

      heads.forEach(head => {
        if (!head.alive) return;
        allDead = false;
        activeCount++;

        // Determine next position
        const nextPos = {
          x: head.pos.x + head.dir.x,
          y: head.pos.y + head.dir.y,
          z: head.pos.z + head.dir.z
        };
        
        // Check bounds and collision
        const key = `${nextPos.x},${nextPos.y},${nextPos.z}`;
        const limit = GRID_SIZE / 2;
        const outOfBounds = Math.abs(nextPos.x) > limit || Math.abs(nextPos.y) > limit || Math.abs(nextPos.z) > limit;
        
        // Collision check
        if (outOfBounds || visited.has(key)) {
          head.alive = false;
          // Spawn new one if we have too few active pipes
          if (activeCount < 3 && Math.random() > 0.3) {
             spawnHead();
          }
          return;
        }

        // Move valid
        visited.add(key);

        // Add Cylinder (Pipe body)
        objects.push({
          type: 'cylinder',
          start: { ...head.pos },
          end: { ...nextPos },
          color: head.color,
          radius: PIPE_RADIUS
        });

        // Add Joint (Elbow/Ball)
        objects.push({
          type: 'sphere',
          center: { ...nextPos },
          color: head.color,
          radius: PIPE_RADIUS * 1.25 // Slightly larger than pipe
        });

        head.pos = nextPos;

        // Randomly change direction
        if (Math.random() < 0.25) {
           head.dir = getRandomDir(head.dir);
        }
      });

      if (allDead || objects.length > MAX_PIPES) {
        reset();
      }
    };

    const drawScene = () => {
       ctx.fillStyle = '#000';
       ctx.fillRect(0, 0, width, height);
       
       // Optimization: Compute transformed Center Z once for sorting
       const transformedObjects = objects.map(obj => {
         let center: Point3D;
         if (obj.type === 'sphere') center = obj.center;
         else center = { 
           x: (obj.start.x + obj.end.x)/2, 
           y: (obj.start.y + obj.end.y)/2, 
           z: (obj.start.z + obj.end.z)/2 
         };

         // Rotate the center to get view-space Z
         let r = rotateY(center, rotationY);
         r = rotateX(r, rotationX);
         
         return {
           original: obj,
           sortZ: r.z, // Use Z for sorting
           // We re-calculate exact points later to save memory/complexity here 
           // or we could cache projected points. For <1000 objects, re-projecting is fine.
         };
       });

       // Sort: Draw furthest (highest Z) first
       transformedObjects.sort((a, b) => b.sortZ - a.sortZ);

       // Draw
       const fov = 500;
       const viewerDist = 20; // Move camera back to see the grid

       transformedObjects.forEach(({ original }) => {
          if (original.type === 'sphere') {
             drawSphere(original, fov, viewerDist);
          } else {
             drawCylinder(original, fov, viewerDist);
          }
       });
    };
    
    const drawSphere = (sphere: Joint, fov: number, viewDist: number) => {
       // Rotate Center
       let p = rotateY(sphere.center, rotationY);
       p = rotateX(p, rotationX);
       
       // Project
       const proj = project(p, width, height, fov, viewDist);
       
       // Scale radius roughly by perspective (simple approximation)
       const scale = fov / (viewDist + p.z);
       const r = sphere.radius * scale;
       
       if (r <= 0.5) return; // Too small

       // Radial gradient for 3D ball look
       // Highlight is offset towards top-left (screen space)
       const grad = ctx.createRadialGradient(
          proj.x - r*0.3, proj.y - r*0.3, r * 0.1,
          proj.x, proj.y, r
       );
       grad.addColorStop(0, '#fff');
       grad.addColorStop(0.3, sphere.color);
       grad.addColorStop(1, '#000');
       
       ctx.fillStyle = grad;
       ctx.beginPath();
       ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
       ctx.fill();
    };

    const drawCylinder = (cyl: PipeSegment, fov: number, viewDist: number) => {
       // Rotate Points
       let p1 = rotateY(cyl.start, rotationY);
       p1 = rotateX(p1, rotationX);
       let p2 = rotateY(cyl.end, rotationY);
       p2 = rotateX(p2, rotationX);

       const proj1 = project(p1, width, height, fov, viewDist);
       const proj2 = project(p2, width, height, fov, viewDist);
       
       const scale1 = fov / (viewDist + p1.z);
       const scale2 = fov / (viewDist + p2.z);
       
       const r1 = cyl.radius * scale1;
       const r2 = cyl.radius * scale2;

       // Calculate perpendicular vectors for thickness
       const dx = proj2.x - proj1.x;
       const dy = proj2.y - proj1.y;
       const len = Math.sqrt(dx*dx + dy*dy);
       if (len < 1) return; // Too short to draw
       
       const nx = -dy / len;
       const ny = dx / len;
       
       // 4 Corners of the projected cylinder
       const q1x = proj1.x + nx * r1;
       const q1y = proj1.y + ny * r1;
       const q2x = proj2.x + nx * r2;
       const q2y = proj2.y + ny * r2;
       const q3x = proj2.x - nx * r2;
       const q3y = proj2.y - ny * r2;
       const q4x = proj1.x - nx * r1;
       const q4y = proj1.y - ny * r1;
       
       // 1. Draw solid color base
       ctx.fillStyle = cyl.color;
       ctx.beginPath();
       ctx.moveTo(q1x, q1y);
       ctx.lineTo(q2x, q2y);
       ctx.lineTo(q3x, q3y);
       ctx.lineTo(q4x, q4y);
       ctx.closePath();
       ctx.fill();
       
       // 2. Draw Lighting Overlay (Linear Gradient across width)
       // The gradient goes from side (q4) to side (q1)
       const lightingGrad = ctx.createLinearGradient(q4x, q4y, q1x, q1y);
       lightingGrad.addColorStop(0, 'rgba(0,0,0,0.5)');   // Dark edge
       lightingGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)'); // Mild highlight
       lightingGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)'); // Shine
       lightingGrad.addColorStop(0.7, 'rgba(255,255,255,0.1)'); // Mild highlight
       lightingGrad.addColorStop(1, 'rgba(0,0,0,0.5)');   // Dark edge
       
       ctx.fillStyle = lightingGrad;
       // Fill the same path again
       ctx.fill();
    };

    let frame = 0;
    const loop = () => {
      // Auto-rotate the whole grid for 3D effect
      rotationY += 0.003;
      rotationX += 0.001;
      
      // Grow pipes every X frames
      if (frame % 6 === 0) {
        updateLogic();
      }
      
      drawScene();
      
      frame++;
      animationId = requestAnimationFrame(loop);
    };
    
    // Initialize
    canvas.width = width;
    canvas.height = height;
    reset();
    loop();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      reset(); // Reset scene on resize to avoid distortion artifacts
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default Pipes3D;