import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TreeProps {
  position?: [number, number, number];
}

const Star: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.6;
    const innerRadius = 0.25;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2; // Rotate to point up
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <extrudeGeometry args={[starShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }]} />
      <meshBasicMaterial color="#ffff00" toneMapped={false} />
    </mesh>
  );
};

const Ribbon: React.FC = () => {
  const curve = useMemo(() => {
    const points = [];
    const height = 10;
    const turns = 5;
    const count = 100;
    
    // Generate spiral points
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const y = t * height;
      // Radius: Base ~4.0 shrinking to 0.2 at top
      // Slightly larger than tree radius (3.5) to float outside
      const r = 4.0 * (1 - t) + 0.2; 
      // Angle: Spiral
      const angle = t * Math.PI * 2 * turns;
      points.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (matRef.current) {
      // Pulse effect for the light band
      const t = state.clock.getElapsedTime();
      // Oscillate brightness for glowing effect
      const lightness = 0.6 + Math.sin(t * 3) * 0.3; 
      // Warm Golden Light
      matRef.current.color.setHSL(0.12, 1, lightness);
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 128, 0.06, 8, false]} />
      <meshBasicMaterial ref={matRef} toneMapped={false} />
    </mesh>
  );
};

// Helper to rotate the ribbon along with the tree visually
const TreeRotator: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });
    return <group ref={groupRef}>{children}</group>;
}

const Tree: React.FC<TreeProps> = ({ position = [0, -2, 0] }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate a circular glow texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  // Generate tree particles
  const { positions, colors } = useMemo(() => {
    const particleCount = 2500;
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Logic for cone/tree shape
      // y goes from 0 (bottom) to 10 (top)
      const y = (i / particleCount) * 10;
      
      // Radius decreases as we go up
      // Base radius 4, top radius 0
      const radius = 3.5 * (1 - y / 10) + Math.random() * 0.5;
      
      // Spiral angle
      const angle = y * 8 + Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color logic: Mostly green, some red/gold ornaments
      const isOrnament = Math.random() > 0.92;
      if (isOrnament) {
        // Red, Gold, or Blue ornaments
        const ornamentType = Math.random();
        if (ornamentType < 0.33) colorObj.setHex(0xff0000); // Red
        else if (ornamentType < 0.66) colorObj.setHex(0xffd700); // Gold
        else colorObj.setHex(0x00ffff); // Cyan
      } else {
        // Various shades of green
        colorObj.setHSL(0.3 + Math.random() * 0.1, 0.8, 0.3 + Math.random() * 0.4);
      }

      cols[i * 3] = colorObj.r;
      cols[i * 3 + 1] = colorObj.g;
      cols[i * 3 + 2] = colorObj.b;
    }

    return { positions: pos, colors: cols };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Rotate the tree slowly
    pointsRef.current.rotation.y = time * 0.1;

    // Optional: Make particles shimmer
    const scale = 1 + Math.sin(time * 2) * 0.02;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25} // Increased size slightly for texture visibility
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture} // Apply circular texture
          alphaTest={0.01}
        />
      </points>

      {/* Ribbon that rotates with the tree */}
      <TreeRotator>
         <Ribbon />
      </TreeRotator>
      
      {/* 5-Pointed Star at the top, slightly higher */}
      <Star position={[0, 10.2, 0]} />

      {/* Tree Trunk */}
      {/* Position y=0.5 means center is at 0.5. Height 2. Extends from -0.5 to 1.5. 
          Floor is at -0.5, so this sits perfectly on floor and extends into the leaves. */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 2, 8]} />
        <meshStandardMaterial color="#4a2c18" roughness={0.8} />
      </mesh>
      
      <pointLight position={[0, 9, 0]} intensity={2} color="#ffaa00" distance={5} />
    </group>
  );
};

export default Tree;