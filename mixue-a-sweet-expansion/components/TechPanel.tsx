import React from 'react';
import { Tech, TechCategory } from '../types';
import { Activity, Shield, Zap } from 'lucide-react';

interface TechPanelProps {
  techs: Record<string, Tech>;
  money: number;
  onPurchase: (id: string) => void;
}

export const TechPanel: React.FC<TechPanelProps> = ({ techs, money, onPurchase }) => {
  const categories = [
    { id: TechCategory.TRANSMISSION, name: '传播途径', icon: <Zap className="w-4 h-4" /> },
    { id: TechCategory.ABILITY, name: '品牌特性', icon: <Activity className="w-4 h-4" /> },
    { id: TechCategory.RESISTANCE, name: '市场抗性', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 h-full overflow-y-auto flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="text-red-500">⛄</span> 品牌进化
        <span className="ml-auto text-yellow-400 text-sm">创意点: {money}</span>
      </h2>
      
      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.id}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              {cat.icon} {cat.name}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(techs)
                .filter((t: Tech) => t.category === cat.id)
                .map((tech: Tech) => {
                  const parentPurchased = !tech.parentId || techs[tech.parentId].purchased;
                  const canBuy = !tech.purchased && money >= tech.cost && parentPurchased;
                  
                  return (
                    <button
                      key={tech.id}
                      onClick={() => onPurchase(tech.id)}
                      disabled={!canBuy && !tech.purchased}
                      className={`
                        text-left p-3 rounded border transition-all duration-200 relative overflow-hidden group
                        ${tech.purchased 
                          ? 'bg-red-900/30 border-red-800 text-red-100 opacity-70' 
                          : canBuy 
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 text-white cursor-pointer' 
                            : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{tech.name}</span>
                        {!tech.purchased && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${money >= tech.cost ? 'bg-yellow-600 text-white' : 'bg-gray-600'}`}>
                            {tech.cost}
                          </span>
                        )}
                        {tech.purchased && <span className="text-xs text-green-400">已获得</span>}
                      </div>
                      <p className="text-xs opacity-80 line-clamp-2">{tech.description}</p>
                      
                      {!parentPurchased && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-gray-400 font-mono">
                          需前置科技
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};