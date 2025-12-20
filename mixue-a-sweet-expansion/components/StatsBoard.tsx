import React from 'react';
import { GameState } from '../types';
import { TrendingUp, MapPin, Calendar, DollarSign } from 'lucide-react';

export const StatsBoard: React.FC<{ state: GameState }> = ({ state }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg flex flex-wrap gap-6 items-center text-white justify-between">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-red-500 tracking-tighter">蜜雪冰城</h1>
            <span className="text-gray-400 text-sm">甜蜜扩张</span>
        </div>

        <div className="flex gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2" title="创意点">
                <DollarSign className="text-yellow-400 w-5 h-5" />
                <span className="font-mono text-xl">{state.money}</span>
            </div>
            <div className="flex items-center gap-2" title="市场份额">
                <TrendingUp className="text-blue-400 w-5 h-5" />
                <span className="font-mono text-xl">{state.marketShare.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2" title="门店总数">
                <MapPin className="text-red-400 w-5 h-5" />
                <span className="font-mono text-xl">{state.totalShops}</span>
            </div>
            <div className="flex items-center gap-2" title="天数">
                <Calendar className="text-gray-400 w-5 h-5" />
                <span className="font-mono text-xl">Day {state.day}</span>
            </div>
        </div>
    </div>
  );
};