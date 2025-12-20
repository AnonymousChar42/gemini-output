import { GameObject, ObstacleType } from '../types';
import { TRACK_WIDTH } from '../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const LevelGenerator = (level: number): GameObject[] => {
  const objects: GameObject[] = [];
  let z = 10; // Start z

  const add = (type: ObstacleType, x: number, zPos: number, opts: Partial<GameObject> = {}) => {
    objects.push({
      id: generateId(),
      type,
      x,
      z: zPos,
      width: 1,
      active: true,
      ...opts
    });
  };

  // 1. Eat Burgers Phase
  for (let i = 0; i < 5; i++) {
    // Zig zag burgers
    const x = (i % 2 === 0) ? -1 : 1;
    add(ObstacleType.BURGER, x, z);
    add(ObstacleType.BURGER, 0, z + 2); // Extra food
    z += 5;
  }

  // 2. Wide Gate (Needs Fat)
  // Ensure player has eaten enough
  z += 5;
  add(ObstacleType.WIDE_GATE, 0, z, { width: TRACK_WIDTH });
  z += 10;

  // 3. Lose Weight Phase (Dumbbells)
  for (let i = 0; i < 4; i++) {
    add(ObstacleType.DUMBBELL, 0, z);
    add(ObstacleType.DUMBBELL, (i % 2 === 0 ? 1.5 : -1.5), z + 2);
    // Put traps on the side to force path
    add(ObstacleType.TRAP, (i % 2 === 0 ? -1.5 : 1.5), z + 2);
    z += 8;
  }

  // 4. Narrow Gate (Needs Thin)
  z += 5;
  add(ObstacleType.NARROW_GATE, 0, z, { width: TRACK_WIDTH });
  z += 10;

  // 5. Mixed Phase
  // Left: Burgers -> Wide Gate | Right: Dumbbells -> Narrow Gate
  // But linear path:
  add(ObstacleType.BURGER, -1, z);
  add(ObstacleType.BURGER, 0, z+2);
  add(ObstacleType.BURGER, 1, z+4);
  z += 10;
  
  // Final heavy door
  add(ObstacleType.WIDE_GATE, 0, z);
  
  z += 15;

  // Finish Line
  add(ObstacleType.FINISH, 0, z, { width: TRACK_WIDTH });

  return objects;
};