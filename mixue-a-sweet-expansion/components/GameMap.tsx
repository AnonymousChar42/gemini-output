import React, { useMemo, useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, LineLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { MapViewState } from '@deck.gl/core';
import { GameState, ProvinceStatus } from '../types';

interface GameMapProps {
  gameState: GameState;
  onProvinceClick: (name: string) => void;
  onBubbleClick: (id: string) => void;
  geoData: any;
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 105,
  latitude: 35,
  zoom: 3,
  pitch: 0,
  bearing: 0
};

// --- Helper Functions for Curves ---

const getControlPoint = (p0: [number, number], p1: [number, number]): [number, number] => {
  const mx = (p0[0] + p1[0]) / 2;
  const my = (p0[1] + p1[1]) / 2;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const curvature = 0.2; 
  return [mx - dy * curvature, my + dx * curvature];
};

const getBezierPoint = (p0: [number, number], p1: [number, number], c: [number, number], t: number): [number, number] => {
  const invT = 1 - t;
  const x = invT * invT * p0[0] + 2 * invT * t * c[0] + t * t * p1[0];
  const y = invT * invT * p0[1] + 2 * invT * t * c[1] + t * t * p1[1];
  return [x, y];
};

const generateBezierSegments = (
  p0: [number, number], 
  p1: [number, number], 
  minT: number, 
  maxT: number, 
  totalSegments: number = 50
) => {
  const segments = [];
  const c = getControlPoint(p0, p1);
  const startIndex = Math.floor(minT * totalSegments);
  const endIndex = Math.ceil(maxT * totalSegments);

  for (let i = startIndex; i < endIndex; i++) {
    const t1 = i / totalSegments;
    const t2 = (i + 1) / totalSegments;
    const activeT1 = Math.max(t1, minT);
    const activeT2 = Math.min(t2, maxT);
    if (activeT1 >= activeT2) continue;

    const start = getBezierPoint(p0, p1, c, activeT1);
    const end = getBezierPoint(p0, p1, c, activeT2);

    segments.push({ start, end, index: i, total: totalSegments });
  }
  return segments;
};

const getBaseColor = (name: string): [number, number, number] => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xFF) % 50 + 40;  
  const g = ((hash >> 8) & 0xFF) % 50 + 40;
  const b = ((hash >> 16) & 0xFF) % 50 + 60;
  return [r, g, b];
};

// Generate an icon atlas from an emoji string using Canvas
const generateEmojiIcon = (emoji: string, size: number = 128) => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${size * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, size / 2, size / 2 + size * 0.1); 
  }
  return canvas.toDataURL();
};

export const GameMap: React.FC<GameMapProps> = ({ gameState, onProvinceClick, onBubbleClick, geoData }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Generate Icon Atlases once (Only Snowman now)
  const snowmanIconAtlas = useMemo(() => generateEmojiIcon('⛄'), []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setCurrentTime(Date.now());
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const layers = useMemo(() => {
    // 1. Base GeoJSON Layer
    const geoLayer = new GeoJsonLayer({
      id: 'geojson-layer',
      data: geoData,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: (d: any) => {
          return gameState.selectedProvince === d.properties.name 
            ? [0, 255, 255, 255] 
            : [255, 255, 255, 80];
      },
      getLineWidth: (d: any) => gameState.selectedProvince === d.properties.name ? 3 : 1,
      getFillColor: (d: any) => {
        const name = d.properties.name;
        const province = gameState.provinces[name];
        if (!province) return [20, 20, 20, 255]; 
        const baseColor = getBaseColor(name);
        if (province.status === ProvinceStatus.LOCKED) {
           return [...baseColor, 200];
        }
        const intensity = province.infection / 100;
        const targetR = 230; const targetG = 0; const targetB = 18;
        const r = baseColor[0] + (targetR - baseColor[0]) * intensity;
        const g = baseColor[1] + (targetG - baseColor[1]) * intensity;
        const b = baseColor[2] + (targetB - baseColor[2]) * intensity;
        return [r, g, b, 230];
      },
      updateTriggers: {
        getFillColor: [gameState.provinces, gameState.hasStarted],
        getLineColor: [gameState.selectedProvince],
        getLineWidth: [gameState.selectedProvince]
      },
      onHover: info => setHoverInfo(info),
      onClick: info => {
        if (info.object) {
          onProvinceClick(info.object.properties.name);
        }
      }
    });

    // 2. Flight Paths Logic (No Planes)
    const flightSegments: any[] = [];
    const capPoints: any[] = [];

    gameState.flights.forEach(f => {
      const p0 = gameState.provinces[f.from]?.centroid;
      const p1 = gameState.provinces[f.to]?.centroid;
      if (!p0 || !p1) return;

      const elapsed = currentTime - f.startTime;
      const totalDuration = f.duration;

      const flyRatio = 0.4; 
      const stayRatio = 0.4; 
      const fadeRatio = 0.2; 

      const flyTime = totalDuration * flyRatio;
      const stayTime = totalDuration * stayRatio;

      let headT = elapsed < flyTime ? elapsed / flyTime : 1;
      
      const fadeStartTime = flyTime + stayTime;
      let tailT = elapsed > fadeStartTime ? Math.min(1, (elapsed - fadeStartTime) / (totalDuration * fadeRatio)) : 0;

      const getDynamicColor = (positionT: number) => {
         const phase = (currentTime / 800) * 2;
         const t = (Math.sin(phase - positionT * 4) + 1) / 2;
         const r = 230 + (255 - 230) * t;
         const g = 0 + (215 - 0) * t;
         const b = 18 + (0 - 18) * t;
         return [r, g, b, 255];
      };

      if (tailT < 1) {
        const segments = generateBezierSegments(p0, p1, tailT, headT);
        flightSegments.push(...segments);

        const c = getControlPoint(p0, p1);
        const capRadius = 1.5; 
        
        // 1. Tail Cap
        if (tailT < 1) {
            const tailPos = getBezierPoint(p0, p1, c, tailT);
            capPoints.push({
                position: tailPos,
                color: getDynamicColor(tailT),
                radius: capRadius
            });
        }

        // 2. Head Cap
        const headPos = getBezierPoint(p0, p1, c, headT);
        capPoints.push({
            position: headPos,
            color: getDynamicColor(headT),
            radius: capRadius
        });
      }
    });

    const flightLineLayer = new LineLayer({
      id: 'flight-line-layer',
      data: flightSegments,
      getSourcePosition: (d: any) => d.start,
      getTargetPosition: (d: any) => d.end,
      getWidth: 2,
      getColor: (d: any) => {
        const phase = (currentTime / 800) * 2; 
        const position = d.index / d.total; 
        const t = (Math.sin(phase - position * 4) + 1) / 2;
        const r = 230 + (255 - 230) * t;
        const g = 0 + (215 - 0) * t;
        const b = 18 + (0 - 18) * t;
        return [r, g, b, 255];
      },
      updateTriggers: {
        data: [gameState.flights, currentTime], 
        getColor: [currentTime]
      }
    });

    const capLayer = new ScatterplotLayer({
        id: 'flight-caps-layer',
        data: capPoints,
        getPosition: (d: any) => d.position,
        getFillColor: (d: any) => d.color,
        getRadius: (d: any) => d.radius,
        radiusUnits: 'pixels',
        radiusMinPixels: 1,
        updateTriggers: {
            data: [gameState.flights, currentTime]
        }
    });

    // 3. Bubbles (Converted to IconLayer for Color)
    const bubbleLayer = new IconLayer({
        id: 'bubble-layer',
        data: gameState.bubbles,
        pickable: true,
        iconAtlas: snowmanIconAtlas,
        iconMapping: {
            snowman: { x: 0, y: 0, width: 128, height: 128, mask: false }
        },
        getIcon: d => 'snowman',
        getPosition: (d: any) => d.coordinates,
        getSize: 48,
        sizeUnits: 'pixels',
        onClick: (info) => {
            if (info.object) {
                onBubbleClick(info.object.id);
                return true; 
            }
        },
        onHover: info => setHoverInfo(info),
        updateTriggers: {
            getPosition: [gameState.bubbles]
        }
    });

    return [geoLayer, flightLineLayer, capLayer, bubbleLayer];
  }, [geoData, gameState.provinces, gameState.bubbles, gameState.flights, currentTime, gameState.hasStarted, gameState.selectedProvince, onProvinceClick, onBubbleClick, snowmanIconAtlas]);

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => setViewState(e.viewState)}
        controller={true}
        layers={layers}
        getCursor={({isHovering}) => {
          return (isHovering && hoverInfo?.layer?.id === 'bubble-layer') ? 'pointer' : 'default';
        }}
        getTooltip={({object, layer}) => {
            if (!object) return null;
            if (layer.id === 'bubble-layer') {
                return {
                    text: `点击获取 +${object.value} 创意点`,
                    style: { backgroundColor: '#e60012', color: 'white', fontSize: '0.9em' }
                };
            }
            if (layer.id === 'geojson-layer') {
                 return {
                    html: `
                        <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #444;">
                            <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 4px;">${object.properties.name}</div>
                            <div style="font-size: 0.9em; color: #aaa;">
                            ${gameState.provinces[object.properties.name]?.status === 'LOCKED' ? '未开发' : '已入驻'}
                            </div>
                        </div>
                    `,
                    style: {
                        backgroundColor: 'transparent',
                        fontSize: '0.8em'
                    }
                };
            }
            return null;
        }}
      />
      {!gameState.hasStarted && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-10 pointer-events-none">
          请点击地图选择第一家店的省份 ⛄
        </div>
      )}
    </div>
  );
};