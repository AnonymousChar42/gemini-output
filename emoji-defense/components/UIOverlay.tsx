import React, { useState } from 'react';
import { Tower, TowerTypeDefinition } from '../types';
import { TOWER_TYPES } from '../constants';

interface UIOverlayProps {
  gold: number;
  lives: number;
  wave: number;
  totalWaves: number;
  waveEnemiesRemaining: number;
  waveEnemiesTotal: number;
  selectedTile: {x: number, y: number} | null;
  selectedTower: Tower | null;
  onBuild: (typeId: string) => void;
  onUpgrade: (upgradeId: string) => void;
  onSell: () => void;
  onDeselect: () => void;
  onExit: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gold, lives, wave, totalWaves, waveEnemiesRemaining, waveEnemiesTotal, 
  selectedTile, selectedTower, 
  onBuild, onUpgrade, onSell, onDeselect, onExit 
}) => {
  
  const [hoveredTowerDef, setHoveredTowerDef] = useState<TowerTypeDefinition | null>(null);

  // Available Towers for building (Tier 1s)
  const buildableTowers = Object.values(TOWER_TYPES).filter(t => t.id.includes('_1'));

  const handleBuildClick = (id: string) => {
    setHoveredTowerDef(null);
    onBuild(id);
  };

  const handleUpgradeClick = (id: string) => {
    setHoveredTowerDef(null);
    onUpgrade(id);
  };

  const handleDeselectClick = () => {
    setHoveredTowerDef(null);
    onDeselect();
  };

  // z-[1000] ensures UI sits above map entities
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-[1000]">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-gray-800/90 p-3 rounded-xl border-2 border-gray-600 shadow-xl backdrop-blur-sm pointer-events-auto flex gap-5 text-lg font-bold items-center">
            <div className="flex items-center text-yellow-400" title="Gold">
                <span className="text-2xl mr-2">💰</span> {Math.floor(gold)}
            </div>
            <div className="flex items-center text-red-400" title="Lives">
                <span className="text-2xl mr-2">❤️</span> {lives}
            </div>
            
            <div className="w-px h-8 bg-gray-600 mx-1"></div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col leading-none text-blue-400">
                  <span className="text-xs text-blue-200 uppercase tracking-widest">Wave</span>
                  <div className="text-lg">
                    {wave} <span className="text-sm text-gray-500">/ {totalWaves}</span>
                  </div>
              </div>
              
              <div className="flex flex-col leading-none text-purple-400">
                  <span className="text-xs text-purple-200 uppercase tracking-widest">Enemies</span>
                  <div className="text-lg">
                    {waveEnemiesRemaining} <span className="text-sm text-gray-500">/ {waveEnemiesTotal}</span>
                  </div>
              </div>
            </div>
        </div>
        
        <button 
            onClick={onExit}
            className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded font-bold shadow-lg transition-colors"
        >
            Quit
        </button>
      </div>

      {/* Stats Tooltip (Floating above bottom panel) */}
      {hoveredTowerDef && (
        <div className="pointer-events-none absolute bottom-44 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900/95 border-2 border-yellow-500 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-slide-up z-50">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{hoveredTowerDef.emoji}</span>
                <div>
                    <h4 className="font-bold text-white leading-none">{hoveredTowerDef.name}</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{hoveredTowerDef.type} DEFENSE</span>
                </div>
            </div>
            <p className="text-xs text-gray-300 mb-3 italic">"{hoveredTowerDef.description}"</p>
            <div className="grid grid-cols-3 gap-2 border-t border-gray-700 pt-2 text-center">
                {hoveredTowerDef.type === 'ECONOMY' ? (
                   <div className="col-span-3 flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase">Income</span>
                        <span className="text-sm font-bold text-yellow-400">💰 +{hoveredTowerDef.income}/s</span>
                   </div>
                ) : (
                    <>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase">Damage</span>
                            <span className="text-sm font-bold text-white">⚔️ {hoveredTowerDef.damage}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase">Range</span>
                            <span className="text-sm font-bold text-white">📏 {hoveredTowerDef.range}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase">Speed</span>
                            <span className="text-sm font-bold text-white">⏱️ {(1/hoveredTowerDef.cooldown).toFixed(1)}/s</span>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* Bottom Panel */}
      <div className="pointer-events-auto flex justify-center pb-4">
        
        {/* BUILD MENU - Refined with Grid */}
        {selectedTile && !selectedTower && (
            <div className="bg-gray-800/95 p-4 rounded-xl border-2 border-gray-600 shadow-2xl backdrop-blur flex flex-col items-center animate-slide-up">
                <div className="flex justify-between w-full mb-3 border-b border-gray-700 pb-2 items-center">
                    <h3 className="font-bold text-gray-200 text-sm uppercase tracking-wide px-1">Construct Defense</h3>
                    <button onClick={handleDeselectClick} className="text-gray-400 hover:text-white p-1">✕</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {buildableTowers.map(t => (
                        <TowerCard 
                            key={t.id} 
                            def={t} 
                            canAfford={gold >= t.cost} 
                            onClick={() => handleBuildClick(t.id)} 
                            onMouseEnter={() => setHoveredTowerDef(t)}
                            onMouseLeave={() => setHoveredTowerDef(null)}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* UPGRADE MENU - Refined Centered Layout */}
        {selectedTower && (
            <div className="bg-gray-800/95 p-4 rounded-xl border-2 border-gray-600 shadow-2xl backdrop-blur flex flex-col items-center animate-slide-up max-w-sm">
                <div className="flex justify-between w-full mb-3 border-b border-gray-700 pb-2 items-center">
                    <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                        <span className="text-xl">{TOWER_TYPES[selectedTower.typeId].emoji}</span>
                        <h3 className="font-bold text-gray-200 text-xs truncate max-w-[120px]">
                            {TOWER_TYPES[selectedTower.typeId].name}
                        </h3>
                    </div>
                    <button onClick={handleDeselectClick} className="text-gray-400 hover:text-white p-1 ml-4">✕</button>
                </div>
                
                <div className="flex gap-4 items-center justify-center py-1 px-2">
                    {/* Linear Upgrade Path */}
                    <div className="flex items-center">
                        {TOWER_TYPES[selectedTower.typeId].upgrades?.map(upgradeId => (
                            <TowerCard 
                                key={upgradeId} 
                                def={TOWER_TYPES[upgradeId]} 
                                canAfford={gold >= TOWER_TYPES[upgradeId].cost} 
                                onClick={() => handleUpgradeClick(upgradeId)}
                                onMouseEnter={() => setHoveredTowerDef(TOWER_TYPES[upgradeId])}
                                onMouseLeave={() => setHoveredTowerDef(null)}
                                label="Upgrade"
                                highlight
                            />
                        ))}
                        {!TOWER_TYPES[selectedTower.typeId].upgrades && (
                            <div className="bg-gray-700/50 rounded-lg p-2 text-gray-400 text-[10px] flex flex-col items-center justify-center w-24 h-24 border border-dashed border-gray-600">
                                <span className="text-xl mb-1">⭐</span>
                                <span className="font-black">MAX TIER</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-16 w-px bg-gray-700 mx-1"></div>

                    {/* Sell Action */}
                    <button 
                        onClick={() => { setHoveredTowerDef(null); onSell(); }}
                        className="flex flex-col items-center justify-center p-2 h-24 rounded-lg hover:bg-red-900/30 text-red-400 transition-all w-20 border border-transparent hover:border-red-500/20 group"
                    >
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💸</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sell</span>
                        <span className="text-xs font-black text-white">+{Math.floor(TOWER_TYPES[selectedTower.typeId].cost * 0.5)}</span>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

interface TowerCardProps {
    def: TowerTypeDefinition;
    canAfford: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    label?: string;
    highlight?: boolean;
}

const TowerCard: React.FC<TowerCardProps> = ({ def, canAfford, onClick, onMouseEnter, onMouseLeave, label, highlight }) => (
    <button 
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={!canAfford}
        className={`
            flex flex-col items-center justify-center p-2 rounded-xl transition-all transform active:scale-95 relative
            ${canAfford 
                ? `${highlight ? 'bg-yellow-600/20 border-yellow-500' : 'bg-gray-700 border-gray-600'} hover:brightness-125 shadow-lg border-2` 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-40 border-2 border-gray-700'}
            w-24 h-24 overflow-hidden
        `}
    >
        <div className="text-3xl mb-1 filter drop-shadow-md">{def.emoji}</div>
        <div className="text-[10px] font-black text-center leading-none mb-1.5 truncate w-full uppercase tracking-tighter text-white px-1">{def.name}</div>
        <div className={`text-xs font-black px-2 py-0.5 rounded-full ${canAfford ? 'bg-yellow-500 text-gray-900' : 'bg-red-900/50 text-red-400'}`}>
            {def.cost}
        </div>
        {label && (
            <div className="absolute top-0 right-0 bg-green-500 text-[9px] font-black px-1.5 py-0.5 rounded-bl shadow-sm text-white">
                {label}
            </div>
        )}
    </button>
);