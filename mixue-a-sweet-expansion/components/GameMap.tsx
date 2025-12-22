import React, { useMemo, useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, TextLayer, LineLayer, ScatterplotLayer } from '@deck.gl/layers';
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

// Calculate a control point for Quadratic Bezier (offset from midpoint)
const getControlPoint = (p0: [number, number], p1: [number, number]): [number, number] => {
  const mx = (p0[0] + p1[0]) / 2;
  const my = (p0[1] + p1[1]) / 2;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  // Perpendicular offset. 0.2 is the curvature amount.
  const curvature = 0.2; 
  return [mx - dy * curvature, my + dx * curvature];
};

// Get point on Quadratic Bezier at t (0-1)
const getBezierPoint = (p0: [number, number], p1: [number, number], c: [number, number], t: number): [number, number] => {
  const invT = 1 - t;
  const x = invT * invT * p0[0] + 2 * invT * t * c[0] + t * t * p1[0];
  const y = invT * invT * p0[1] + 2 * invT * t * c[1] + t * t * p1[1];
  return [x, y];
};

// Generate line segments for a Bezier curve with start/end trimming
const generateBezierSegments = (
  p0: [number, number], 
  p1: [number, number], 
  minT: number, // Tail progress (0 to 1)
  maxT: number, // Head progress (0 to 1)
  totalSegments: number = 50
) => {
  const segments = [];
  const c = getControlPoint(p0, p1);
  
  // Optimization: calculate index range
  const startIndex = Math.floor(minT * totalSegments);
  const endIndex = Math.ceil(maxT * totalSegments);

  for (let i = startIndex; i < endIndex; i++) {
    const t1 = i / totalSegments;
    const t2 = (i + 1) / totalSegments;
    
    // Clamp segment to the visible range [minT, maxT]
    const activeT1 = Math.max(t1, minT);
    const activeT2 = Math.min(t2, maxT);
    
    // If segment is effectively zero length due to clamping, skip
    if (activeT1 >= activeT2) continue;

    const start = getBezierPoint(p0, p1, c, activeT1);
    const end = getBezierPoint(p0, p1, c, activeT2);

    segments.push({
      start,
      end,
      index: i,
      total: totalSegments
    });
  }
  return segments;
};

// Deterministic color generation for "Political Map" feel
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

export const GameMap: React.FC<GameMapProps> = ({ gameState, onProvinceClick, onBubbleClick, geoData }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Animation Loop
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

    // 2. Flight Paths & Planes Logic
    const flightSegments: any[] = [];
    const activePlanes: any[] = [];
    const capPoints: any[] = []; // Points for rounded caps

    gameState.flights.forEach(f => {
      const p0 = gameState.provinces[f.from]?.centroid;
      const p1 = gameState.provinces[f.to]?.centroid;
      if (!p0 || !p1) return;

      const elapsed = currentTime - f.startTime;
      const totalDuration = f.duration;

      // Revised phases for longer stay and thinner feel
      const flyRatio = 0.4; // 40% flying
      const stayRatio = 0.4; // 40% staying (Much longer)
      const fadeRatio = 0.2; // 20% fading

      const flyTime = totalDuration * flyRatio;
      const stayTime = totalDuration * stayRatio;
      const fadeTime = totalDuration * fadeRatio;

      let headT = elapsed < flyTime ? elapsed / flyTime : 1;
      
      const fadeStartTime = flyTime + stayTime;
      let tailT = elapsed > fadeStartTime ? Math.min(1, (elapsed - fadeStartTime) / fadeTime) : 0;

      // Color Calculation Helper
      const getDynamicColor = (positionT: number) => {
         const phase = (currentTime / 800) * 2;
         const t = (Math.sin(phase - positionT * 4) + 1) / 2;
         const r = 230 + (255 - 230) * t;
         const g = 0 + (215 - 0) * t;
         const b = 18 + (0 - 18) * t;
         return [r, g, b, 255];
      };

      if (tailT < 1) {
        // A. Segments
        const segments = generateBezierSegments(p0, p1, tailT, headT);
        flightSegments.push(...segments);

        const c = getControlPoint(p0, p1);
        
        // B. Cap Points (Rounded Ends)
        const capRadius = 1.5; // Radius in pixels (Diameter 3px) for thinner lines
        
        // 1. Tail Cap (Only if tail hasn't fully retracted)
        if (tailT < 1) {
            const tailPos = getBezierPoint(p0, p1, c, tailT);
            capPoints.push({
                position: tailPos,
                color: getDynamicColor(tailT),
                radius: capRadius
            });
        }

        // 2. Head Cap (Moving Tip)
        const headPos = getBezierPoint(p0, p1, c, headT);
        capPoints.push({
            position: headPos,
            color: getDynamicColor(headT),
            radius: capRadius
        });

        // C. Plane (Only while flying)
        if (headT < 1) {
          // Calculate look-ahead point for rotation angle
          const epsilon = 0.01;
          const tNext = Math.min(1, headT + epsilon);
          const tPrev = Math.max(0, headT - epsilon);
          
          const pNext = getBezierPoint(p0, p1, c, tNext);
          const pPrev = getBezierPoint(p0, p1, c, tPrev);
          
          const dx = pNext[0] - pPrev[0];
          const dy = pNext[1] - pPrev[1];
          let angle = Math.atan2(dy, dx) * 180 / Math.PI;

          activePlanes.push({
            position: headPos,
            angle: -angle + 45, 
            id: f.id
          });
        }
      }
    });

    const flightLineLayer = new LineLayer({
      id: 'flight-line-layer',
      data: flightSegments,
      getSourcePosition: (d: any) => d.start,
      getTargetPosition: (d: any) => d.end,
      getWidth: 2, // Thinner line (was 4)
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
        radiusUnits: 'pixels', // Ensure radius is calculated in pixels
        radiusMinPixels: 1,
        updateTriggers: {
            data: [gameState.flights, currentTime]
        }
    });

    // 3. Planes
    const planeLayer = new TextLayer({
        id: 'plane-layer',
        data: activePlanes,
        getPosition: (d: any) => d.position,
        getText: d => '✈️',
        getSize: 28,
        getAngle: 0, 
        getSizeScale: 1,
        getColor: [255, 255, 255, 255],
        updateTriggers: {
            data: [currentTime, gameState.flights]
        }
    });

    // 4. Bubbles
    const bubbleLayer = new TextLayer({
        id: 'bubble-layer',
        data: gameState.bubbles,
        pickable: true,
        getPosition: (d: any) => d.coordinates,
        getText: d => '⛄',
        getSize: 48,
        getColor: [255, 255, 255, 255],
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
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

    return [geoLayer, flightLineLayer, capLayer, planeLayer, bubbleLayer];
  }, [geoData, gameState.provinces, gameState.bubbles, gameState.flights, currentTime, gameState.hasStarted, gameState.selectedProvince, onProvinceClick, onBubbleClick]);

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