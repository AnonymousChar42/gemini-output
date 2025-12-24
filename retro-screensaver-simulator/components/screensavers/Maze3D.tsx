import React, { useEffect, useRef } from 'react';

const Maze3D: React.FC = () => {
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

    // Maze definition (1 = wall, 0 = empty)
    const mapSize = 16;
    const map = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,1,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,0,1,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    let posX = 1.5;
    let posY = 1.5;
    let dirX = 1;
    let dirY = 0;
    let planeX = 0;
    let planeY = 0.66; // FOV

    // Automated Movement State
    let nextMoveDelay = 0;
    let targetRot = 0;
    let rotSpeed = 0;
    let moveSpeed = 0.05;

    // Wall texture simulation (brick pattern via procedural generation)
    // We will just draw lines

    const draw = () => {
      // Draw Ceiling and Floor
      const gradientSky = ctx.createLinearGradient(0, 0, 0, height / 2);
      gradientSky.addColorStop(0, '#000033');
      gradientSky.addColorStop(1, '#0000AA');
      ctx.fillStyle = gradientSky;
      ctx.fillRect(0, 0, width, height / 2);

      const gradientFloor = ctx.createLinearGradient(0, height / 2, 0, height);
      gradientFloor.addColorStop(0, '#333');
      gradientFloor.addColorStop(1, '#000');
      ctx.fillStyle = gradientFloor;
      ctx.fillRect(0, height / 2, width, height / 2);

      // Raycasting
      for (let x = 0; x < width; x+=2) { // Optimization: Render every 2nd pixel horizontally
        const cameraX = 2 * x / width - 1;
        const rayDirX = dirX + planeX * cameraX;
        const rayDirY = dirY + planeY * cameraX;

        let mapX = Math.floor(posX);
        let mapY = Math.floor(posY);

        let sideDistX;
        let sideDistY;

        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);
        let perpWallDist;

        let stepX;
        let stepY;

        let hit = 0;
        let side = 0; // 0 for NS, 1 for EW

        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (posX - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - posX) * deltaDistX;
        }

        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (posY - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - posY) * deltaDistY;
        }

        // DDA
        while (hit === 0) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }
          if (map[mapX] && map[mapX][mapY] > 0) hit = 1;
        }

        if (side === 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
        else           perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

        const lineHeight = Math.floor(height / perpWallDist);
        let drawStart = -lineHeight / 2 + height / 2;
        if (drawStart < 0) drawStart = 0;
        let drawEnd = lineHeight / 2 + height / 2;
        if (drawEnd >= height) drawEnd = height - 1;

        // Color based on side to simulate lighting
        const color = side === 1 ? '#AA0000' : '#FF0000'; // Red brick
        
        // Basic brick texture logic (horizontal lines)
        ctx.fillStyle = color;
        ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
        
        // Add fake mortar lines
        ctx.fillStyle = '#000';
        const numBricks = 10;
        for(let b=0; b<numBricks; b++) {
             const brickY = drawStart + (lineHeight/numBricks) * b;
             if (brickY > 0 && brickY < height) {
                 ctx.fillRect(x, brickY, 2, 1 + (20/perpWallDist)); // thicker lines closer
             }
        }
      }
    };

    const update = () => {
      // Auto-walk logic
      if (rotSpeed !== 0) {
        // Rotating
        const oldDirX = dirX;
        dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
        dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);
        const oldPlaneX = planeX;
        planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
        planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);

        targetRot -= Math.abs(rotSpeed);
        if (targetRot <= 0) {
          rotSpeed = 0;
          moveSpeed = 0.05;
        }
      } else {
        // Move Forward
        const nextX = posX + dirX * moveSpeed * 4; // Look ahead
        const nextY = posY + dirY * moveSpeed * 4;

        // Simple collision check for "next tile"
        if (map[Math.floor(nextX)][Math.floor(nextY)] === 0) {
           posX += dirX * moveSpeed;
           posY += dirY * moveSpeed;
        } else {
           // Hit wall, decide turn
           moveSpeed = 0;
           targetRot = Math.PI / 2;
           // Randomly turn left or right
           rotSpeed = (Math.random() > 0.5 ? 1 : -1) * 0.05;
        }
      }
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

export default Maze3D;