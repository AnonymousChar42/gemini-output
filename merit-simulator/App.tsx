
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UPGRADES, REALM_MILESTONES } from './constants';
import { PlayerState, Realm, FloatingText, Upgrade } from './types';
import { 
  Zap, 
  Hand, 
  Award, 
  Settings, 
  ShieldAlert, 
  TrendingUp,
  Wind
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<PlayerState>({
    merit: 0,
    totalMeritEver: 0,
    clickValue: 1,
    ownedUpgrades: {},
    lastUpdate: Date.now(),
    multiplier: 1
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [jesusVisible, setJesusVisible] = useState(false);
  const [jesusPos, setJesusPos] = useState({ x: 0, y: 0 });
  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound effects logic
  const playClickSound = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  // Calculate stats
  const calculateDps = useCallback(() => {
    return UPGRADES.reduce((total, up) => {
      const count = state.ownedUpgrades[up.id] || 0;
      return total + count * up.baseDps;
    }, 0) * state.multiplier;
  }, [state.ownedUpgrades, state.multiplier]);

  const currentRealm = REALM_MILESTONES.slice().reverse().find(m => state.totalMeritEver >= m.merit)?.realm || Realm.Mortal;

  // Game Loop
  useEffect(() => {
    const timer = setInterval(() => {
      const dps = calculateDps();
      if (dps > 0) {
        setState(prev => ({
          ...prev,
          merit: prev.merit + dps / 10,
          totalMeritEver: prev.totalMeritEver + dps / 10
        }));
      }

      // Random Jesus appearance
      if (!jesusVisible && Math.random() < 0.005) {
        setJesusPos({
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        setJesusVisible(true);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [calculateDps, jesusVisible]);

  // Handle Merit Drain from Jesus
  useEffect(() => {
    if (!jesusVisible) return;
    const drainTimer = setInterval(() => {
      setState(prev => {
        const drain = Math.max(1, prev.merit * 0.005);
        return {
          ...prev,
          merit: Math.max(0, prev.merit - drain)
        };
      });
    }, 1000);

    const timeout = setTimeout(() => {
      setJesusVisible(false);
    }, 10000);

    return () => {
      clearInterval(drainTimer);
      clearTimeout(timeout);
    };
  }, [jesusVisible]);

  const addFloatingText = (x: number, y: number, text: string, color: string = 'text-yellow-400') => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);
  };

  const handleManualClick = (e: React.MouseEvent) => {
    playClickSound();
    const val = state.clickValue;
    setState(prev => ({
      ...prev,
      merit: prev.merit + val,
      totalMeritEver: prev.totalMeritEver + val
    }));
    addFloatingText(e.clientX, e.clientY, `功德 +${val}`);
  };

  const buyUpgrade = (upgrade: Upgrade) => {
    const count = state.ownedUpgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, count));
    if (state.merit >= cost) {
      setState(prev => ({
        ...prev,
        merit: prev.merit - cost,
        ownedUpgrades: {
          ...prev.ownedUpgrades,
          [upgrade.id]: count + 1
        }
      }));
    }
  };

  const handleJesusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJesusVisible(false);
    const reward = Math.floor(state.totalMeritEver * 0.05) + 100;
    setState(prev => ({
      ...prev,
      merit: prev.merit + reward,
      totalMeritEver: prev.totalMeritEver + reward
    }));
    addFloatingText(e.clientX, e.clientY, `受洗！+${reward}`, 'text-blue-400');
  };

  const triggerRebirth = () => {
    const bonus = Math.floor(Math.sqrt(state.totalMeritEver / 1000));
    setState(prev => ({
      ...prev,
      merit: 0,
      ownedUpgrades: {},
      multiplier: prev.multiplier + (bonus * 0.1),
      clickValue: 1 + bonus
    }));
    setShowRebirthModal(false);
    alert(`悟道成功！获得${bonus}倍加成，修行重启。`);
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-[#0c0c0c] text-white overflow-hidden">
      {/* Background Zen Element */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-20">
        <div className="w-[600px] h-[600px] border-4 border-yellow-600 rounded-full lotus-pulse"></div>
        <div className="absolute w-[400px] h-[400px] border-2 border-yellow-700 rounded-full lotus-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Top Bar Stats */}
        <div className="absolute top-10 flex flex-col items-center">
          <div className="text-sm uppercase tracking-widest text-yellow-500 mb-1 cyber-font glow-gold">当前功德</div>
          <div className="text-6xl font-black cyber-font glow-gold text-yellow-400">
            {Math.floor(state.merit).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2 flex items-center gap-2">
            <TrendingUp size={16} />
            每秒收益: {calculateDps().toFixed(1)}
          </div>
        </div>

        {/* Center Wood Fish */}
        <div 
          onClick={handleManualClick}
          className="relative group cursor-pointer transform active:scale-95 transition-all duration-75 mt-20"
        >
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="w-64 h-64 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-800 shadow-2xl relative">
            <div className="text-7xl">📿</div>
            <div className="absolute -bottom-10 cyber-font text-yellow-500/50 text-xl font-bold tracking-[0.2em]">木 鱼</div>
          </div>
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full border border-yellow-500/20 scale-125 animate-ping pointer-events-none"></div>
        </div>

        {/* Realm Indicator */}
        <div className="mt-24 px-6 py-2 bg-zinc-900/50 backdrop-blur-md rounded-full border border-zinc-800 flex items-center gap-3">
          <Award className="text-yellow-500" />
          <span className="text-sm font-bold tracking-widest">{currentRealm}</span>
          <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (state.totalMeritEver / REALM_MILESTONES.find(m => m.realm === currentRealm)?.merit! || 1) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upgrades Sidebar */}
      <div className="w-full md:w-96 bg-zinc-900/80 backdrop-blur-xl border-l border-zinc-800 p-6 flex flex-col z-20 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 cyber-font flex items-center gap-2 text-yellow-500">
          <Zap size={20} />
          赛博法器商店
        </h2>
        
        <div className="space-y-4">
          {UPGRADES.map(up => {
            const count = state.ownedUpgrades[up.id] || 0;
            const cost = Math.floor(up.baseCost * Math.pow(1.15, count));
            const canAfford = state.merit >= cost;

            return (
              <button
                key={up.id}
                onClick={() => buyUpgrade(up)}
                disabled={!canAfford}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  canAfford 
                    ? 'bg-zinc-800 border-zinc-700 hover:border-yellow-500/50 hover:bg-zinc-750' 
                    : 'bg-zinc-900/50 border-transparent opacity-50 grayscale'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{up.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{up.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{up.description}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 bg-zinc-700 rounded text-yellow-400">
                    Lv.{count}
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                    <Wind size={12} />
                    +{ (up.baseDps * state.multiplier).toFixed(1) }/s
                  </div>
                  <div className={`text-sm font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
                    {cost.toLocaleString()} 功德
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Rebirth Section */}
        <div className="mt-auto pt-8">
          <button 
            onClick={() => setShowRebirthModal(true)}
            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Settings size={20} />
            觉悟重生
          </button>
        </div>
      </div>

      {/* Floating Elements (Jesus) */}
      {jesusVisible && (
        <div 
          onClick={handleJesusClick}
          className="absolute z-50 cursor-pointer transition-all duration-300 transform hover:scale-110"
          style={{ left: `${jesusPos.x}%`, top: `${jesusPos.y}%` }}
        >
          <div className="relative group">
            <div className="absolute -inset-4 bg-red-600/20 blur-xl animate-pulse rounded-full"></div>
            <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">✝️</div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap animate-bounce">
              耶稣的考验：功德流失中!
            </div>
          </div>
        </div>
      )}

      {/* Floating Texts */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id}
          className={`absolute z-40 pointer-events-none float-text font-bold ${ft.color}`}
          style={{ left: ft.x, top: ft.y }}
        >
          {ft.text}
        </div>
      ))}

      {/* Rebirth Modal */}
      {showRebirthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-zinc-900 border border-yellow-500/50 max-w-md w-full rounded-2xl p-8 text-center">
            <ShieldAlert size={48} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-black cyber-font mb-4 uppercase">准备觉悟了吗？</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              重置当前所有功德与法器。你将获得基于总积累功德的永久增益。
              <br />
              <span className="text-yellow-500 font-bold block mt-2">
                预计加成: +{Math.floor(Math.sqrt(state.totalMeritEver / 1000))}x 基础收益
              </span>
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRebirthModal(false)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                继续修行
              </button>
              <button 
                onClick={triggerRebirth}
                className="flex-1 py-3 bg-yellow-600 rounded-xl font-bold hover:bg-yellow-500 transition-colors"
              >
                立地成佛
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Mobile Controls Overlay */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-zinc-800 text-xs text-yellow-500 font-bold">
          DPS: {calculateDps().toFixed(0)}
        </div>
      </div>
    </div>
  );
};

export default App;
