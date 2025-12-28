import React, { useState } from 'react';
import { CONFIG } from '../constants';
import { ResourceMap, UpgradeMap, BuildingConfig, UpgradeConfig, BuildingLevelMap } from '../types';
import IconImage from './IconImage';

interface Props {
  merit: number;
  ownedBuildings: ResourceMap;
  ownedUpgrades: UpgradeMap;
  buildingLevels: BuildingLevelMap;
  onBuyBuilding: (id: string) => void;
  onBuyUpgrade: (id: string) => void;
  onBuyBuildingUpgrade: (id: string) => void;
  calculateCost: (basePrice: number, count: number) => number;
  calculateUpgradeCost: (baseCost: number, level: number) => number;
}

const StorePanel: React.FC<Props> = ({ 
  merit, 
  ownedBuildings, 
  ownedUpgrades, 
  buildingLevels,
  onBuyBuilding, 
  onBuyUpgrade,
  onBuyBuildingUpgrade,
  calculateCost,
  calculateUpgradeCost
}) => {
  // We use a fixed-position tooltip to avoid z-index/overflow issues in the scrollable sidebar
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'building' | 'upgrade' | 'building_upgrade';
    data: BuildingConfig | UpgradeConfig;
    count?: number;
    level?: number;
    currentCost: number;
  } | null>(null);

  const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(2) + 'm';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return Math.floor(num).toString();
  };

  return (
    <>
      {/* Fixed Tooltip Panel - Renders outside the sidebar flow */}
      {hoveredItem && (
        <div className="fixed top-24 right-[25rem] w-72 bg-slate-900 border border-amber-500/50 p-4 rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-right-4 duration-200 hidden lg:block">
           <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
             <h4 className="font-bold text-amber-400 text-lg">
                {hoveredItem.type === 'building_upgrade' ? `Upgrade: ${hoveredItem.data.name}` : hoveredItem.data.name}
             </h4>
             {(hoveredItem.type === 'building' || hoveredItem.type === 'building_upgrade') && (
                 <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                    Lv.{hoveredItem.level} {hoveredItem.type === 'building_upgrade' ? '→ ' + ((hoveredItem.level || 0) + 1) : ''}
                 </span>
             )}
           </div>
           
           <p className="text-sm text-slate-300 italic mb-3 border-l-2 border-slate-600 pl-3 leading-relaxed">
             {(hoveredItem.data as any).flavorText || hoveredItem.data.description}
           </p>

           <div className="space-y-1 font-mono text-xs">
              {hoveredItem.type === 'building' && (
                <>
                  <div className="flex justify-between text-slate-400">
                     <span>Base Prod:</span>
                     <span className="text-cyan-400">+{(hoveredItem.data as BuildingConfig).baseProduction * Math.pow(2, (hoveredItem.level || 1) - 1)} MPS</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                     <span>Total Prod:</span>
                     <span className="text-cyan-400">
                        +{((hoveredItem.data as BuildingConfig).baseProduction * Math.pow(2, (hoveredItem.level || 1) - 1) * (hoveredItem.count || 0)).toFixed(1)} MPS
                     </span>
                  </div>
                </>
              )}
              
              {hoveredItem.type === 'building_upgrade' && (
                 <div className="text-purple-300 space-y-2">
                    <div className="font-bold border-b border-slate-700 pb-1">EFFECT:</div>
                    <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="text-green-400">x2.0</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">Requires {5 * (hoveredItem.level || 1)} owned units.</div>
                 </div>
              )}

              {hoveredItem.type === 'upgrade' && (
                 <div className="text-purple-300">
                    Effect: {(hoveredItem.data as UpgradeConfig).description}
                 </div>
              )}
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-700">
                 <span className="text-slate-400">Cost:</span>
                 <span className={`font-bold text-base ${merit >= hoveredItem.currentCost ? 'text-green-400' : 'text-red-400'}`}>
                    🪙 {formatNumber(hoveredItem.currentCost)}
                 </span>
              </div>
           </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-4 h-full bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto custom-scrollbar">
        
        {/* Upgrades Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-purple-400 mb-2 font-cyber flex items-center gap-2">
              <span>⏫</span> 模组升级 / UPGRADES
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {CONFIG.clickUpgrades.map((u) => {
              if (ownedUpgrades[u.id]) return null;
              const canAfford = merit >= u.cost;
              
              return (
                <button
                  key={u.id}
                  onClick={() => onBuyUpgrade(u.id)}
                  onMouseEnter={() => setHoveredItem({ type: 'upgrade', data: u, currentCost: u.cost })}
                  onMouseLeave={() => setHoveredItem(null)}
                  disabled={!canAfford}
                  className={`aspect-square relative rounded-lg border-2 flex items-center justify-center text-2xl transition-all
                    ${canAfford 
                      ? 'border-purple-500 bg-purple-900/20 hover:bg-purple-900/40 cursor-pointer' 
                      : 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                >
                  {u.icon}
                </button>
              );
            })}
          </div>
          {CONFIG.clickUpgrades.every(u => ownedUpgrades[u.id]) && (
              <div className="text-xs text-slate-500 text-center py-2">所有升级已安装 / All Upgrades Installed</div>
          )}
        </div>

        {/* Buildings Section */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-amber-500 mb-2 font-cyber flex items-center gap-2">
              <span>🏭</span> 功德设施 / DEVICES
          </h2>
          <div className="flex flex-col gap-3">
            {CONFIG.buildings.map((b) => {
              const count = ownedBuildings[b.id] || 0;
              const level = buildingLevels[b.id] || 1;
              const currentCost = calculateCost(b.baseCost, count);
              const canAfford = merit >= currentCost;
              
              const nextUpgradeLevel = level + 1;
              const upgradeUnlockCount = level * 5;
              const canUnlockUpgrade = count >= upgradeUnlockCount;
              const upgradeCost = calculateUpgradeCost(b.baseUpgradeCost, level);
              const canAffordUpgrade = merit >= upgradeCost;

              return (
                <div key={b.id} className="relative flex items-stretch rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
                    {/* Main Building Button */}
                    <button
                        onClick={() => onBuyBuilding(b.id)}
                        onMouseEnter={() => setHoveredItem({ type: 'building', data: b, count, level, currentCost })}
                        onMouseLeave={() => setHoveredItem(null)}
                        disabled={!canAfford}
                        className={`flex-1 flex items-center p-3 text-left transition-all
                        ${canAfford 
                            ? 'hover:bg-slate-750' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 flex-shrink-0 bg-slate-900 rounded-lg flex items-center justify-center text-2xl mr-3 border border-slate-700">
                            <IconImage src={b.imagePath} emojis={b.emojis} alt={b.name} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-slate-200 truncate text-sm">{b.name}</h3>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-amber-500 bg-slate-900 px-1 rounded">Lv.{level}</span>
                                    <span className="text-xl font-cyber text-slate-600 font-bold ml-1">{count}</span>
                                </div>
                            </div>
                            <div className={`text-sm font-mono ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                🪙 {formatNumber(currentCost)}
                            </div>
                            <div className="text-xs text-slate-500">
                                +{(b.baseProduction * Math.pow(2, level - 1)).toFixed(1)} MPS
                            </div>
                        </div>
                    </button>
                    
                    {/* Upgrade Button Action (Visible if unlocked or partially unlocked) */}
                    {canUnlockUpgrade && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onBuyBuildingUpgrade(b.id);
                            }}
                            disabled={!canAffordUpgrade}
                            onMouseEnter={() => setHoveredItem({ type: 'building_upgrade', data: b, count, level, currentCost: upgradeCost })}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`w-12 border-l border-slate-700 flex flex-col items-center justify-center gap-1 transition-all z-10
                                ${canAffordUpgrade 
                                    ? 'bg-purple-900/30 hover:bg-purple-600 text-purple-200' 
                                    : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'}
                            `}
                        >
                            <span className="text-lg">⬆️</span>
                            <span className="text-[10px] font-bold">UP</span>
                        </button>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StorePanel;