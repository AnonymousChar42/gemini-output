
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GanttTask, GanttRow, GanttConfig } from '../../types';
import { formatDate, MS_PER_DAY, MS_PER_HOUR } from '../../utils';
import GanttItem from './GanttItem';

interface GanttProps {
  rows: GanttRow[];
  tasks: GanttTask[];
  config: GanttConfig;
  onTaskUpdate: (id: string, updates: Partial<GanttTask>) => void;
  renderPopup?: (task: GanttTask) => React.ReactNode;
}

const Gantt: React.FC<GanttProps> = ({ rows, tasks, config, onTaskUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [selectedTask, setSelectedTask] = useState<{task: GanttTask, x: number, y: number} | null>(null);

  const { startDate, endDate, dimensions } = config;
  const { sidebarWidth, rowHeight, columnWidth } = dimensions;

  // Calculate total canvas size
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / MS_PER_DAY));
  const canvasWidth = totalDays * 24 * columnWidth;
  const canvasHeight = rows.length * rowHeight;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPos({
      left: e.currentTarget.scrollLeft,
      top: e.currentTarget.scrollTop
    });
    if (selectedTask) setSelectedTask(null);
  };

  // Virtualization range calculations
  const visibleRows = useMemo(() => {
    const startIdx = Math.max(0, Math.floor(scrollPos.top / rowHeight) - 2);
    const endIdx = Math.min(rows.length, Math.ceil((scrollPos.top + viewportSize.height) / rowHeight) + 2);
    return { startIdx, endIdx };
  }, [scrollPos.top, viewportSize.height, rowHeight, rows.length]);

  const visibleTimeRange = useMemo(() => {
    const startOffset = Math.max(0, scrollPos.left - 400);
    const endOffset = scrollPos.left + viewportSize.width + 400;
    const startTime = startDate + (startOffset / columnWidth) * MS_PER_HOUR;
    const endTime = startDate + (endOffset / columnWidth) * MS_PER_HOUR;
    return { startTime, endTime };
  }, [scrollPos.left, viewportSize.width, columnWidth, startDate]);

  // Filter tasks for visible area
  const visibleTasks = useMemo(() => {
    const rowIds = new Set(rows.slice(visibleRows.startIdx, visibleRows.endIdx).map(r => r.id));
    return tasks.filter(task => 
      rowIds.has(task.rowId) &&
      task.startTime < visibleTimeRange.endTime &&
      task.endTime > visibleTimeRange.startTime
    );
  }, [tasks, visibleRows, visibleTimeRange, rows]);

  const handleTaskClick = useCallback((task: GanttTask, e: React.MouseEvent) => {
    setSelectedTask({ task, x: e.clientX, y: e.clientY });
  }, []);

  const handleUpdate = (id: string, updates: Partial<GanttTask>) => {
    if (updates.rowId && updates.rowId.startsWith('NEW_ROW_INDEX_')) {
      const idx = parseInt(updates.rowId.replace('NEW_ROW_INDEX_', ''));
      const targetRow = rows[Math.max(0, Math.min(rows.length - 1, idx))];
      if (targetRow) updates.rowId = targetRow.id;
      else delete updates.rowId;
    }
    onTaskUpdate(id, updates);
  };

  const dates = Array.from({ length: totalDays }).map((_, i) => startDate + i * MS_PER_DAY);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-slate-50 border border-slate-200 rounded-xl shadow-xl">
      {/* 1. Header (Sticky Top) */}
      <div className="absolute top-0 left-0 right-0 h-[60px] flex z-30 bg-slate-100 border-b border-slate-300 pointer-events-none overflow-hidden shadow-sm">
        <div className="flex-none bg-slate-200 border-r border-slate-300 flex items-center justify-center font-bold text-slate-500 text-[10px] uppercase tracking-wider" style={{ width: sidebarWidth }}>
          Fleet / Resource
        </div>
        <div className="flex-1 relative" style={{ transform: `translateX(${-scrollPos.left}px)` }}>
          {dates.map((date) => (
            <div key={date} className="absolute h-full border-r border-slate-300/50 flex flex-col items-center justify-center text-xs" style={{ width: columnWidth * 24, left: (date - startDate) / MS_PER_HOUR * columnWidth }}>
              <span className="font-black text-slate-700">{formatDate(date)}</span>
              <div className="flex w-full mt-1 px-1 justify-between text-[9px] text-slate-400 font-bold uppercase">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sidebar (Sticky Left) */}
      <div className="absolute top-[60px] left-0 bottom-0 z-20 bg-white border-r border-slate-300 shadow-lg overflow-hidden" style={{ width: sidebarWidth }}>
        <div style={{ transform: `translateY(${-scrollPos.top}px)` }}>
          {rows.map((row, idx) => (
             idx >= visibleRows.startIdx && idx < visibleRows.endIdx && (
              <div key={row.id} className="absolute w-full px-4 border-b border-slate-100 flex flex-col justify-center bg-white hover:bg-slate-50 transition-colors" style={{ height: rowHeight, top: idx * rowHeight }}>
                <span className="font-bold text-slate-800 text-sm leading-tight">{row.label}</span>
                {row.subLabel && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{row.subLabel}</span>}
              </div>
             )
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute top-[60px] left-[sidebarWidth] right-0 bottom-0 overflow-auto"
        style={{ left: sidebarWidth }}
      >
        <div className="relative bg-white" style={{ width: canvasWidth, height: canvasHeight }}>
          
          {/* Background Grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Horizontal Row Lines */}
            {Array.from({ length: visibleRows.endIdx - visibleRows.startIdx + 1 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-b border-slate-100" style={{ top: (visibleRows.startIdx + i) * rowHeight }} />
            ))}
            {/* Vertical Hour Lines - only render in viewport for performance */}
            {Array.from({ length: Math.ceil(viewportSize.width / columnWidth) + 10 }).map((_, i) => {
               const hourIndex = Math.floor(scrollPos.left / columnWidth) + i;
               return (
                <div key={`v-${hourIndex}`} className={`absolute h-full border-r ${hourIndex % 6 === 0 ? 'border-slate-200' : 'border-slate-50'}`} style={{ left: hourIndex * columnWidth }} />
               );
            })}
          </div>

          {/* Render Items */}
          {visibleTasks.map(task => {
            const rowIndex = rows.findIndex(r => r.id === task.rowId);
            return (
              <GanttItem
                key={task.id}
                task={task}
                startDate={startDate}
                dimensions={dimensions}
                rowIndex={rowIndex}
                onUpdate={handleUpdate}
                onClick={handleTaskClick}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Information Popup */}
      {selectedTask && (
        <div 
          className="fixed z-50 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 w-72 animate-in fade-in zoom-in duration-150"
          style={{ 
            left: Math.min(window.innerWidth - 300, selectedTask.x + 15), 
            top: Math.min(window.innerHeight - 250, selectedTask.y + 15) 
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">{selectedTask.task.label}</h3>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Flight Details</span>
            </div>
            <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Departure</span>
                <span className="font-mono text-slate-700">{new Date(selectedTask.task.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase">Arrival</span>
                <span className="font-mono text-slate-700">{new Date(selectedTask.task.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-slate-500 font-medium">Flight Duration</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                {((selectedTask.task.endTime - selectedTask.task.startTime) / (1000 * 60 * 60)).toFixed(1)}h
              </span>
            </div>
            <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
              Modify Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gantt;
