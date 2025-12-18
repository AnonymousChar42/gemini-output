import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlightRoute } from '../types';
import { Plane, X, Clock, Box } from 'lucide-react';
import { CITIES } from '../constants';

interface InfoPanelProps {
  flight: FlightRoute | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ flight, onClose }) => {
  return (
    <AnimatePresence>
      {flight && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-24 right-4 md:right-10 z-40 w-80 glass-panel rounded-md overflow-hidden border border-sf-blue/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="bg-sf-blue/20 p-4 flex justify-between items-center border-b border-sf-blue/20">
            <div className="flex items-center space-x-2">
                <Plane className="w-5 h-5 text-sf-blue" />
                <span className="font-tech font-bold text-lg">{flight.flightNumber}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center text-sm">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{flight.from.substring(0,3).toUpperCase()}</div>
                    <div className="text-xs text-gray-400">{CITIES[flight.from].name.split(' ')[0]}</div>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full h-0.5 bg-gray-600 relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-sf-orange transition-all duration-1000" 
                            style={{ width: `${flight.progress * 100}%` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -mt-1 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
                            style={{ left: `${flight.progress * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-sf-blue mt-1 animate-pulse">{flight.status}</span>
                </div>
                 <div className="text-center">
                    <div className="text-2xl font-bold text-white">{flight.to.substring(0,3).toUpperCase()}</div>
                    <div className="text-xs text-gray-400">{CITIES[flight.to].name.split(' ')[0]}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-black/30 p-3 rounded border border-gray-700">
                    <div className="flex items-center space-x-2 mb-1 text-gray-400 text-xs uppercase">
                        <Box size={12} />
                        <span>Cargo</span>
                    </div>
                    <div className="text-sm font-medium">{flight.cargoType}</div>
                </div>
                 <div className="bg-black/30 p-3 rounded border border-gray-700">
                    <div className="flex items-center space-x-2 mb-1 text-gray-400 text-xs uppercase">
                        <Clock size={12} />
                        <span>ETA</span>
                    </div>
                    <div className="text-sm font-medium">04:30 AM</div>
                </div>
            </div>
            
            <button className="w-full py-2 bg-sf-blue hover:bg-blue-600 text-white font-tech text-xs tracking-widest transition-colors rounded-sm">
                VIEW MANIFEST
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoPanel;
