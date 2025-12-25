
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, EntityType, Entity } from '../types';
import { WORLD_MAP, ROT_SPEED, MOVE_SPEED, INITIAL_ENTITIES } from '../constants';
import { Input } from '../engine/Input';

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const COLLISION_BUFFER = 0.25;

interface GameViewProps {
  onUpdateHUD: (health: number, ammo: number, score: number) => void;
}

const GameView: React.FC<GameViewProps> = ({ onUpdateHUD }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: {
      pos: { x: 12, y: 12 },
      dir: { x: -1, y: 0 },
      plane: { x: 0, y: 0.66 },
      health: 100,
      ammo: 32,
      score: 0
    },
    entities: INITIAL_ENTITIES.map(e => ({ ...e } as Entity)),
    isShooting: false,
    lastShootTime: 0,
    map: WORLD_MAP
  });

  const inputRef = useRef<Input | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    inputRef.current = new Input();
    let animationId: number;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const cappedDt = Math.min(dt, 0.05); // 限制单帧最大时长，防止性能抖动时跳变

      update(cappedDt);
      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    const update = (dt: number) => {
      const { player, map, entities } = gameStateRef.current;
      const input = inputRef.current;
      if (!input) return;

      const moveStep = MOVE_SPEED * dt;
      const rotStep = ROT_SPEED * dt;

      // --- 移动处理 ---
      let moveX = 0;
      let moveY = 0;

      if (input.isPressed('KeyW') || input.isPressed('ArrowUp')) {
        moveX += player.dir.x * moveStep;
        moveY += player.dir.y * moveStep;
      }
      if (input.isPressed('KeyS') || input.isPressed('ArrowDown')) {
        moveX -= player.dir.x * moveStep;
        moveY -= player.dir.y * moveStep;
      }

      // 独立的 X 轴碰撞检测（允许滑动）
      if (moveX !== 0) {
        const checkX = player.pos.x + moveX + (moveX > 0 ? COLLISION_BUFFER : -COLLISION_BUFFER);
        if (map[Math.floor(checkX)][Math.floor(player.pos.y)] === 0) {
          player.pos.x += moveX;
        }
      }
      // 独立的 Y 轴碰撞检测（允许滑动）
      if (moveY !== 0) {
        const checkY = player.pos.y + moveY + (moveY > 0 ? COLLISION_BUFFER : -COLLISION_BUFFER);
        if (map[Math.floor(player.pos.x)][Math.floor(checkY)] === 0) {
          player.pos.y += moveY;
        }
      }

      // --- 旋转处理 ---
      let rotAngle = 0;
      if (input.isPressed('KeyA') || input.isPressed('ArrowLeft')) rotAngle += rotStep;
      if (input.isPressed('KeyD') || input.isPressed('ArrowRight')) rotAngle -= rotStep;

      if (rotAngle !== 0) {
        const cosR = Math.cos(rotAngle);
        const sinR = Math.sin(rotAngle);
        
        const oldDirX = player.dir.x;
        player.dir.x = player.dir.x * cosR - player.dir.y * sinR;
        player.dir.y = oldDirX * sinR + player.dir.y * cosR;
        
        const oldPlaneX = player.plane.x;
        player.plane.x = player.plane.x * cosR - player.plane.y * sinR;
        player.plane.y = oldPlaneX * sinR + player.plane.y * cosR;
      }

      // --- 射击处理 ---
      const now = Date.now();
      if (input.isPressed('Space') && player.ammo > 0 && now - gameStateRef.current.lastShootTime > 180) {
        gameStateRef.current.isShooting = true;
        gameStateRef.current.lastShootTime = now;
        player.ammo -= 1;
        checkHit(player, entities);
      } else if (now - gameStateRef.current.lastShootTime > 80) {
        gameStateRef.current.isShooting = false;
      }

      // --- 物品收集 ---
      entities.forEach(entity => {
        if (entity.isCollected) return;
        const distSq = (player.pos.x - entity.pos.x)**2 + (player.pos.y - entity.pos.y)**2;
        if (distSq < 0.4) {
          if (entity.type === EntityType.TREASURE) {
            player.score += 500;
          } else if (entity.type === EntityType.MEDKIT && player.health < 100) {
            player.health = Math.min(100, player.health + 25);
          } else if (entity.type === EntityType.AMMO) {
            player.ammo += 10;
          }
          entity.isCollected = true;
        }
      });

      onUpdateHUD(player.health, player.ammo, player.score);
    };

    const checkHit = (player: any, entities: Entity[]) => {
      entities.forEach(entity => {
        if (entity.type === EntityType.ENEMY && !entity.isDead) {
          const dx = entity.pos.x - player.pos.x;
          const dy = entity.pos.y - player.pos.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const angleToEntity = Math.atan2(dy, dx);
          const playerAngle = Math.atan2(player.dir.y, player.dir.x);
          
          let angleDiff = angleToEntity - playerAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          const tolerance = 0.35 / (dist * 0.4 + 0.1);
          if (Math.abs(angleDiff) < Math.min(tolerance, 0.5)) {
             entity.isDead = true;
             entity.emoji = '💀';
             player.score += 100;
          }
        }
      });
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { player, map, entities } = gameStateRef.current;

      ctx.fillStyle = '#1a1a1a'; // Ceiling
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      ctx.fillStyle = '#333'; // Floor
      ctx.fillRect(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);

      const zBuffer: number[] = new Array(CANVAS_WIDTH).fill(Infinity);

      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const cameraX = 2 * x / CANVAS_WIDTH - 1;
        const rayDirX = player.dir.x + player.plane.x * cameraX;
        const rayDirY = player.dir.y + player.plane.y * cameraX;

        let mapX = Math.floor(player.pos.x);
        let mapY = Math.floor(player.pos.y);

        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistY = Math.abs(1 / rayDirY);

        let sideDistX, sideDistY;
        let stepX, stepY;

        if (rayDirX < 0) {
          stepX = -1;
          sideDistX = (player.pos.x - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1.0 - player.pos.x) * deltaDistX;
        }

        if (rayDirY < 0) {
          stepY = -1;
          sideDistY = (player.pos.y - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1.0 - player.pos.y) * deltaDistY;
        }

        let hit = 0;
        let side = 0;
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
          if (map[mapX][mapY] > 0) hit = 1;
        }

        let perpWallDist;
        if (side === 0) perpWallDist = (mapX - player.pos.x + (1 - stepX) / 2) / rayDirX;
        else perpWallDist = (mapY - player.pos.y + (1 - stepY) / 2) / rayDirY;

        zBuffer[x] = perpWallDist;

        const lineHeight = Math.floor(CANVAS_HEIGHT / perpWallDist);
        let drawStart = Math.max(0, -lineHeight / 2 + CANVAS_HEIGHT / 2);
        let drawEnd = Math.min(CANVAS_HEIGHT - 1, lineHeight / 2 + CANVAS_HEIGHT / 2);

        let color = '#444';
        switch (map[mapX][mapY]) {
          case 1: color = '#2563EB'; break; 
          case 2: color = '#DC2626'; break; 
          case 3: color = '#059669'; break; 
          case 4: color = '#4B5563'; break; 
          case 5: color = '#D97706'; break; 
        }
        
        if (side === 1) ctx.globalAlpha = 0.5;
        ctx.fillStyle = color;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
        ctx.globalAlpha = 1.0;
      }

      const sortedEntities = entities
        .filter(e => !e.isCollected)
        .map(e => ({
          ...e,
          dist: ((player.pos.x - e.pos.x) ** 2 + (player.pos.y - e.pos.y) ** 2)
        }))
        .sort((a, b) => b.dist - a.dist);

      sortedEntities.forEach(sprite => {
        const spriteX = sprite.pos.x - player.pos.x;
        const spriteY = sprite.pos.y - player.pos.y;
        const invDet = 1.0 / (player.plane.x * player.dir.y - player.dir.x * player.plane.y);
        const transformX = invDet * (player.dir.y * spriteX - player.dir.x * spriteY);
        const transformY = invDet * (-player.plane.y * spriteX + player.plane.x * spriteY);

        if (transformY > 0.1) {
          const spriteScreenX = Math.floor((CANVAS_WIDTH / 2) * (1 + transformX / transformY));
          const spriteHeight = Math.abs(Math.floor(CANVAS_HEIGHT / transformY));
          
          if (zBuffer[spriteScreenX] > transformY) {
            ctx.font = `${spriteHeight}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sprite.emoji, spriteScreenX, CANVAS_HEIGHT / 2);
          }
        }
      });

      // 武器绘制
      const weaponFrame = gameStateRef.current.isShooting ? '🔫🔥' : '🔫';
      ctx.font = '110px Arial';
      ctx.textAlign = 'center';
      const recoil = gameStateRef.current.isShooting ? Math.random() * 15 : 0;
      ctx.fillText(weaponFrame, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20 - recoil);

      if (gameStateRef.current.isShooting) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [onUpdateHUD]);

  return (
    <div className="relative border-8 border-gray-800 rounded-lg overflow-hidden shadow-2xl bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto cursor-crosshair"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default GameView;
