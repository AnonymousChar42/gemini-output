import React from 'react';
import { TileType } from '../types';

interface MapRendererProps {
  map: number[][];
  tileSize: number;
  onTileClick: (x: number, y: number) => void;
  onTileHover?: (x: number, y: number) => void;
  selectedPos: {x: number, y: number} | null;
  selectedTowerPos?: {x: number, y: number};
}

export const MapRenderer: React.FC<MapRendererProps> = ({ map, tileSize, onTileClick, onTileHover, selectedPos, selectedTowerPos }) => {
  return (
    <div 
      className="absolute top-0 left-0 grid" 
      style={{
        gridTemplateColumns: `repeat(${map[0].length}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${map.length}, ${tileSize}px)`
      }}
      onMouseLeave={() => onTileHover?.(-1, -1)}
    >
      {map.map((row, y) => (
        row.map((cell, x) => {
          let bgColor = 'bg-gray-800'; // Grass/Empty
          let content = '';

          if (cell === TileType.PATH) bgColor = 'bg-amber-200/20 border-gray-800'; // Path
          if (cell === TileType.BASE) { bgColor = 'bg-blue-900/50'; content = '🏰'; }
          if (cell === TileType.SPAWN) { bgColor = 'bg-red-900/50'; content = '🏴‍☠️'; }
          if (cell === TileType.SCENERY) { bgColor = 'bg-gray-800'; content = '🌲'; }

          const isSelected = selectedPos?.x === x && selectedPos?.y === y;
          const isTowerSelected = selectedTowerPos?.x === x && selectedTowerPos?.y === y;
          
          return (
            <div 
              key={`${x}-${y}`}
              onClick={() => onTileClick(x, y)}
              onMouseEnter={() => onTileHover?.(x, y)}
              className={`
                ${bgColor} 
                border border-white/5 
                flex items-center justify-center text-2xl 
                cursor-pointer hover:brightness-110 transition-all duration-150
                relative
              `}
              style={{ width: tileSize, height: tileSize }}
            >
              {content}
              
              {cell === TileType.PATH && <div className="w-2 h-2 rounded-full bg-amber-200/30" />}

              {(isSelected || isTowerSelected) && (
                <div className="absolute inset-0 border-2 border-yellow-400 animate-pulse z-10 pointer-events-none" />
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};
