import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CITIES, ROUTES } from '../constants';
import { getPositionFromLatLong, getSplineFromCoords } from '../utils';
import { FlightRoute } from '../types';

interface Earth3DProps {
  onSelectFlight: (flight: FlightRoute | null) => void;
}

const GLOBE_RADIUS = 2;

const CityMarker: React.FC<{ cityKey: string; isHovered: boolean }> = ({ cityKey, isHovered }) => {
  const city = CITIES[cityKey];
  const pos = getPositionFromLatLong(city.coords.lat, city.coords.lng, GLOBE_RADIUS + 0.01);
  const color = city.type === 'hub' ? '#F97316' : '#0EA5E9'; // Orange for hubs, Blue for others

  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
      {city.type === 'hub' && (
        <Html distanceFactor={10}>
          <div className="pointer-events-none select-none text-[8px] font-tech text-white bg-black/50 px-1 rounded border border-orange-500/50">
            {city.name.split(' ')[0]}
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Detailed Plane Model - Tech/Monochrome Style
const PlaneModel = ({ color }: { color: string }) => {
  const isHovered = color === '#F97316';
  
  // Monochrome/Metallic Palette for non-hover state
  const baseColor = isHovered ? '#F97316' : '#F1F5F9';     // Slate 100 (White-ish)
  const secondaryColor = isHovered ? '#F97316' : '#CBD5E1'; // Slate 300 (Light Grey)
  const engineColor = isHovered ? '#FB923C' : '#94A3B8';    // Slate 400 (Grey)
  const cockpitColor = isHovered ? '#1E293B' : '#0F172A';   // Dark Slate

  return (
    <group>
      {/* Fuselage Group */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Main Body */}
        <mesh>
            <cylinderGeometry args={[0.011, 0.011, 0.10, 16]} />
            <meshBasicMaterial color={baseColor} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0.06, 0]}>
             <cylinderGeometry args={[0.001, 0.011, 0.02, 16]} />
             <meshBasicMaterial color={baseColor} />
        </mesh>
         {/* Tail Cone */}
        <mesh position={[0, -0.065, 0]}>
             <cylinderGeometry args={[0.011, 0.005, 0.03, 16]} />
             <meshBasicMaterial color={baseColor} />
        </mesh>
      </group>

      {/* Cockpit */}
      <mesh position={[0, 0.008, 0.055]} rotation={[0.4, 0, 0]}>
         <boxGeometry args={[0.009, 0.005, 0.012]} />
         <meshBasicMaterial color={cockpitColor} />
      </mesh>

      {/* Wings Group */}
      <group position={[0, -0.002, 0.015]}>
          {/* Left Wing */}
          <group position={[-0.018, 0, 0]}>
            <mesh rotation={[0, -0.4, 0]}>
                <boxGeometry args={[0.09, 0.002, 0.025]} />
                <meshBasicMaterial color={secondaryColor} />
            </mesh>
            {/* Engine Left */}
            <mesh position={[-0.025, -0.006, 0.01]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.004, 0.003, 0.015, 8]} />
                <meshBasicMaterial color={engineColor} />
            </mesh>
            {/* Winglet Left */}
             <mesh position={[-0.045, 0.005, -0.01]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.002, 0.015, 0.01]} />
                <meshBasicMaterial color={baseColor} />
            </mesh>
          </group>

          {/* Right Wing */}
          <group position={[0.018, 0, 0]}>
             <mesh rotation={[0, 0.4, 0]}>
                <boxGeometry args={[0.09, 0.002, 0.025]} />
                <meshBasicMaterial color={secondaryColor} />
            </mesh>
            {/* Engine Right */}
            <mesh position={[0.025, -0.006, 0.01]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.004, 0.003, 0.015, 8]} />
                <meshBasicMaterial color={engineColor} />
            </mesh>
             {/* Winglet Right */}
             <mesh position={[0.045, 0.005, -0.01]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[0.002, 0.015, 0.01]} />
                <meshBasicMaterial color={baseColor} />
            </mesh>
          </group>
      </group>

      {/* Tail Group */}
      <group position={[0, 0, -0.065]}>
        {/* Vertical Stabilizer */}
        <mesh position={[0, 0.025, 0]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.002, 0.05, 0.03]} />
            <meshBasicMaterial color={baseColor} />
        </mesh>
        
        {/* Horizontal Stabilizers */}
        <mesh position={[0, 0.005, -0.005]}>
             <boxGeometry args={[0.06, 0.002, 0.018]} />
             <meshBasicMaterial color={secondaryColor} />
        </mesh>
      </group>
    </group>
  );
};

const FlightPath: React.FC<{ 
  route: FlightRoute; 
  onSelect: (route: FlightRoute) => void; 
}> = ({ 
  route, 
  onSelect 
}) => {
  const startCity = CITIES[route.from];
  const endCity = CITIES[route.to];
  const curve = useMemo(() => getSplineFromCoords(startCity.coords, endCity.coords, GLOBE_RADIUS), [startCity, endCity]);
  const points = useMemo(() => curve.getPoints(50), [curve]);
  
  const planeGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Temporary vectors to avoid garbage collection
  const forwardRef = useRef(new THREE.Vector3());
  const upRef = useRef(new THREE.Vector3());
  const rightRef = useRef(new THREE.Vector3());
  const matrixRef = useRef(new THREE.Matrix4());

  useFrame((state) => {
    if (planeGroupRef.current) {
      // Calculate position based on time
      const t = (state.clock.getElapsedTime() * 0.05 + route.progress) % 1; 
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      
      // Calculate orientation matrix manually to ensure "up" is away from center
      const forward = forwardRef.current.copy(tangent);
      const up = upRef.current.copy(pos).normalize(); // Up is radial from sphere center
      const right = rightRef.current.crossVectors(up, forward).normalize();
      
      // Recalculate up to ensure orthogonality (Forward x Right)
      up.crossVectors(forward, right).normalize();
      
      // Create rotation matrix
      const matrix = matrixRef.current.makeBasis(right, up, forward);
      
      planeGroupRef.current.position.copy(pos);
      planeGroupRef.current.quaternion.setFromRotationMatrix(matrix);
    }
  });

  return (
    <group>
      {/* The Route Line */}
      <Line
        points={points}
        color={hovered ? '#ffffff' : '#0EA5E9'}
        opacity={hovered ? 1.0 : 0.3}
        transparent
        lineWidth={hovered ? 2 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(route)}
      />

      {/* The Plane Wrapper Group */}
      <group 
        ref={planeGroupRef} 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(route);
        }}
        onPointerOver={() => {
            document.body.style.cursor = 'pointer';
            setHovered(true);
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setHovered(false);
        }}
      >
        {/* Visual Model - Scaled down to 40% */}
        <group scale={[0.4, 0.4, 0.4]}>
            <PlaneModel color={hovered ? "#F97316" : "#ffffff"} />
        </group>
        
        {/* Invisible Hitbox for easier clicking - Kept large */}
        <mesh visible={false}>
            <sphereGeometry args={[0.06]} />
            <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </group>
  );
};

// Earth texture URL for sampling (Spec map usually has high contrast for land/sea)
const EARTH_TEXTURE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg';

const EarthMesh = () => {
  // Load the texture to use as a data source
  const earthMap = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URL);
  
  // Create particles based on the texture data
  const { positions, colors } = useMemo(() => {
    const particleCount = 45000; // High count for dense land
    const posArray = [];
    const colArray = [];
    
    // Create an off-screen canvas to read pixel data
    const canvas = document.createElement('canvas');
    canvas.width = earthMap.image.width;
    canvas.height = earthMap.image.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(earthMap.image, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Helper to get brightness at UV coordinates
        const isLand = (u: number, v: number) => {
            const x = Math.floor(u * canvas.width);
            const y = Math.floor((1 - v) * canvas.height); // Flip Y for canvas
            const index = (y * canvas.width + x) * 4;
            
            // In the specular map, Ocean is bright (white/grey) and Land is dark (black).
            // We want points on Land, so we check for LOW brightness.
            return data[index] < 50; 
        };

        const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
        
        for (let i = 0; i < particleCount; i++) {
            const y = 1 - (i / (particleCount - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;
            
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            
            // Convert to UV to check map
            // Note: UV mapping for sphere needs to match the texture's projection
            const u = (Math.atan2(x, z) / (2 * Math.PI)) + 0.5;
            const v = y * 0.5 + 0.5;

            if (isLand(u, v)) {
                posArray.push(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
                // Add some variation to color
                if (Math.random() > 0.8) {
                    colArray.push(0.8, 0.9, 1.0); // Bright white-blue
                } else {
                    colArray.push(0.05, 0.4, 0.8); // Darker tech blue
                }
            }
        }
    }

    return {
        positions: new Float32Array(posArray),
        colors: new Float32Array(colArray)
    };

  }, [earthMap]);

  return (
    <group>
        {/* Core Black Sphere to block background stars and provide contrast */}
        <Sphere args={[GLOBE_RADIUS - 0.05, 48, 48]}>
            <meshBasicMaterial color="#020617" />
        </Sphere>
        
        {/* Land Particles Group - Rotated to align with City Coordinates */}
        {/* Rotation Y: 90 degrees fixes the alignment between texture sampling and spherical coordinates */}
        <group rotation={[0, Math.PI / 2, 0]}>
            <points>
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
                    size={0.02}
                    vertexColors
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>

        {/* Wireframe Overlay for structure - make it very subtle */}
         <mesh>
            <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
            <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.05} />
        </mesh>
        
        {/* Atmosphere Glow */}
        <mesh>
             <sphereGeometry args={[GLOBE_RADIUS + 0.2, 48, 48]} />
             <meshBasicMaterial 
                color="#0EA5E9" 
                transparent 
                opacity={0.08} 
                side={THREE.BackSide} 
                blending={THREE.AdditiveBlending}
             />
        </mesh>
    </group>
  );
};

const Earth3D: React.FC<Earth3DProps> = ({ onSelectFlight }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#4f46e5" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f97316" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group rotation={[0, 0, 23.5 * Math.PI / 180]}> {/* Earth Tilt */}
        <EarthMesh />
        
        {Object.keys(CITIES).map((key) => (
          <CityMarker key={key} cityKey={key} isHovered={false} />
        ))}

        {ROUTES.map((route) => (
          <FlightPath 
            key={route.id} 
            route={route} 
            onSelect={onSelectFlight} 
          />
        ))}
      </group>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={3} 
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

export default Earth3D;