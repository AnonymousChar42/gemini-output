import React, { useState, useEffect } from 'react';
import { ScreensaverType } from './types';
import Mystify from './components/screensavers/Mystify';
import Bezier from './components/screensavers/Bezier';
import DVD from './components/screensavers/DVD';
import Maze3D from './components/screensavers/Maze3D';
import Pipes3D from './components/screensavers/Pipes3D';
import FlowerBox from './components/screensavers/FlowerBox';
import { Monitor, Square, Activity, Box, Disc, Grid } from 'lucide-react';

const App: React.FC = () => {
  const [activeSaver, setActiveSaver] = useState<ScreensaverType | null>(ScreensaverType.MYSTIFY);
  const [menuOpen, setMenuOpen] = useState(true);

  // Hide menu on inactivity (simple simulation)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const reset = () => {
      setMenuOpen(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setMenuOpen(false), 3000);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    return () => {
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      clearTimeout(timeout);
    };
  }, []);

  const renderSaver = () => {
    switch (activeSaver) {
      case ScreensaverType.MYSTIFY: return <Mystify />;
      case ScreensaverType.BEZIER: return <Bezier />;
      case ScreensaverType.MAZE_3D: return <Maze3D />;
      case ScreensaverType.PIPES_3D: return <Pipes3D />;
      case ScreensaverType.FLOWERBOX_3D: return <FlowerBox />;
      case ScreensaverType.DVD: return <DVD />;
      default: return <div className="flex items-center justify-center h-full text-white">Select a Screensaver</div>;
    }
  };

  const menuItems = [
    { type: ScreensaverType.MYSTIFY, icon: <Activity size={18} />, label: 'Mystify' },
    { type: ScreensaverType.BEZIER, icon: <Activity size={18} className="rotate-90" />, label: 'Bezier' },
    { type: ScreensaverType.MAZE_3D, icon: <Grid size={18} />, label: '3D Maze' },
    { type: ScreensaverType.PIPES_3D, icon: <Square size={18} />, label: '3D Pipes' },
    { type: ScreensaverType.FLOWERBOX_3D, icon: <Box size={18} />, label: '3D FlowerBox' },
    { type: ScreensaverType.DVD, icon: <Disc size={18} />, label: 'DVD' },
  ];

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* Screensaver Layer */}
      <div className="absolute inset-0 z-0">
        {renderSaver()}
      </div>

      {/* OS UI Overlay */}
      <div 
        className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-md border border-gray-700 text-gray-200 p-2 rounded-2xl shadow-2xl transition-all duration-500 z-10 flex gap-2 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
      >
        <div className="flex items-center px-4 py-2 border-r border-gray-700">
           <Monitor className="text-teal-400 mr-2" />
           <span className="font-bold tracking-wide text-sm hidden sm:block">Display Properties</span>
        </div>
        
        <div className="flex items-center gap-1 p-1">
          {menuItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveSaver(item.type)}
              className={`flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all duration-200 hover:bg-white/10 ${activeSaver === item.type ? 'bg-white/20 text-teal-300 ring-1 ring-teal-500/50' : 'text-gray-400'}`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Intro Hint */}
      {!menuOpen && (
        <div className="absolute top-4 right-4 text-white/20 text-xs pointer-events-none animate-pulse">
          Move mouse to show controls
        </div>
      )}
    </div>
  );
};

export default App;