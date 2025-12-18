import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
  
  const planeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (planeRef.current) {
      // Calculate position based on time
      const t = (state.clock.getElapsedTime() * 0.1 + route.progress) % 1;
      const pos = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      
      planeRef.current.position.copy(pos);
      planeRef.current.lookAt(pos.clone().add(tangent));
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

      {/* The Plane */}
      <mesh 
        ref={planeRef} 
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
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshBasicMaterial color={hovered ? "#F97316" : "#ffffff"} />
      </mesh>
    </group>
  );
};

const EarthMesh = () => {
  // Creating a particle sphere
  const particlesCount = 3000;
  const positions = useMemo(() => {
    const posArray = new Float32Array(particlesCount * 3);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    
    for(let i = 0; i < particlesCount; i++) {
        const y = 1 - (i / (particlesCount - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        
        posArray[i * 3] = x * GLOBE_RADIUS;
        posArray[i * 3 + 1] = y * GLOBE_RADIUS;
        posArray[i * 3 + 2] = z * GLOBE_RADIUS;
    }
    return posArray;
  }, []);

  return (
    <group>
        {/* Core Black Sphere to block background stars */}
        <Sphere args={[GLOBE_RADIUS - 0.05, 32, 32]}>
            <meshBasicMaterial color="#020617" />
        </Sphere>
        
        {/* Particle Cloud */}
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#1e293b" // Slate 800
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
            />
        </points>

        {/* Wireframe Overlay for structure */}
         <mesh>
            <sphereGeometry args={[GLOBE_RADIUS, 24, 24]} />
            <meshBasicMaterial color="#0f172a" wireframe transparent opacity={0.1} />
        </mesh>
        
        {/* Atmosphere Glow */}
        <mesh>
             <sphereGeometry args={[GLOBE_RADIUS + 0.2, 32, 32]} />
             <meshBasicMaterial 
                color="#0EA5E9" 
                transparent 
                opacity={0.05} 
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