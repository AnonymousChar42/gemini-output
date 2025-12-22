import React, { useEffect, useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMap } from './components/GameMap';
import { TechPanel } from './components/TechPanel';
import { StatsBoard } from './components/StatsBoard';
import { NewsTicker } from './components/NewsTicker';
import { PROVINCE_FLAVORS } from './constants';
import { ProvinceStatus, ProvinceData } from './types';

const App: React.FC = () => {
  const { gameState, startGame, purchaseTech, initializeProvinces, selectProvince, collectBubble } = useGameLogic();
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculate Geometric Centroid (Signed Area method)
  // This is much more accurate than Bounding Box for concave shapes (e.g. Gansu, Inner Mongolia)
  const getPolygonCentroid = (points: number[][]): [number, number] => {
    let x = 0, y = 0, area = 0;
    // GeoJSON polygons are closed (first point == last point), so we loop to length - 1
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i+1];
      const f = x1 * y2 - x2 * y1;
      x += (x1 + x2) * f;
      y += (y1 + y2) * f;
      area += f * 3;
    }
    return area === 0 ? [points[0][0], points[0][1]] : [x / area, y / area];
  };

  const calculateCentroid = (geometry: any): [number, number] => {
    let targetPolygon: number[][] = [];

    if (geometry.type === 'Polygon') {
      targetPolygon = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      // For MultiPolygons, find the polygon with the most coordinates (usually the main landmass)
      let maxLen = 0;
      geometry.coordinates.forEach((poly: any[]) => {
        if (poly[0].length > maxLen) {
          maxLen = poly[0].length;
          targetPolygon = poly[0];
        }
      });
    } else {
      return [116.4, 39.9]; // Fallback
    }

    return getPolygonCentroid(targetPolygon);
  };

  // Load GeoJSON data
  useEffect(() => {
    fetch('china.json')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        
        const provinceDataList: ProvinceData[] = data.features.map((f: any) => ({
             name: f.properties.name,
             code: '',
             infection: 0,
             status: ProvinceStatus.LOCKED,
             shopCount: 0,
             centroid: calculateCentroid(f.geometry)
        }));

        initializeProvinces(provinceDataList);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setLoading(false);
      });
  }, [initializeProvinces]);

  const handleProvinceClick = (name: string) => {
    if (!gameState.hasStarted) {
      startGame(name);
    } else {
      selectProvince(name);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white flex-col gap-4">
        <div className="animate-spin text-4xl">⛄</div>
        <div>加载地图数据中...</div>
      </div>
    );
  }

  const selectedProvinceData = gameState.selectedProvince ? gameState.provinces[gameState.selectedProvince] : null;
  const flavor = gameState.selectedProvince ? PROVINCE_FLAVORS.find(f => f.province === gameState.selectedProvince) : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <StatsBoard state={gameState} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Map Area */}
        <div className="flex-1 relative">
          <GameMap 
            gameState={gameState} 
            onProvinceClick={handleProvinceClick}
            onBubbleClick={collectBubble}
            geoData={geoData}
          />

          {/* Selected Province Info Card */}
          {selectedProvinceData && (
            <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur border border-gray-600 p-4 rounded-lg shadow-xl text-white w-64 pointer-events-none select-none z-10 animate-fade-in">
              <h3 className="text-xl font-bold mb-2 flex justify-between items-center">
                {selectedProvinceData.name}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedProvinceData.status === ProvinceStatus.LOCKED ? 'bg-gray-600' : 
                  selectedProvinceData.status === ProvinceStatus.INFECTED ? 'bg-orange-600' : 'bg-red-600'
                }`}>
                  {selectedProvinceData.status === ProvinceStatus.LOCKED ? '未开发' : 
                   selectedProvinceData.status === ProvinceStatus.INFECTED ? '扩张中' : '已占领'}
                </span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">市场覆盖:</span>
                  <span className="font-mono text-red-400 font-bold">{selectedProvinceData.infection.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${selectedProvinceData.infection}%` }}></div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">门店数量:</span>
                  <span className="font-mono">{selectedProvinceData.shopCount} 家</span>
                </div>

                {flavor && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs text-yellow-500 font-bold mb-1">特色新品</div>
                    <div className="font-medium text-white">{flavor.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{flavor.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Victory/Defeat Overlay */}
          {(gameState.gameWon || gameState.gameLost) && (
            <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
              <div className="bg-gray-800 p-8 rounded-xl border-2 border-red-500 text-center max-w-lg shadow-2xl">
                <h2 className={`text-4xl font-bold mb-4 ${gameState.gameWon ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {gameState.gameWon ? "甜蜜征服！" : "扩张失败..."}
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  {gameState.gameWon 
                    ? "雪王已经占领了全中国！甜蜜的歌声传遍了大街小巷。" 
                    : "市场竞争太激烈，资金链断裂，扩张步伐被迫停止。"}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
                >
                  再来一杯
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panel - Tech Tree */}
        <div className="w-80 sm:w-96 flex-shrink-0 z-20 shadow-xl bg-gray-900 border-l border-gray-700">
          <TechPanel 
            techs={gameState.techs} 
            money={gameState.money} 
            onPurchase={purchaseTech} 
          />
        </div>
      </div>

      <NewsTicker news={gameState.news} />
    </div>
  );
};

export default App;