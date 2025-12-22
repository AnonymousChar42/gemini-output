import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { FireworkExplosion, FireworkParticle } from '../types';

interface FireworksProps {
  trigger?: boolean;
  colorOverride?: string;
}

const Fireworks: React.FC<FireworksProps> = ({ trigger, colorOverride }) => {
  const [explosions, setExplosion] = useState<FireworkExplosion[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate circular glow texture for fireworks
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Trigger new explosion prop-based
  useEffect(() => {
    if (trigger) {
      createExplosion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // Random periodic fireworks - FASTER FREQUENCY
  useEffect(() => {
    const interval = setInterval(() => {
        // 60% chance every 600ms
        if (Math.random() > 0.4) {
            createExplosion();
        }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const createExplosion = () => {
    const particleCount = 100;
    const newParticles: FireworkParticle[] = [];
    
    // Spread out the launch area
    const rootX = (Math.random() - 0.5) * 15;
    const rootY = 5 + Math.random() * 8;
    const rootZ = (Math.random() - 0.5) * 8;
    
    // RICHER COLORS: Use HSL for full spectrum variety + some pastels
    let baseColorString: string;
    
    if (colorOverride) {
        baseColorString = colorOverride;
    } else {
        const color = new THREE.Color();
        // High saturation, variable lightness for "shiny" look
        color.setHSL(Math.random(), 0.8 + Math.random() * 0.2, 0.4 + Math.random() * 0.4); 
        baseColorString = "#" + color.getHexString();
    }

    for (let i = 0; i < particleCount; i++) {
      const speed = 0.05 + Math.random() * 0.25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      newParticles.push({
        id: uuidv4(),
        x: rootX,
        y: rootY,
        z: rootZ,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.sin(phi) * Math.sin(theta) * speed,
        vz: Math.cos(phi) * speed,
        color: baseColorString,
        life: 1.0 + Math.random() * 0.5,
        size: 0.2 + Math.random() * 0.3
      });
    }

    const explosion: FireworkExplosion = {
      id: uuidv4(),
      particles: newParticles,
      createdAt: Date.now()
    };

    setExplosion(prev => [...prev, explosion]);
  };

  useFrame((state, delta) => {
    setExplosion(prev => 
      prev.map(exp => {
        // Update particles
        const updatedParticles = exp.particles.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          z: p.z + p.vz,
          vy: p.vy - 0.003, // Slightly heavier gravity
          life: p.life - delta * 0.8, // Decay
        })).filter(p => p.life > 0);

        return { ...exp, particles: updatedParticles };
      }).filter(exp => exp.particles.length > 0)
    );
  });

  return (
    <group ref={groupRef}>
      {explosions.map(exp => 
        exp.particles.map(p => (
           <mesh key={p.id} position={[p.x, p.y, p.z]} scale={[p.life, p.life, p.life]}>
             <planeGeometry args={[p.size, p.size]} />
             <meshBasicMaterial 
                color={p.color} 
                transparent 
                opacity={p.life} 
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                map={particleTexture} // Circular texture
                depthWrite={false}
             />
           </mesh>
        ))
      )}
    </group>
  );
};

export default Fireworks;
