
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { GanttTask, GanttDimensions } from '../../types';
import { timeToX, xToTime, MS_PER_HOUR } from '../../utils';

interface GanttItemProps {
  task: GanttTask;
  startDate: number;
  dimensions: GanttDimensions;
  rowIndex: number;
  onUpdate: (id: string, updates: Partial<GanttTask>) => void;
  onClick: (task: GanttTask, e: React.MouseEvent) => void;
}

const GanttItem: React.FC<GanttItemProps> = ({ task, startDate, dimensions, rowIndex, onUpdate, onClick }) => {
  const { columnWidth, rowHeight } = dimensions;
  
  // Local state for smooth visual feedback during drag/resize
  const [dragState, setDragState] = useState<{
    type: 'drag' | 'start' | 'end';
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialTaskState = useRef({ startTime: 0, endTime: 0, rowIndex: 0 });

  // Calculate visual position based on either real state or transient drag state
  const visualValues = useMemo(() => {
    if (!dragState) {
      const left = timeToX(task.startTime, startDate, columnWidth);
      const width = timeToX(task.endTime, startDate, columnWidth) - left;
      const top = rowIndex * rowHeight + (rowHeight * 0.15);
      return { left, width, top, height: rowHeight * 0.7 };
    }

    const dx = dragState.offsetX;
    const dy = dragState.offsetY;

    if (dragState.type === 'drag') {
      const timeOffset = (dx / columnWidth) * MS_PER_HOUR;
      const newStart = task.startTime + timeOffset;
      const newEnd = task.endTime + timeOffset;
      const left = timeToX(newStart, startDate, columnWidth);
      const width = timeToX(newEnd, startDate, columnWidth) - left;
      const top = (rowIndex * rowHeight) + dy + (rowHeight * 0.15);
      return { left, width, top, height: rowHeight * 0.7 };
    }

    if (dragState.type === 'start') {
      const timeOffset = (dx / columnWidth) * MS_PER_HOUR;
      const newStart = Math.min(task.startTime + timeOffset, task.endTime - MS_PER_HOUR * 0.5);
      const left = timeToX(newStart, startDate, columnWidth);
      const width = timeToX(task.endTime, startDate, columnWidth) - left;
      const top = rowIndex * rowHeight + (rowHeight * 0.15);
      return { left, width, top, height: rowHeight * 0.7 };
    }

    if (dragState.type === 'end') {
      const timeOffset = (dx / columnWidth) * MS_PER_HOUR;
      const newEnd = Math.max(task.endTime + timeOffset, task.startTime + MS_PER_HOUR * 0.5);
      const left = timeToX(task.startTime, startDate, columnWidth);
      const width = timeToX(newEnd, startDate, columnWidth) - left;
      const top = rowIndex * rowHeight + (rowHeight * 0.15);
      return { left, width, top, height: rowHeight * 0.7 };
    }

    return { left: 0, width: 0, top: 0, height: 0 };
  }, [task, dragState, rowIndex, rowHeight, columnWidth, startDate]);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'drag' | 'start' | 'end') => {
    e.stopPropagation();
    initialMousePos.current = { x: e.clientX, y: e.clientY };
    initialTaskState.current = { 
      startTime: task.startTime, 
      endTime: task.endTime,
      rowIndex: rowIndex
    };

    setDragState({ type, offsetX: 0, offsetY: 0 });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - initialMousePos.current.x;
      const dy = moveEvent.clientY - initialMousePos.current.y;
      
      setDragState({ type, offsetX: dx, offsetY: dy });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const dx = upEvent.clientX - initialMousePos.current.x;
      const dy = upEvent.clientY - initialMousePos.current.y;

      // Calculate final updates
      const timeDiff = (dx / columnWidth) * MS_PER_HOUR;
      const rowDiff = Math.round(dy / rowHeight);

      if (type === 'drag') {
        onUpdate(task.id, {
          startTime: initialTaskState.current.startTime + timeDiff,
          endTime: initialTaskState.current.endTime + timeDiff,
          rowId: `NEW_ROW_INDEX_${initialTaskState.current.rowIndex + rowDiff}`
        });
      } else if (type === 'start') {
        onUpdate(task.id, { 
          startTime: Math.min(initialTaskState.current.startTime + timeDiff, task.endTime - MS_PER_HOUR * 0.5) 
        });
      } else if (type === 'end') {
        onUpdate(task.id, { 
          endTime: Math.max(initialTaskState.current.endTime + timeDiff, task.startTime + MS_PER_HOUR * 0.5) 
        });
      }

      setDragState(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [task, columnWidth, rowHeight, rowIndex, onUpdate]);

  return (
    <div
      className={`absolute rounded-md shadow-sm border border-white/20 flex items-center px-3 text-white text-xs font-medium cursor-move select-none transition-shadow group ${task.color} ${dragState ? 'opacity-90 z-50 ring-2 ring-white/50 shadow-xl scale-[1.02]' : 'hover:brightness-110'}`}
      style={{
        left: visualValues.left,
        top: visualValues.top,
        width: visualValues.width,
        height: visualValues.height,
        transition: dragState ? 'none' : 'all 0.15s ease-out'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onClick={(e) => onClick(task, e)}
    >
      <div className="flex flex-col truncate pointer-events-none">
        <span className="truncate leading-tight">{task.label}</span>
      </div>
      
      {/* Resizers */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-l-md z-10"
        onMouseDown={(e) => handleMouseDown(e, 'start')}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r-md z-10"
        onMouseDown={(e) => handleMouseDown(e, 'end')}
      />
    </div>
  );
};

export default React.memo(GanttItem);
