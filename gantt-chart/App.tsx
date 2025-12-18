
import React, { useState, useMemo } from 'react';
import Gantt from './components/Gantt/Gantt';
import { GanttTask, GanttConfig } from './types';
import { generateMockData, MS_PER_DAY } from './utils';

const App: React.FC = () => {
  // Generate a large dataset: 2000 rows, 30 days to ensure plenty of data for any range selection
  const initialData = useMemo(() => generateMockData(2000, 30), []);
  
  const [tasks, setTasks] = useState<GanttTask[]>(initialData.tasks);
  const [rows] = useState(initialData.rows);

  // Controls State
  const [zoom, setZoom] = useState(80); // columnWidth (px per hour)
  const [startDateStr, setStartDateStr] = useState(new Date(initialData.startDate).toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState(14);

  const config: GanttConfig = useMemo(() => {
    const start = new Date(startDateStr).getTime();
    return {
      startDate: start,
      endDate: start + (durationDays * MS_PER_DAY),
      dimensions: {
        rowHeight: 50,
        columnWidth: zoom,
        sidebarWidth: 200,
        headerHeight: 60
      }
    };
  }, [startDateStr, durationDays, zoom]);

  const handleTaskUpdate = (id: string, updates: Partial<GanttTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex-none bg-slate-900 text-white p-4 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-black text-xl shadow-inner">F</div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">SkyFlow Operations</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">Fleet Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end border-r border-slate-700 pr-6">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Active Fleet</span>
            <span className="text-xl font-mono font-bold text-blue-400 leading-none">{tasks.length}</span>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">Sync Data</button>
          </div>
        </div>
      </header>

      {/* Toolbar for Controls */}
      <nav className="flex-none bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-40">
        <div className="flex items-center space-x-8">
          {/* Zoom Control */}
          <div className="flex items-center space-x-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Scale (Zoom)</label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Min</span>
              <input 
                type="range" 
                min="20" 
                max="300" 
                value={zoom} 
                onChange={(e) => setZoom(parseInt(e.target.value))}
                className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs text-slate-500">Max</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Range Controls */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">From</label>
              <input 
                type="date" 
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Days</label>
              <select 
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={3}>3 Days</option>
                <option value={7}>1 Week</option>
                <option value={14}>2 Weeks</option>
                <option value={30}>1 Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
           <span className="bg-slate-100 px-2 py-1 rounded">Grid: {zoom}px/h</span>
           <span className="bg-slate-100 px-2 py-1 rounded">Range: {durationDays}d</span>
        </div>
      </nav>

      {/* Main Gantt Dashboard */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col space-y-4 bg-slate-50">
        <div className="flex-1 min-h-0">
          <Gantt 
            rows={rows}
            tasks={tasks}
            config={config}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="flex-none h-8 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex space-x-6">
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>System Online</span>
          <span>Buffer: Optimized</span>
          <span>Virtual Rows: {rows.length}</span>
        </div>
        <div>
          Engine: High-Frequency Virtual Renderer v2.5.1
        </div>
      </footer>
    </div>
  );
};

export default App;
