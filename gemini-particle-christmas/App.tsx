import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Tree from './components/Tree';
import Fireworks from './components/Fireworks';
import Snow from './components/Snow';
import UI from './components/UI';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-slate-900 relative">
      <UI />
      
      {/* Changed camera Z position from 12 to 25 to start further away */}
      <Canvas camera={{ position: [0, 2, 25], fov: 60 }}>
        <color attach="background" args={['#050b14']} />
        
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
             <Tree />
             {/* Automatic fireworks managed internally by component now */}
             <Fireworks />
             <Snow />
             
             {/* Circular Floor with Reflections */}
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <circleGeometry args={[20, 64]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={60} // Strength of the reflection
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#101010"
                    metalness={0.5}
                    mirror={0.5} // Mirror intensity
                />
             </mesh>
          </group>

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="night" />

          {/* Post Processing for "Cool" Glow */}
          <EffectComposer disableNormalPass>
            <Bloom 
                luminanceThreshold={0.2} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
            />
          </EffectComposer>
        </Suspense>

        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
            minDistance={8}
            maxDistance={40} /* Increased max distance to allow wider view */
        />
      </Canvas>
    </div>
  );
};

export default App;