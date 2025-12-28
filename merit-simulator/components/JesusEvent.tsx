import React from 'react';

interface Props {
  isVisible: boolean;
  onClick: () => void;
}

const JesusEvent: React.FC<Props> = ({ isVisible, onClick }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        {/* Warning Flash */}
        <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
        
        <div className="absolute top-20 text-red-500 font-cyber font-bold text-2xl animate-pulse text-shadow-md">
            ⚠️ 信仰审判 / DIVINE TRIAL ⚠️
        </div>

        {/* The Entity */}
        <button
            onClick={onClick}
            className="pointer-events-auto transform transition-transform hover:scale-110 active:scale-95 cursor-crosshair"
            style={{
                position: 'absolute',
                left: '10%', // Could be randomized in parent
                top: '30%',
            }}
        >
            <div className="text-9xl filter drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] shake-hard relative">
                ✝️
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
                    🧔
                </div>
            </div>
            <div className="mt-4 bg-black/80 text-red-400 px-4 py-2 rounded border border-red-500 text-center font-bold">
                点击驱逐!<br/>CLICK TO EXPEL!
            </div>
        </button>
    </div>
  );
};

export default JesusEvent;