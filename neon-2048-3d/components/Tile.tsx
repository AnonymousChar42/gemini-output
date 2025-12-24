import React, { useMemo, useRef } from 'react';
import { animated, useSpring, config } from '@react-spring/three';
import { Text, RoundedBox, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Mesh, DoubleSide } from 'three';
import { TileData } from '../types';
import { CELL_SIZE, CELL_GAP, TILE_COLORS, GRID_SIZE, TILE_EMISSIVE_INTENSITY } from '../constants';

interface TileProps {
  data: TileData;
}

// Visual effect component that triggers on mount
const MergeExplosion: React.FC<{ value: number; color: Color | string }> = ({ value, color }) => {
  // Determine scale of effect based on value (logarithmic scale)
  // 4 -> 2, 8 -> 3, ..., 2048 -> 11
  const power = Math.log2(value);
  const intensity = Math.max(1, power / 3); 
  const isHighValue = value >= 64;
  const isSuperValue = value >= 512;

  // Spring animation for the explosion
  const { scale, opacity, rotation } = useSpring({
    from: { scale: 0.1, opacity: 1, rotation: 0 },
    to: { scale: 1.5 + intensity * 0.3, opacity: 0, rotation: Math.PI / 2 },
    config: { tension: 150, friction: 15 },
  });

  return (
    <group>
      {/* Central Flash */}
      <animated.mesh scale={scale}>
         <sphereGeometry args={[CELL_SIZE * 0.4, 16, 16]} />
         <animated.meshBasicMaterial color={color} transparent opacity={opacity} />
      </animated.mesh>

      {/* Expanding Ring 1 (XY Plane) */}
      <animated.mesh scale={scale} rotation-z={rotation}>
        <ringGeometry args={[CELL_SIZE * 0.5, CELL_SIZE * 0.6, 32]} />
        <animated.meshBasicMaterial color={color} transparent opacity={opacity} side={DoubleSide} />
      </animated.mesh>

      {/* Expanding Ring 2 (YZ Plane) - for 3D feel */}
      <animated.mesh scale={scale} rotation-y={rotation}>
        <ringGeometry args={[CELL_SIZE * 0.5, CELL_SIZE * 0.6, 32]} />
        <animated.meshBasicMaterial color={color} transparent opacity={opacity} side={DoubleSide} />
      </animated.mesh>
      
      {/* High Value: Extra shockwave */}
      {isHighValue && (
        <animated.mesh scale={scale.to(s => s * 1.5)}>
             <sphereGeometry args={[CELL_SIZE * 0.5, 16, 16]} />
             <animated.meshBasicMaterial color={color} transparent opacity={opacity.to(o => o * 0.5)} wireframe />
        </animated.mesh>
      )}

      {/* Super Value: Spikes/Cross */}
      {isSuperValue && (
         <group>
             <animated.mesh scale={scale.to(s => s * 2)} rotation-x={rotation}>
                <boxGeometry args={[0.1, CELL_SIZE * 3, 0.1]} />
                <animated.meshBasicMaterial color="white" transparent opacity={opacity} />
             </animated.mesh>
             <animated.mesh scale={scale.to(s => s * 2)} rotation-y={rotation}>
                <boxGeometry args={[CELL_SIZE * 3, 0.1, 0.1]} />
                <animated.meshBasicMaterial color="white" transparent opacity={opacity} />
             </animated.mesh>
             <animated.mesh scale={scale.to(s => s * 2)} rotation-z={rotation}>
                <boxGeometry args={[0.1, 0.1, CELL_SIZE * 3]} />
                <animated.meshBasicMaterial color="white" transparent opacity={opacity} />
             </animated.mesh>
         </group>
      )}

      {/* Particle Burst */}
      <Sparkles 
        count={Math.floor(10 * intensity)} 
        scale={3 + intensity} 
        size={4 + intensity} 
        speed={0.4} 
        opacity={1} // Sparkles fade via their own lifecycle or we can't easily animate opacity prop on Sparkles wrapper directly cleanly without key change
        color={color} 
      />
    </group>
  );
};

export const Tile: React.FC<TileProps> = ({ data }) => {
  const { value, position, isMerged, isNew } = data;

  // Calculate physical position centering the grid
  const offset = (GRID_SIZE - 1) / 2;
  const x = (position[0] - offset) * (CELL_SIZE + CELL_GAP);
  const y = (position[1] - offset) * (CELL_SIZE + CELL_GAP);
  const z = (position[2] - offset) * (CELL_SIZE + CELL_GAP);

  const displayColor = useMemo(() => new Color(TILE_COLORS[value] || '#ffffff'), [value]);

  // Animation spring
  const { pos, scale } = useSpring({
    pos: [x, y, z],
    scale: isNew ? [0, 0, 0] : isMerged ? [1.1, 1.1, 1.1] : [1, 1, 1], // Subtle pop on tile itself
    config: { tension: 170, friction: 26 },
    from: { 
        scale: isNew ? [0,0,0] : [1,1,1]
    }
  });

  // Small continuous rotation for "floating" feel
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
        meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5 + position[1]) * 0.05;
    }
  });
  
  // Font size calculation based on number length
  const fontSize = value > 1000 ? 0.3 : value > 100 ? 0.4 : 0.5;

  return (
    <animated.group position={pos as any}>
      {/* The Visual Tile */}
      <animated.mesh ref={meshRef} scale={scale as any}>
        <RoundedBox args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color="#111111" // Dark base
            emissive={displayColor}
            emissiveIntensity={TILE_EMISSIVE_INTENSITY}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.9} 
          />
        </RoundedBox>
        
        {/* Text faces */}
        {[
            { pos: [0, 0, CELL_SIZE / 2 + 0.01], rot: [0, 0, 0] }, // Front
            { pos: [0, 0, -CELL_SIZE / 2 - 0.01], rot: [0, Math.PI, 0] }, // Back
            { pos: [CELL_SIZE / 2 + 0.01, 0, 0], rot: [0, Math.PI / 2, 0] }, // Right
            { pos: [-CELL_SIZE / 2 - 0.01, 0, 0], rot: [0, -Math.PI / 2, 0] }, // Left
            { pos: [0, CELL_SIZE / 2 + 0.01, 0], rot: [-Math.PI / 2, 0, 0] }, // Top
            { pos: [0, -CELL_SIZE / 2 - 0.01, 0], rot: [Math.PI / 2, 0, 0] }, // Bottom
        ].map((face, i) => (
            <Text
                key={i}
                position={face.pos as any}
                rotation={face.rot as any}
                fontSize={fontSize}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor={displayColor}
            >
            {value}
            </Text>
        ))}
      </animated.mesh>
      
      {/* Merge Effect (only renders when isMerged is true) */}
      {isMerged && <MergeExplosion value={value} color={displayColor} />}
    </animated.group>
  );
};