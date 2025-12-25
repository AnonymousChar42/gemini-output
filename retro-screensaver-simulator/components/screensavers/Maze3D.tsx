import React, { useEffect, useRef } from 'react';

const Maze3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shakeRef = useRef(0);
  const turningRef = useRef(false);

  const handleCanvasClick = () => {
    shakeRef.current = 20;
    turningRef.current = true;
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
    let planeY = 0.66;

    let targetRot = 0;
    let rotSpeed = 0;
    let moveSpeed = 0.05;
    let turnSide = 1;

    const draw = () => {
      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate((Math.random()-0.5)*shakeRef.current, (Math.random()-0.5)*shakeRef.current);
        shakeRef.current *= 0.9;
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height/2);
      skyGrad.addColorStop(0, '#000011'); skyGrad.addColorStop(1, '#000044');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0,0,width,height/2);

      ctx.fillStyle = '#111';
      ctx.fillRect(0, height/2, width, height/2);

      const step = Math.max(2, Math.floor(width / 320)); 
      for (let x = 0; x < width; x += step) {
        const cameraX = 2 * x / width - 1;
        const rDX = dirX + planeX * cameraX;
        const rDY = dirY + planeY * cameraX;
        let mX = Math.floor(posX);
        let mY = Math.floor(posY);
        const dDX = Math.abs(1 / rDX);
        const dDY = Math.abs(1 / rDY);
        let sDX, sDY, stX, stY, hit=0, side=0;
        if(rDX<0){stX=-1;sDX=(posX-mX)*dDX;}else{stX=1;sDX=(mX+1-posX)*dDX;}
        if(rDY<0){stY=-1;sDY=(posY-mY)*dDY;}else{stY=1;sDY=(mY+1-posY)*dDY;}
        while(hit===0){
          if(sDX<sDY){sDX+=dDX;mX+=stX;side=0;}else{sDY+=dDY;mY+=stY;side=1;}
          if(map[mX][mY]>0)hit=1;
        }
        const pWD = side===0 ? (mX-posX+(1-stX)/2)/rDX : (mY-posY+(1-stY)/2)/rDY;
        const lH = Math.floor(height/pWD);
        
        const brightness = Math.min(255, 200 / (pWD * 0.4));
        ctx.fillStyle = side===1 
          ? `rgb(${brightness*0.5}, 0, 0)` 
          : `rgb(${brightness*0.7}, 0, 0)`;
        
        ctx.fillRect(x, -lH/2+height/2, step, lH);
      }
      ctx.restore();
    };

    const update = () => {
      if (turningRef.current) {
        turningRef.current = false;
        targetRot = Math.PI;
        rotSpeed = 0.08;
        turnSide = Math.random() > 0.5 ? 1 : -1;
      }

      if (rotSpeed !== 0) {
        const actualRot = rotSpeed * turnSide;
        const oldDirX = dirX;
        dirX = dirX * Math.cos(actualRot) - dirY * Math.sin(actualRot);
        dirY = oldDirX * Math.sin(actualRot) + dirY * Math.cos(actualRot);
        const oldPX = planeX;
        planeX = planeX * Math.cos(actualRot) - planeY * Math.sin(actualRot);
        planeY = oldPX * Math.sin(actualRot) + planeY * Math.cos(actualRot);
        
        targetRot -= Math.abs(rotSpeed);
        if (targetRot <= 0) { 
          // After finishing rotation, check if we're still facing a wall too close
          if (map[Math.floor(posX + dirX * 1.0)][Math.floor(posY + dirY * 1.0)] === 0) {
            rotSpeed = 0; 
            moveSpeed = 0.05; 
          } else {
            // Face away even more
            targetRot = Math.PI / 4; 
          }
        }
      } else {
        // More aggressive distance checking to avoid "full red" screen
        const checkDist = 0.8; 
        if (map[Math.floor(posX + dirX * checkDist)][Math.floor(posY + dirY * checkDist)] === 0) {
           posX += dirX * moveSpeed;
           posY += dirY * moveSpeed;
        } else {
           moveSpeed = 0; 
           targetRot = Math.PI / 2; 
           rotSpeed = 0.06;
           turnSide = Math.random() > 0.5 ? 1 : -1;
        }
      }
    };

    const loop = () => { update(); draw(); animationId = requestAnimationFrame(loop); };
    loop();
    const handleResize = () => { width=window.innerWidth; height=window.innerHeight; canvas.width=width; canvas.height=height; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, []);

  return <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute top-0 left-0 w-full h-full cursor-pointer" />;
};

export default Maze3D;