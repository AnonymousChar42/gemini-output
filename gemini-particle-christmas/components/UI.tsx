import React from 'react';

interface UIProps {}

const UI: React.FC<UIProps> = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between pb-10 z-10">
      
      {/* Header */}
      <div className="absolute top-8 left-8 text-left pointer-events-auto">
         {/* Added pb-4 to prevent clipping of descenders like 'y' */}
         <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 font-['Mountains_of_Christmas'] drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] pb-4">
            Merry Christmas
         </h1>
         <p className="text-blue-200 text-sm mt-0 opacity-80 font-['Inter']">Powered by Three.js</p>
      </div>

      <div className="mb-8 text-white/50 font-['Inter'] text-sm animate-pulse">
        Enjoy the lights
      </div>
    </div>
  );
};

export default UI;