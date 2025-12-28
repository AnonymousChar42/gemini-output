import React from 'react';
import { CONFIG } from '../constants';
import { ResourceMap } from '../types';
import IconImage from './IconImage';

interface Props {
  ownedBuildings: ResourceMap;
}

const BuildingVisualizer: React.FC<Props> = ({ ownedBuildings }) => {
  return (
    <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold mb-4 text-amber-500 font-cyber border-b border-slate-600 pb-2">
            设备阵列 / DEVICE ARRAY
        </h2>
      <div className="space-y-6">
        {CONFIG.buildings.map((b) => {
          const count = ownedBuildings[b.id] || 0;
          if (count === 0) return null;

          return (
            <div key={b.id} className="bg-slate-900/50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-cyan-400 text-sm font-bold">{b.name} <span className="text-slate-500 text-xs ml-2">x{count}</span></h3>
                 <span className="text-amber-600/50 text-xs font-mono">ID: {b.id.toUpperCase()}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(count, 50) }).map((_, i) => (
                  <div key={i} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border border-slate-700/50 hover:border-amber-500/50 transition-colors" title={b.name}>
                    <IconImage 
                        src={b.imagePath} 
                        emojis={b.emojis} 
                        alt={b.name} 
                        seed={i} 
                        className="text-lg w-6 h-6 object-contain"
                    />
                  </div>
                ))}
                {count > 50 && (
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded border border-slate-700 text-xs text-slate-400">
                    +{count - 50}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {Object.values(ownedBuildings).reduce((a: number, b: number) => a + b, 0) === 0 && (
            <div className="text-slate-500 text-center mt-10 italic">
                暂无自动化功德设备...
                <br/>
                No automated merit devices installed...
            </div>
        )}
      </div>
    </div>
  );
};

export default BuildingVisualizer;