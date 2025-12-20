import React from 'react';
import { createPortal } from 'react-dom';
import { Enemy, Projectile, Tower, Particle, TowerTypeDefinition } from '../types';
import { ENEMY_TYPES, TOWER_TYPES } from '../constants';

interface EntityLayerProps {
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  particles: Particle[];
  tileSize: number;
  selectedTowerId: string | null;
  hoveredTowerId: string | null;
  mapRef: React.RefObject<HTMLDivElement | null>;
}

export const EntityLayer: React.FC<EntityLayerProps> = ({ enemies, towers, projectiles, particles, tileSize, selectedTowerId, hoveredTowerId, mapRef }) => {
  
  // Logic to determine where to render the portal tooltip
  const renderTooltip = () => {
    if (!hoveredTowerId || selectedTowerId === hoveredTowerId || !mapRef.current) return null;
    
    const tower = towers.find(t => t.id === hoveredTowerId);
    if (!tower) return null;

    const def = TOWER_TYPES[tower.typeId];
    const mapRect = mapRef.current.getBoundingClientRect();
    
    // Position tooltip to the right of the tower in screen coordinates
    const left = mapRect.left + (tower.x + 1) * tileSize + 8; // 8px gap
    const top = mapRect.top + tower.y * tileSize;

    // Portal to body
    return createPortal(
        <div 
            className="fixed z-[9999] bg-gray-900/95 border border-gray-600 rounded p-2 shadow-2xl backdrop-blur-md pointer-events-none min-w-[120px]"
            style={{ left: left, top: top }}
        >
             <div className="text-xs font-bold text-yellow-400 mb-1 whitespace-nowrap">{def.name}</div>
             <div className="flex flex-col gap-1 text-[10px] whitespace-nowrap">
                {def.type === 'ECONOMY' ? (
                    <span title="Income">💰 +{def.income}/s</span>
                ) : (
                    <>
                        <span title="Damage">⚔️ {def.damage} Dmg</span>
                        <span title="Range">📏 {def.range} Rng</span>
                        <span title="Speed">⏱️ {(1/def.cooldown).toFixed(1)}/s</span>
                    </>
                )}
             </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Towers */}
      {towers.map(tower => {
         const def = TOWER_TYPES[tower.typeId];
         const isSelected = selectedTowerId === tower.id;
         const isHovered = hoveredTowerId === tower.id;
         
         // Base size scaling for POOP tower
         let poopScale = 1.0;
         if (tower.typeId === 'POOP_2') poopScale = 1.5;
         if (tower.typeId === 'POOP_3') poopScale = 2.0;

         const scale = (1 + (tower.firePulse * 0.4)) * poopScale; 
         const recoilY = -tower.firePulse * 10; 
         
         // Z-index: Selected/Hovered still higher than others inside container for range circle visibility
         const zIndex = isHovered || isSelected ? 50 : 10;

         return (
            <div
                key={tower.id}
                className="absolute flex items-center justify-center"
                style={{
                    transform: `translate3d(${tower.x * tileSize}px, ${tower.y * tileSize + recoilY}px, 0) scale(${scale})`,
                    width: tileSize,
                    height: tileSize,
                    zIndex: zIndex,
                    transition: 'transform 0.05s ease-out'
                }}
            >
                <div className={`text-4xl filter drop-shadow-lg ${isSelected ? 'brightness-125' : ''} ${isHovered ? 'brightness-110' : ''}`}>
                    {def.emoji}
                </div>
                
                {/* Range Circle - Keeps logic here inside map relative coordinates */}
                {(isSelected || isHovered) && def.range > 0 && (
                    <div 
                        className="absolute rounded-full border-2 border-dashed border-white/30 bg-white/5 pointer-events-none"
                        style={{
                            width: (def.range * 2 + 1) * tileSize,
                            height: (def.range * 2 + 1) * tileSize,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: -1 
                        }}
                    />
                )}
            </div>
         );
      })}

      {/* Tooltip Portal */}
      {renderTooltip()}

      {/* Enemies */}
      {enemies.map(enemy => {
        const typeDef = ENEMY_TYPES[enemy.typeId];
        const stateIndex = Math.max(0, Math.min(typeDef.states.length - 1, Math.floor((enemy.hp / enemy.maxHp) * typeDef.states.length)));
        const face = typeDef.states[stateIndex] || typeDef.states[0];
        
        const hitScale = 1 + (enemy.lastHitTime * 0.15);
        const shakeX = enemy.lastHitTime > 0 ? (Math.random() - 0.5) * 4 : 0;

        return (
          <div
            key={enemy.id}
            className="absolute flex flex-col items-center justify-center"
            style={{
              transform: `translate3d(${enemy.x * tileSize + shakeX}px, ${enemy.y * tileSize}px, 0) scale(${hitScale})`,
              width: tileSize,
              height: tileSize,
              zIndex: 20
            }}
          >
            <div className="w-8 h-1 bg-gray-900/80 rounded mb-1 overflow-hidden border border-white/10">
                <div 
                    className={`h-full transition-all duration-100 ${enemy.hp / enemy.maxHp < 0.3 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
            </div>
            
            <div className={`whitespace-nowrap text-sm font-bold ${typeDef.color} drop-shadow-md bg-gray-900/60 px-1.5 py-0.5 rounded-full border border-white/10`}>
                {face}
            </div>

            {enemy.frozenFactor < 1 && (
                <div className="absolute -top-1 -right-1 text-xs drop-shadow-sm">❄️</div>
            )}
          </div>
        );
      })}

      {/* Projectiles */}
      {projectiles.map(proj => (
          <div
            key={proj.id}
            className="absolute flex items-center justify-center"
            style={{
                transform: `translate3d(${proj.x * tileSize}px, ${proj.y * tileSize}px, 0)`,
                width: tileSize,
                height: tileSize,
                zIndex: 30
            }}
          >
            <span className="text-xl filter drop-shadow-sm">{proj.emoji}</span>
          </div>
      ))}

      {/* Particles */}
      {particles.map(p => (
          <div
            key={p.id}
            className="absolute flex items-center justify-center"
            style={{
                transform: `translate3d(${p.x * tileSize}px, ${p.y * tileSize}px, 0) scale(${p.scale * p.life})`,
                opacity: p.life,
                width: tileSize / 2,
                height: tileSize / 2,
                zIndex: 40
            }}
          >
            <span className="text-lg">{p.emoji}</span>
          </div>
      ))}
    </div>
  );
};