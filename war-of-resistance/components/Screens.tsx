import React from 'react';
import { EnemyType, GameScreen, GameStats, LevelConfig, WeaponType } from '../types';
import { ENEMIES, LEVELS, WEAPONS } from '../constants';
import { Play, Book, Trophy, Shield, Crosshair, ArrowLeft, Star, AlertTriangle, User } from 'lucide-react';

// --- MAIN MENU ---
export const MainMenu: React.FC<{ 
  onStart: () => void, 
  onCompendium: () => void 
}> = ({ onStart, onCompendium }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover opacity-20"></div>
    <div className="z-10 text-center space-y-8 p-8 max-w-2xl bg-black/60 backdrop-blur-sm rounded-xl border border-zinc-700 shadow-2xl">
      <div className="space-y-2">
        <h1 className="text-6xl font-black tracking-widest text-red-600 drop-shadow-md">抗战射击</h1>
        <p className="text-xl text-zinc-300 font-serif tracking-widest border-t border-b border-zinc-600 py-2 inline-block">
          铭记历史 · 珍爱和平
        </p>
      </div>
      
      <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
        本游戏旨在通过互动形式还原抗日战争时期的艰苦卓绝。拿起武器，保卫家园，体验先烈们的英勇精神。
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-red-800 hover:bg-red-700 transition-all rounded text-xl font-bold flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Play fill="currentColor" /> 开始征程
        </button>
        
        <button 
          onClick={onCompendium}
          className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 transition-all rounded text-lg font-semibold flex items-center justify-center gap-3"
        >
          <Book /> 历史图鉴
        </button>
      </div>
    </div>
    
    <div className="absolute bottom-4 text-zinc-600 text-xs">
       v1.0.0 | 互动教育体验
    </div>
  </div>
);

// --- LEVEL & WEAPON SELECT ---
export const LevelSelect: React.FC<{
  onBack: () => void;
  onSelect: (level: LevelConfig, weapon: WeaponType) => void;
}> = ({ onBack, onSelect }) => {
  const [selectedLevel, setSelectedLevel] = React.useState<LevelConfig | null>(null);
  const [selectedWeapon, setSelectedWeapon] = React.useState<WeaponType>(WeaponType.PISTOL);

  return (
    <div className="w-full h-full bg-zinc-900 text-white p-8 flex flex-col overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full"><ArrowLeft /></button>
        <h2 className="text-3xl font-bold">作战部署</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left: Level Select */}
        <div className="space-y-4">
          <h3 className="text-xl text-red-500 font-bold border-l-4 border-red-500 pl-3">第一步：选择战场</h3>
          <div className="grid gap-4">
            {LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level)}
                className={`p-6 text-left rounded-lg border-2 transition-all hover:scale-[1.02] relative overflow-hidden group ${
                  selectedLevel?.id === level.id 
                  ? 'border-red-500 bg-red-900/20' 
                  : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'
                }`}
              >
                <div className={`absolute right-0 top-0 p-2 bg-black/50 text-xs font-mono rounded-bl-lg ${selectedLevel?.id === level.id ? 'text-red-400' : 'text-zinc-500'}`}>
                  难度: {Math.round(level.difficultyMultiplier * 100)}%
                </div>
                <h4 className="text-xl font-bold mb-2">{level.name}</h4>
                <p className="text-zinc-400 text-sm mb-4">{level.description}</p>
                <div className="flex gap-4 text-xs font-mono text-zinc-500">
                  <span className="flex items-center gap-1"><Shield size={12}/> {level.duration}秒</span>
                  <span className="flex items-center gap-1"><AlertTriangle size={12}/> 密集度: High</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Weapon Select & Start */}
        <div className="space-y-6 flex flex-col">
          <div>
            <h3 className="text-xl text-amber-500 font-bold border-l-4 border-amber-500 pl-3 mb-4">第二步：配备武器</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(WEAPONS).map(weapon => (
                <button
                  key={weapon.type}
                  onClick={() => setSelectedWeapon(weapon.type)}
                  className={`p-4 rounded border transition-all text-left ${
                    selectedWeapon === weapon.type
                    ? 'border-amber-500 bg-amber-900/20 text-white'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{weapon.name}</div>
                  <div className="text-[10px] space-y-1 opacity-70">
                    <div className="flex justify-between"><span>精度</span> <span className="text-amber-400">{weapon.accuracy * 100}%</span></div>
                    <div className="flex justify-between"><span>弹匣</span> <span>{weapon.magSize}发</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
            
          {/* Selected Weapon Detail */}
          <div className="bg-zinc-950 p-6 rounded border border-zinc-800 mt-auto">
             <h4 className="font-bold text-amber-500 mb-2">{WEAPONS[selectedWeapon].name}</h4>
             <p className="text-sm text-zinc-400 leading-relaxed">{WEAPONS[selectedWeapon].description}</p>
          </div>

          <button
            disabled={!selectedLevel}
            onClick={() => selectedLevel && onSelect(selectedLevel, selectedWeapon)}
            className="w-full py-5 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-black text-2xl tracking-widest rounded disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {selectedLevel ? '投入战斗' : '请先选择战场'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPENDIUM ---
export const Compendium: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = React.useState<'ENEMIES' | 'WEAPONS'>('ENEMIES');

  return (
    <div className="w-full h-full bg-zinc-900 text-white p-8 overflow-y-auto">
       <div className="max-w-4xl mx-auto">
         <div className="flex items-center justify-between mb-8 border-b border-zinc-700 pb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full"><ArrowLeft /></button>
              <h2 className="text-3xl font-bold font-serif">历史图鉴</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setTab('ENEMIES')}
                className={`px-4 py-2 rounded ${tab === 'ENEMIES' ? 'bg-red-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                敌军单位
              </button>
              <button 
                onClick={() => setTab('WEAPONS')}
                className={`px-4 py-2 rounded ${tab === 'WEAPONS' ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                我军装备
              </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tab === 'ENEMIES' ? (
               Object.values(ENEMIES).map(enemy => (
                 <div key={enemy.type} className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 flex gap-4">
                    <div className={`w-16 h-16 shrink-0 rounded ${enemy.color} shadow-inner flex items-center justify-center font-bold text-white/50`}>
                      {enemy.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{enemy.name}</h3>
                      <div className="flex gap-3 text-xs text-zinc-500 mb-3 font-mono">
                         <span className="bg-zinc-900 px-2 py-1 rounded">分值: {enemy.score}</span>
                         <span className="bg-zinc-900 px-2 py-1 rounded">移动: {enemy.duration}s</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{enemy.description}</p>
                    </div>
                 </div>
               ))
            ) : (
               Object.values(WEAPONS).map(weapon => (
                  <div key={weapon.type} className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-xl font-bold text-amber-500">{weapon.name}</h3>
                       <Crosshair size={20} className="text-zinc-600"/>
                    </div>
                    <p className="text-sm text-zinc-300 mb-4 h-10 line-clamp-2">{weapon.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded">
                       <div>射速: <span className="text-white">{weapon.rpm} RPM</span></div>
                       <div>精度: <span className="text-white">{weapon.accuracy * 100}%</span></div>
                       <div>弹容: <span className="text-white">{weapon.magSize}</span></div>
                       <div>换弹: <span className="text-white">{weapon.reloadTime}s</span></div>
                    </div>
                  </div>
               ))
            )}
         </div>
       </div>
    </div>
  );
};

// --- GAME OVER ---
export const GameOver: React.FC<{ stats: GameStats, onRestart: () => void, onMenu: () => void }> = ({ stats, onRestart, onMenu }) => {
  const isVictory = stats.outcome === 'VICTORY';
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className={`bg-zinc-900 border ${isVictory ? 'border-yellow-500' : 'border-red-800'} p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform animate-[fadeIn_0.5s_ease-out]`}>
        
        {isVictory ? (
            <div className="mb-6">
                 <h2 className="text-5xl font-black text-yellow-500 mb-2 tracking-widest">任务完成</h2>
                 <p className="text-zinc-300 font-serif">您成功坚守了阵地，击退了敌人的进攻！</p>
            </div>
        ) : (
            <div className="mb-6">
                 <h2 className="text-5xl font-black text-red-600 mb-2 tracking-widest">阵地失守</h2>
                 <p className="text-zinc-400 font-serif">敌人突破了防线... 誓与阵地共存亡！</p>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-zinc-800 p-4 rounded text-center">
              <div className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">总得分</div>
              <div className="text-3xl font-black text-white">{stats.score.toLocaleString()}</div>
           </div>
           <div className="bg-zinc-800 p-4 rounded text-center">
              <div className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">歼敌数</div>
              <div className="text-2xl font-bold text-white">{stats.enemiesHit}</div>
           </div>
           <div className="bg-zinc-800 p-4 rounded text-center">
              <div className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">剩余生命</div>
              <div className={`text-2xl font-bold ${stats.hpRemaining > 0 ? 'text-green-500' : 'text-red-500'}`}>{stats.hpRemaining}%</div>
           </div>
           <div className="bg-zinc-800 p-4 rounded text-center">
              <div className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">命中率</div>
              <div className="text-2xl font-bold text-white">{(stats.accuracy * 100).toFixed(1)}%</div>
           </div>
        </div>

        <div className="space-y-3">
           <button onClick={onRestart} className={`w-full py-3 ${isVictory ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-red-700 hover:bg-red-600'} text-white font-bold rounded transition-colors flex items-center justify-center gap-2`}>
             <RefreshCcw size={18} /> 再次挑战
           </button>
           <button onClick={onMenu} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded transition-colors">
             返回主菜单
           </button>
        </div>
      </div>
    </div>
  );
}

// Icon helper
const RefreshCcw = ({size, className}: {size?: number, className?: string}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);