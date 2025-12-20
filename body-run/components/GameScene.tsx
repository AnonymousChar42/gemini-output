import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Text } from '@react-three/drei';
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
  // Visual scaling based on weight. 
  const scaleXZ = 0.5 + (weight * 0.15); 
  
  return (
    <group position={position}>
      <group rotation={[isDead ? -Math.PI / 2 : 0, 0, 0]}>
         {/* Shadow blob */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
           <circleGeometry args={[scaleXZ * 0.5, 32]} />
           <meshBasicMaterial color="#000" opacity={0.2} transparent />
        </mesh>

        {/* Body (Sphere that gets wider) */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[PLAYER_BASE_SIZE, 32, 32]} />
          {/* Use scale to deform sphere to be wider */}
          <group scale={[scaleXZ, 1, scaleXZ]}>
             <meshStandardMaterial color={COLORS.SHIRT} />
          </group>
        </mesh>

        {/* Head (Scale slightly to match body bulkiness) */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.25 * (1 + weight * 0.02), 16, 16]} />
          <meshStandardMaterial color={COLORS.SKIN} />
        </mesh>

        {/* Arms (Stick out more if fat) */}
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

        {/* Floating Text for Status - Rotated 180deg Y to face camera */}
        <Text 
           position={[0, 2.5, 0]} 
           rotation={[0, Math.PI, 0]}
           fontSize={0.4} 
           color="black"
           anchorX="center" 
           anchorY="middle"
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
          {/* Bottom Bun */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_BUN} />
          </mesh>
          {/* Lettuce */}
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.05, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_LETTUCE} />
          </mesh>
          {/* Meat */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
            <meshStandardMaterial color={COLORS.BURGER_MEAT} />
          </mesh>
          {/* Top Bun */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={COLORS.BURGER_BUN} />
          </mesh>
        </group>
      );

    case ObstacleType.DUMBBELL:
      return (
        <group position={[object.x, 0.5, object.z]} rotation={[0, 0, Math.PI/4]}>
          {/* Handle */}
          <mesh castShadow>
             <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
             <meshStandardMaterial color={COLORS.DUMBBELL_HANDLE} />
          </mesh>
          {/* Weights */}
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
      // Two pillars close together. Squeezes fat players.
      const gap = 1.0; 
      return (
        <group position={[object.x, 0, object.z]}>
           {/* Left Pillar */}
           <mesh position={[-gap - 1, 1.5, 0]} castShadow>
             <boxGeometry args={[2, 3, 0.5]} />
             <meshStandardMaterial color={COLORS.NARROW_GATE} />
           </mesh>
           {/* Right Pillar */}
           <mesh position={[gap + 1, 1.5, 0]} castShadow>
             <boxGeometry args={[2, 3, 0.5]} />
             <meshStandardMaterial color={COLORS.NARROW_GATE} />
           </mesh>
           {/* Overhead Sign */}
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
      // A Heavy door in the middle. Need to be fat to break it.
      return (
        <group position={[object.x, 0, object.z]}>
           {/* Frame */}
           <mesh position={[-2.2, 1.5, 0]}>
             <boxGeometry args={[0.4, 3, 0.4]} />
             <meshStandardMaterial color="#444" />
           </mesh>
           <mesh position={[2.2, 1.5, 0]}>
             <boxGeometry args={[0.4, 3, 0.4]} />
             <meshStandardMaterial color="#444" />
           </mesh>
           {/* The Breakable Wall */}
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
      // Spikes on floor
      return (
        <group position={[object.x, 0, object.z]}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[2, 0.1, 1]} />
            <meshStandardMaterial color={COLORS.TRAP} />
          </mesh>
          {Array.from({length: 8}).map((_, i) => (
             <mesh key={i} position={[(i%4)*0.5 - 0.75, 0.2, Math.floor(i/4)*0.5 - 0.25]} rotation={[0,0,0]}>
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
  
  // Input State
  const inputMode = useRef<'keyboard' | 'mouse'>('mouse');
  const keys = useRef({ left: false, right: false });

  // Game Logic State Refs
  const state = useRef({
    z: 0,
    x: 0,
    weight: INITIAL_WEIGHT,
    score: 0,
    objects: [] as GameObject[],
  });

  // Setup Input Listeners
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

    const handleMouseMove = () => {
      inputMode.current = 'mouse';
    };
    
    // For touch devices, touchmove is better
    const handleTouchMove = () => {
       inputMode.current = 'mouse';
    };

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

  // Initialize Level
  useEffect(() => {
    if (gameState === GameState.START) {
      // Reset
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
      // Reset keys
      keys.current.left = false;
      keys.current.right = false;
    }
  }, [gameState, setPlayerState]);

  useFrame((clock, delta) => {
    if (gameState !== GameState.PLAYING) return;

    const s = state.current;

    // 1. Movement
    s.z += PLAYER_SPEED * delta;
    
    // Sideways Control Logic
    if (inputMode.current === 'keyboard') {
      const lateralSpeed = 8; // Speed for keyboard movement
      if (keys.current.left) {
        // Looking down +Z axis: +X is Left, -X is Right.
        // Left Key -> Go Left -> Increase X
        s.x += lateralSpeed * delta;
      }
      if (keys.current.right) {
        // Right Key -> Go Right -> Decrease X
        s.x -= lateralSpeed * delta;
      }
    } else {
      // Mouse/Touch Control
      // Pointer -1 (Left) -> Should be +X (Left)
      // Pointer +1 (Right) -> Should be -X (Right)
      const targetX = -(pointer.x * size.width / 100) * 1.5; 
      s.x = targetX;
    }
    
    // Clamp X position to track width
    s.x = Math.max(-TRACK_WIDTH / 2 + 0.5, Math.min(TRACK_WIDTH / 2 - 0.5, s.x));

    // 2. Collision Detection
    // Define player collider size based on weight
    const playerRadius = 0.3 + (s.weight * 0.05); // Grows with weight

    s.objects.forEach(obj => {
      if (!obj.active) return;
      
      const zDist = Math.abs(s.z - obj.z);
      const zThreshold = 0.5;

      if (zDist < zThreshold) {
        const xDist = Math.abs(s.x - obj.x);
        
        let hitDist = 0.5 + playerRadius; 
        if (obj.type === ObstacleType.NARROW_GATE || obj.type === ObstacleType.WIDE_GATE || obj.type === ObstacleType.FINISH) {
          hitDist = 2.0; // Gates span mostly center
        }

        if (xDist < hitDist) {
           handleCollision(obj);
        }
      }
    });

    // 3. Update Visuals
    if (playerRef.current) {
      playerRef.current.position.set(s.x, 0, s.z);
    }
    
    // Camera follow - adjust height and distance based on size to keep player in view
    if (cameraRef.current) {
      const camHeight = 5 + (s.weight * 0.15);
      const camDist = 8 + (s.weight * 0.1);
      const camPos = new THREE.Vector3(s.x * 0.2, camHeight, s.z - camDist);
      cameraRef.current.position.lerp(camPos, 0.1);
      cameraRef.current.lookAt(s.x * 0.1, 0, s.z + 5);
    }

    // 4. Check Failure Condition
    if (s.weight <= 0) {
      onGameOver();
    }

    // Sync React State for UI
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
        // Reduce weight but min 1 unless hit by trap or gate
        if (s.weight > 1) s.weight -= 1;
        s.score += 10;
        obj.active = false;
        break;

      case ObstacleType.TRAP:
        s.weight -= 2; // Big damage
        obj.active = false;
        if (s.weight <= 0) onGameOver();
        break;

      case ObstacleType.NARROW_GATE:
        if ((obj as any).processed) return;
        (obj as any).processed = true;

        if (s.weight <= NARROW_GATE_THRESHOLD) {
           // Success: Thin enough, easy pass
           s.score += 50;
        } else {
           // Squeeze: Too fat, lose weight but don't die (unless weight hits 0)
           const squeezeCost = 2;
           s.weight -= squeezeCost;
           if (s.weight <= 0) {
             onGameOver();
           } 
        }
        break;

      case ObstacleType.WIDE_GATE:
        if ((obj as any).processed) return;
        (obj as any).processed = true;

        if (s.weight >= WIDE_GATE_THRESHOLD) {
           // Success: Smash through
           s.score += 100; // Big bonus for smashing
        } else {
           // Fail: Too weak/small to break the door
           onGameOver();
        }
        break;

      case ObstacleType.FINISH:
        // Calculate final score with FAT BONUS
        const finalScore = s.score + (s.weight * WEIGHT_SCORE_MULTIPLIER);
        onGameWon(finalScore);
        break;
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 5, -8]} fov={50} />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      
      <group>
        <PlayerModel position={new THREE.Vector3(state.current.x, 0, state.current.z)} weight={state.current.weight} isDead={gameState === GameState.GAMEOVER} />
        
        {/* Render Level Objects */}
        {state.current.objects.map(obj => (
          <ObjectRenderer key={obj.id} object={obj} />
        ))}

        {/* Endless Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, state.current.z + 20]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={COLORS.GROUND_1} />
        </mesh>
        
        {/* Track Highlight */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, state.current.z + 20]} receiveShadow>
          <planeGeometry args={[TRACK_WIDTH, 100]} />
          <meshStandardMaterial color={COLORS.GROUND_2} />
        </mesh>
      </group>
      
      <Environment preset="park" />
    </>
  );
};

export const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <Canvas shadows className="w-full h-full touch-none">
      <color attach="background" args={['#fff7ed']} />
      <fog attach="fog" args={['#fff7ed', 10, 40]} />
      <GameContent {...props} />
    </Canvas>
  );
};