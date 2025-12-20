import React, { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, TextLayer } from '@deck.gl/layers';
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

// Deterministic color generation for "Political Map" feel
const getBaseColor = (name: string): [number, number, number] => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate distinct but muted dark colors
  const r = (hash & 0xFF) % 50 + 40;  // 40-90
  const g = ((hash >> 8) & 0xFF) % 50 + 40; // 40-90
  const b = ((hash >> 16) & 0xFF) % 50 + 60; // 60-110 (Slightly blueish)
  return [r, g, b];
};

export const GameMap: React.FC<GameMapProps> = ({ gameState, onProvinceClick, onBubbleClick, geoData }) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const layers = useMemo(() => {
    const geoLayer = new GeoJsonLayer({
      id: 'geojson-layer',
      data: geoData,
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      // Highlight selected province with a cyan border
      getLineColor: (d: any) => {
          return gameState.selectedProvince === d.properties.name 
            ? [0, 255, 255, 255] 
            : [255, 255, 255, 80];
      },
      getLineWidth: (d: any) => gameState.selectedProvince === d.properties.name ? 3 : 1,
      getFillColor: (d: any) => {
        const name = d.properties.name;
        const province = gameState.provinces[name];
        
        if (!province) return [20, 20, 20, 255]; // Loading

        const baseColor = getBaseColor(name);

        if (province.status === ProvinceStatus.LOCKED) {
           return [...baseColor, 200];
        }

        // Infection gradient: Mix Base with Red
        const intensity = province.infection / 100;
        
        // Linear interpolation between Base Color and Brand Red (230, 0, 18)
        const targetR = 230;
        const targetG = 0;
        const targetB = 18;

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
        // Only handle province click if we didn't click a bubble (bubble layer is on top)
        if (info.object) {
          onProvinceClick(info.object.properties.name);
        }
      }
    });

    // Use TextLayer for the Snowman Emoji
    const bubbleLayer = new TextLayer({
        id: 'bubble-layer',
        data: gameState.bubbles,
        pickable: true,
        getPosition: (d: any) => d.coordinates,
        getText: d => '⛄',
        getSize: 48, // Larger size for better visibility
        getColor: [255, 255, 255, 255], // White
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        // Note: WebGL text rendering often results in monochrome even for emojis.
        // It will look like a white snowman silhouette, which fits the theme well.
        characterSet: 'auto',
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

    return [geoLayer, bubbleLayer];
  }, [geoData, gameState.provinces, gameState.bubbles, gameState.hasStarted, gameState.selectedProvince, onProvinceClick, onBubbleClick]);

  return (
    <div className="w-full h-full relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
      <DeckGL
        viewState={viewState}
        onViewStateChange={e => setViewState(e.viewState)}
        controller={true}
        layers={layers}
        // Custom Cursor Logic: Only pointer if hovering over a bubble
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
        }}
      />
      {/* Start Game Overlay Prompt */}
      {!gameState.hasStarted && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-10 pointer-events-none">
          请点击地图选择第一家店的省份 ⛄
        </div>
      )}
    </div>
  );
};