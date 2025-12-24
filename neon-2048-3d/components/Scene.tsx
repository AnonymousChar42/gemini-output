import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Tile } from './Tile';
import { TileData } from '../types';
import { GRID_SIZE, CELL_SIZE, CELL_GAP } from '../constants';
import * as THREE from 'three';

interface SceneProps {
  tiles: TileData[];
}

const GridHelper: React.FC = () => {
  // Create a wireframe box to show the game boundary
  const totalSize = GRID_SIZE * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const offset = 0; // The tiles are centered already in Tile.tsx logic

  return (
    <group>
      <gridHelper args={[totalSize * 2, GRID_SIZE * 2, 0x222222, 0x111111]} position={[0, -totalSize/2 - 0.5, 0]} />
      <mesh>
        <boxGeometry args={[totalSize, totalSize, totalSize]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

// Ambient particles that float around
const FloatingParticles = () => {
    const count = 200;
    return (
        <Sparkles 
            count={count} 
            scale={12} 
            size={4} 
            speed={0.4} 
            opacity={0.5} 
            color="#00ffff"
        />
    );
}


export const Scene: React.FC<SceneProps> = ({ tiles }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [6, 6, 10], fov: 45 }}
      gl={{ antialias: false }} // Postprocessing handles AA better usually or we trade off
    >
      <color attach="background" args={['#050505']} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={20}
        autoRotate={false}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#00ffff" distance={10} />

      {/* Content */}
      <group>
        <GridHelper />
        <FloatingParticles />
        {tiles.map((tile) => (
          <Tile key={tile.id} data={tile} />
        ))}
      </group>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={2.0} 
            radius={0.4}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};