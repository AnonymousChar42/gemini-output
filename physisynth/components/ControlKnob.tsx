import React from 'react';

interface ControlKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  color?: 'neon-blue' | 'neon-pink' | 'neon-purple';
}

export const ControlKnob: React.FC<ControlKnobProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange,
  color = 'neon-blue'
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Dynamic color classes
  const colorMap = {
    'neon-blue': 'bg-neon-blue shadow-[0_0_10px_#00f3ff]',
    'neon-pink': 'bg-neon-pink shadow-[0_0_10px_#ff00ff]',
    'neon-purple': 'bg-neon-purple shadow-[0_0_10px_#bc13fe]'
  };

  const textColorMap = {
    'neon-blue': 'text-neon-blue',
    'neon-pink': 'text-neon-pink',
    'neon-purple': 'text-neon-purple'
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className={`text-xs font-mono tracking-widest uppercase ${textColorMap[color]} font-bold`}>{label}</div>
      <div className="relative w-full h-48 bg-slate-800/50 rounded-full flex justify-center p-1 border border-slate-700/50">
        <div className="absolute bottom-2 w-2 bg-slate-700 h-[90%] rounded-full overflow-hidden">
             {/* Fill bar */}
            <div 
                className={`absolute bottom-0 w-full rounded-b-full transition-all duration-100 ease-out ${colorMap[color].split(' ')[0]} opacity-30`}
                style={{ height: `${percentage}%` }}
            />
        </div>
        
        {/* Invisible Range Input Overlay for interaction */}
        <input 
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-[180px] h-full -rotate-90 origin-center cursor-pointer opacity-0 z-10"
        />

        {/* The visual thumb/handle */}
        <div 
            className={`absolute w-6 h-6 rounded-full border-2 border-white ${colorMap[color]} transition-all duration-75 pointer-events-none`}
            style={{ 
                bottom: `calc(${percentage}% - 12px)`,
                // Add padding constraint
                marginBottom: percentage < 5 ? '8px' : (percentage > 95 ? '-8px' : '0') 
            }}
        >
             <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="font-mono text-xs text-slate-400">{value.toFixed(2)}</div>
    </div>
  );
};