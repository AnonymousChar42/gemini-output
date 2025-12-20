import React from 'react';
import { WEAPON_STATS } from '../constants';
import { WeaponType } from '../types';

interface ShopProps {
  gold: number;
  onBuy: (type: WeaponType) => void;
  onRemove: (index: number) => void;
  onUpgrade: (index: number) => void;
  selectedSlotIndex: number | null;
  slots: { weaponType: WeaponType | null; level: number }[];
}

const Shop: React.FC<ShopProps> = ({ gold, onBuy, selectedSlotIndex, slots, onRemove, onUpgrade }) => {
  const currentSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;
  const currentSlotHasWeapon = currentSlot?.weaponType != null;
  const currentWeaponConfig = currentSlot?.weaponType ? WEAPON_STATS[currentSlot.weaponType] : null;

  // Upgrade Logic
  const upgradeCost = currentWeaponConfig 
    ? Math.floor(currentWeaponConfig.cost * currentSlot!.level) 
    : 0;
  const canAffordUpgrade = gold >= upgradeCost;

  return (
    <div className="bg-slate-800 border-t-2 border-slate-600 p-4 h-48 w-full flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg z-20">
      
      <div className="flex-1 overflow-visible">
        <h3 className="text-yellow-400 font-bold mb-2">
            {selectedSlotIndex !== null 
                ? `Slot #${selectedSlotIndex + 1} Selected` 
                : "Select a Tower Slot ⬜ to equip"}
        </h3>
        
        {!currentSlotHasWeapon ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
                {Object.values(WEAPON_STATS).map((weapon) => {
                    const canAfford = gold >= weapon.cost;
                    return (
                        <button
                            key={weapon.type}
                            disabled={!canAfford || selectedSlotIndex === null}
                            onClick={() => onBuy(weapon.type)}
                            className={`
                                relative group flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[100px]
                                ${selectedSlotIndex === null ? 'opacity-50 cursor-not-allowed border-gray-600 bg-gray-700' : 
                                  canAfford 
                                    ? 'border-yellow-500 bg-slate-700 hover:bg-slate-600 active:scale-95 cursor-pointer' 
                                    : 'border-red-900 bg-slate-800 opacity-60 cursor-not-allowed'}
                            `}
                        >
                            <div className="text-2xl mb-1">{weapon.emoji}</div>
                            <div className="text-xs font-bold text-white">{weapon.name}</div>
                            <div className="text-xs text-yellow-300">💰 {weapon.cost}</div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-black text-white text-xs p-2 rounded z-50 pointer-events-none">
                                {weapon.description}
                                <div className="mt-1 text-gray-400">Dmg: {weapon.damage} | Rng: {weapon.range}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        ) : (
            <div className="flex items-center gap-6">
                 {/* Current Weapon Info */}
                 <div className="bg-slate-700 p-3 rounded-lg border border-slate-500 flex items-center gap-3">
                    <div className="text-4xl">{currentWeaponConfig?.emoji}</div>
                    <div>
                        <div className="font-bold text-lg">{currentWeaponConfig?.name}</div>
                        <div className="text-sm text-yellow-300">Level {currentSlot!.level}</div>
                        <div className="text-xs text-gray-300">Damage Multiplier: {1 + (currentSlot!.level - 1) * 0.5}x</div>
                    </div>
                 </div>

                 {/* Upgrade Button */}
                 <button
                    onClick={() => selectedSlotIndex !== null && onUpgrade(selectedSlotIndex)}
                    disabled={!canAffordUpgrade}
                    className={`
                        flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all w-32
                        ${canAffordUpgrade
                            ? 'bg-green-800 border-green-500 hover:bg-green-700 active:scale-95 text-white'
                            : 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed text-gray-400'
                        }
                    `}
                 >
                    <div className="font-bold">UPGRADE</div>
                    <div className="text-xl">⏫</div>
                    <div className="text-xs mt-1">Cost: 💰 {upgradeCost}</div>
                 </button>
            </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
         {currentSlotHasWeapon && (
            <button 
                onClick={() => selectedSlotIndex !== null && onRemove(selectedSlotIndex)}
                className="px-4 py-2 bg-red-900/80 hover:bg-red-700 text-white rounded border border-red-500 text-sm font-bold flex items-center gap-2"
            >
                <span>🗑️ Sell Weapon</span>
                <span className="text-xs opacity-75">(+50% gold)</span>
            </button>
         )}
         <div className="text-yellow-400 font-mono text-xl bg-black/30 px-4 py-2 rounded-lg border border-yellow-500/30">
            Gold: 💰 {Math.floor(gold)}
         </div>
      </div>

    </div>
  );
};

export default Shop;