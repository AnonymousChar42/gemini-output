import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { GameState, PlayerState, GameObject, ObstacleType } from '../types';
import { 
  TRACK_WIDTH, PLAYER_SPEED, COLORS, 
  PLAYER_BASE_SIZE, INITIAL_WEIGHT, NARROW_GATE_THRESHOLD, WIDE_GATE_THRESHOLD,
  WEIGHT_SCORE_MULTIPLIER
} from '../constants';
import { LevelGenerator } from './LevelGenerator';

interface GameSceneProps {
  gameState: GameState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  onGameOver: () => void;
  onGameWon: (score: number) => void;
}

// --- 3D Components ---

const PlayerModel: React.FC<{ 
  position: THREE.Vector3, 
  weight: number,
  isDead: boolean 
}> = ({ position, weight, isDead }) => {
  const scaleXZ = 0.5 + (weight * 0.15); 
  
  return (
    <group position={position}>
      <group rotation={[isDead ? -Math.PI / 2 : 0, 0, 0]}>
        {/* Body */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[PLAYER_BASE_SIZE, 32, 32]} />
          <group scale={[scaleXZ, 1, scaleXZ]}>
             <meshStandardMaterial color={COLORS.SHIRT} roughness={0.3} metalness={0.1} />
          </group>
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.25 * (1 + weight * 0.02), 16, 16]} />
          <meshStandardMaterial color={COLORS.SKIN} roughness={0.5} />
        </mesh>

        {/* Arms */}
        <group position={[scaleXZ * 0.4, 0.8, 0]}>
           <mesh rotation={[0, 0, -0.2]}>
              <capsuleGeometry args={[0.08, 0.5]} />
              <meshStandardMaterial color={COLORS.SKIN} />
           </mesh>
        </group>
        <group position={[-scaleXZ * 0.4, 0.8, 0]}>
           <mesh rotation={[0, 0, 0.2]}>
              <capsuleGeometry args={[0.08, 0.5]} />
              <meshStandardMaterial color={COLORS.SKIN} />
           </mesh>
        </group>

        {/* Status Text - Facing Camera at -Z */}
        <Text 
           position={[0, 2.5, 0]} 
           rotation={[0, Math.PI, 0]}
           fontSize={0.4} 
           color="black"
           anchorX="center" 
           anchorY="middle"
           font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          {weight} KG
        </Text>
      </group>
    </group>
  );
};

const ObjectRenderer: React.FC<{ object: GameObject }> = ({ object }) => {
  if (!object.active) return null;

  switch (object.type) {
    case ObstacleType.BURGER:
      return (
        <group position={[object.x, 0.5, object.z]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_BUN} />
          </mesh>
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_LETTUCE} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_MEAT} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={COLORS.BURGER_BUN} />
          </mesh>
        </group>
      );

    case ObstacleType.DUMBBELL:
      return (
        <group position={[object.x, 0.5, object.z]} rotation={[0, 0, Math.PI/4]}>
          <mesh castShadow>
             <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
             <meshStandardMaterial color={COLORS.DUMBBELL_HANDLE} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
             <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
             <meshStandardMaterial color={COLORS.DUMBBELL_GRAY} />
          </mesh>
          <mesh position={[0, -0.3, 0]} castShadow>
             <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
             <meshStandardMaterial color={COLORS.DUMBBELL_GRAY} />
          </mesh>
        </group>
      );

    case ObstacleType.NARROW_GATE:
      const gap = 1.0; 
      return (
        <group position={[object.x, 0, object.z]}>
           <mesh position={[-gap - 1, 1.5, 0]} castShadow>
             <boxGeometry args={[2, 3, 0.5]} />
             <meshStandardMaterial color={COLORS.NARROW_GATE} />
           </mesh>
           <mesh position={[gap + 1, 1.5, 0]} castShadow>
             <boxGeometry args={[2, 3, 0.5]} />
             <meshStandardMaterial color={COLORS.NARROW_GATE} />
           </mesh>
           <mesh position={[0, 2.5, 0]}>
             <boxGeometry args={[4, 0.5, 0.1]} />
             <meshStandardMaterial color="#333" />
           </mesh>
           <Text position={[0, 2.5, 0.1]} rotation={[0, Math.PI, 0]} fontSize={0.3} color="white">
             SQUEEZE ZONE
           </Text>
        </group>
      );

    case ObstacleType.WIDE_GATE:
      return (
        <group position={[object.x, 0, object.z]}>
           <mesh position={[-2.2, 1.5, 0]}>
             <boxGeometry args={[0.4, 3, 0.4]} />
             <meshStandardMaterial color="#444" />
           </mesh>
           <mesh position={[2.2, 1.5, 0]}>
             <boxGeometry args={[0.4, 3, 0.4]} />
             <meshStandardMaterial color="#444" />
           </mesh>
           <mesh position={[0, 1.5, 0]} castShadow>
             <boxGeometry args={[4, 3, 0.2]} />
             <meshStandardMaterial color={COLORS.WIDE_GATE} transparent opacity={0.8} />
           </mesh>
           <Text position={[0, 1.5, 0.2]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="white">
             POWER CHECK: {WIDE_GATE_THRESHOLD}
           </Text>
        </group>
      );

    case ObstacleType.TRAP:
      return (
        <group position={[object.x, 0, object.z]}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshStandardMaterial color={COLORS.TRAP} />
          </mesh>
          {Array.from({length: 8}).map((_, i) => (
             <mesh key={i} position={[(i%4)*0.5 - 0.75, 0.2, Math.floor(i/4)*0.5 - 0.25]}>
                <coneGeometry args={[0.1, 0.4, 8]} />
                <meshStandardMaterial color={COLORS.TRAP_SPIKE} />
             </mesh>
          ))}
        </group>
      );

    case ObstacleType.FINISH:
      return (
        <group position={[object.x, 0, object.z]}>
           <mesh position={[0, 0.05, 0]} receiveShadow>
             <boxGeometry args={[TRACK_WIDTH, 0.1, 2]} />
             <meshStandardMaterial color={COLORS.FINISH_LINE} />
           </mesh>
           <Text position={[0, 1, 0]} fontSize={1} color="black" rotation={[0, Math.PI, 0]}>
             FINISH
           </Text>
        </group>
      );
    default:
      return null;
  }
};

const GameContent: React.FC<GameSceneProps> = ({ gameState, setPlayerState, onGameOver, onGameWon }) => {
  const playerRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { size, pointer } = useThree();
  
  const inputMode = useRef<'keyboard' | 'mouse'>('mouse');
  const keys = useRef({ left: false, right: false });

  const state = useRef({
    z: 0,
    x: 0,
    weight: INITIAL_WEIGHT,
    score: 0,
    objects: [] as GameObject[],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keys.current.left = true;
        inputMode.current = 'keyboard';
      }
      if (e.key === 'ArrowRight') {
        keys.current.right = true;
        inputMode.current = 'keyboard';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
    };

    const handleMouseMove = () => { inputMode.current = 'mouse'; };
    const handleTouchMove = () => { inputMode.current = 'mouse'; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (gameState === GameState.START) {
      state.current.z = 0;
      state.current.x = 0;
      state.current.weight = INITIAL_WEIGHT;
      state.current.score = 0;
      state.current.objects = LevelGenerator(1); 
      setPlayerState({ 
        position: {x: 0, y: 0, z: 0}, 
        weight: INITIAL_WEIGHT, 
        score: 0 
      });
      keys.current.left = false;
      keys.current.right = false;
    }
  }, [gameState, setPlayerState]);

  useFrame((clock, delta) => {
    if (gameState !== GameState.PLAYING) return;

    const s = state.current;
    s.z += PLAYER_SPEED * delta;
    
    // Movement Logic: Camera looks toward +Z.
    // -X is Left, +X is Right.
    if (inputMode.current === 'keyboard') {
      const lateralSpeed = 8;
      if (keys.current.left) s.x -= lateralSpeed * delta;
      if (keys.current.right) s.x += lateralSpeed * delta;
    } else {
      // pointer.x is -1 (Left) to +1 (Right)
      const targetX = (pointer.x * size.width / 100) * 1.5; 
      s.x = targetX;
    }
    
    s.x = Math.max(-TRACK_WIDTH / 2 + 0.5, Math.min(TRACK_WIDTH / 2 - 0.5, s.x));

    const playerRadius = 0.3 + (s.weight * 0.05);

    s.objects.forEach(obj => {
      if (!obj.active) return;
      const zDist = Math.abs(s.z - obj.z);
      if (zDist < 0.5) {
        const xDist = Math.abs(s.x - obj.x);
        let hitDist = 0.5 + playerRadius; 
        if (obj.type === ObstacleType.NARROW_GATE || obj.type === ObstacleType.WIDE_GATE || obj.type === ObstacleType.FINISH) {
          hitDist = 2.0;
        }
        if (xDist < hitDist) handleCollision(obj);
      }
    });

    if (playerRef.current) playerRef.current.position.set(s.x, 0, s.z);
    
    if (cameraRef.current) {
      const camHeight = 5 + (s.weight * 0.15);
      const camDist = 8 + (s.weight * 0.1);
      const camPos = new THREE.Vector3(s.x * 0.2, camHeight, s.z - camDist);
      cameraRef.current.position.lerp(camPos, 0.1);
      cameraRef.current.lookAt(s.x * 0.1, 0, s.z + 5);
    }

    if (s.weight <= 0) onGameOver();

    setPlayerState({
      position: { x: s.x, y: 0, z: s.z },
      weight: s.weight,
      score: s.score
    });
  });

  const handleCollision = (obj: GameObject) => {
    const s = state.current;
    switch (obj.type) {
      case ObstacleType.BURGER:
        s.weight += 1;
        s.score += 10;
        obj.active = false;
        break;
      case ObstacleType.DUMBBELL:
        if (s.weight > 1) s.weight -= 1;
        s.score += 10;
        obj.active = false;
        break;
      case ObstacleType.TRAP:
        s.weight -= 2;
        obj.active = false;
        if (s.weight <= 0) onGameOver();
        break;
      case ObstacleType.NARROW_GATE:
        if ((obj as any).processed) return;
        (obj as any).processed = true;
        if (s.weight > NARROW_GATE_THRESHOLD) {
           s.weight -= 2;
           if (s.weight <= 0) onGameOver();
        } else {
           s.score += 50;
        }
        break;
      case ObstacleType.WIDE_GATE:
        if ((obj as any).processed) return;
        (obj as any).processed = true;
        if (s.weight >= WIDE_GATE_THRESHOLD) {
           s.score += 100;
        } else {
           onGameOver();
        }
        break;
      case ObstacleType.FINISH:
        onGameWon(s.score + (s.weight * WEIGHT_SCORE_MULTIPLIER));
        break;
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 5, -8]} fov={50} />
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 20, -5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />
      
      <group>
        <PlayerModel position={new THREE.Vector3(state.current.x, 0, state.current.z)} weight={state.current.weight} isDead={gameState === GameState.GAMEOVER} />
        {state.current.objects.map(obj => (
          <ObjectRenderer key={obj.id} object={obj} />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, state.current.z + 20]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={COLORS.GROUND_1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, state.current.z + 20]} receiveShadow>
          <planeGeometry args={[TRACK_WIDTH, 200]} />
          <meshStandardMaterial color={COLORS.GROUND_2} />
        </mesh>
      </group>
    </>
  );
};

export const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <Canvas shadows className="w-full h-full touch-none" gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#fff7ed']} />
      <fog attach="fog" args={['#fff7ed', 15, 45]} />
      <GameContent {...props} />
    </Canvas>
  );
};