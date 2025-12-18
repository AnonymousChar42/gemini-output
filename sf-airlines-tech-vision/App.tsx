import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { motion } from 'framer-motion';

import Earth3D from './components/Earth3D';
import Navbar from './components/Navbar';
import AboutSection from './components/AboutSection';
import InfoPanel from './components/InfoPanel';
import Footer from './components/Footer';
import { FlightRoute } from './types';

const App: React.FC = () => {
  const [selectedFlight, setSelectedFlight] = useState<FlightRoute | null>(null);

  const handleFlightSelect = (flight: FlightRoute | null) => {
    setSelectedFlight(flight);
  };

  return (
    <div className="bg-sf-dark min-h-screen text-white relative selection:bg-sf-orange selection:text-white">
      <Navbar />

      {/* Hero Section with 3D Earth */}
      <section className="h-screen w-full relative overflow-hidden">
        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
               <Earth3D onSelectFlight={handleFlightSelect} />
            </Suspense>
          </Canvas>
          <Loader 
             containerStyles={{ background: '#020617' }} 
             innerStyles={{ width: '200px', height: '2px', background: '#334155' }}
             barStyles={{ height: '2px', background: '#0EA5E9' }}
             dataStyles={{ fontFamily: 'Orbitron', color: '#0EA5E9', fontSize: '12px' }}
          />
        </div>

        {/* Hero Overlay Content */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-start p-4 sm:p-10 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold font-tech text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
              FUTURE OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sf-blue to-sf-silver">AERIAL LOGISTICS</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg font-light">
              Experience the power of SF Airlines' intelligent global network. Real-time tracking, AI optimization, and boundless reach.
            </p>
            <div className="flex space-x-4 pointer-events-auto">
                <button className="px-8 py-3 bg-sf-red hover:bg-red-700 text-white font-bold rounded-sm transition-all shadow-[0_0_20px_rgba(220,30,50,0.4)]">
                    TRACK SHIPMENT
                </button>
                <button className="px-8 py-3 border border-white/20 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-sm transition-all">
                    VIEW NETWORK
                </button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
            <span className="text-[10px] tracking-[0.3em] text-gray-500 font-tech mb-2">SCROLL TO EXPLORE</span>
            <div className="w-px h-12 bg-gradient-to-b from-sf-blue to-transparent"></div>
        </motion.div>

        {/* Info Panel for Flights */}
        <InfoPanel flight={selectedFlight} onClose={() => setSelectedFlight(null)} />
      </section>

      {/* Info Sections */}
      <AboutSection />
      
      <Footer />
    </div>
  );
};

export default App;
