import { v4 as uuidv4 } from 'uuid';
import { GRID_SIZE, INITIAL_TILE_COUNT } from './constants';
import { TileData, Vector3 } from './types';

// Helper to check if a position is occupied
const getTileAt = (tiles: TileData[], x: number, y: number, z: number) => {
  return tiles.find(t => t.position[0] === x && t.position[1] === y && t.position[2] === z);
};

// Spawn a random tile (2 or 4)
export const spawnTile = (tiles: TileData[]): TileData[] => {
  const emptyPositions: Vector3[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (!getTileAt(tiles, x, y, z)) {
          emptyPositions.push([x, y, z]);
        }
      }
    }
  }

  if (emptyPositions.length === 0) return tiles;

  const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  const newTile: TileData = {
    id: uuidv4(),
    value: Math.random() < 0.9 ? 2 : 4,
    position: randomPos,
    isNew: true,
  };

  return [...tiles, newTile];
};

export const initializeGame = (): { tiles: TileData[], score: number } => {
  let tiles: TileData[] = [];
  for (let i = 0; i < INITIAL_TILE_COUNT; i++) {
    tiles = spawnTile(tiles);
  }
  return { tiles, score: 0 };
};

// Core logic to move tiles in 3D
// directionVector: [1,0,0] for Right, [-1,0,0] for Left, etc.
export const moveTiles = (
  currentTiles: TileData[],
  direction: Vector3
): { tiles: TileData[]; scoreIncrease: number; moved: boolean } => {
  let tiles = [...currentTiles];
  let scoreIncrease = 0;
  let moved = false;
  
  // Clean up 'isNew' and 'isMerged' flags
  tiles = tiles.map(t => ({ ...t, isNew: false, isMerged: false }));

  // Determine axes
  const dx = direction[0];
  const dy = direction[1];
  const dz = direction[2];

  // We need to iterate in the correct order to prevent double merging
  // If moving positive (e.g. x+), start from far end (3) to 0.
  // If moving negative (e.g. x-), start from 0 to 3.
  const range = [0, 1, 2, 3];
  const xIter = dx === 1 ? [...range].reverse() : range;
  const yIter = dy === 1 ? [...range].reverse() : range;
  const zIter = dz === 1 ? [...range].reverse() : range;

  // We process line by line.
  // A "line" is defined by the two constant axes. 
  // E.g. if moving in X, we iterate Y and Z as constants.

  // We'll create a 3D grid map to easily lookup/move tiles
  const grid: (TileData | null)[][][] = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null)
    )
  );

  // Populate grid
  tiles.forEach(t => {
    grid[t.position[0]][t.position[1]][t.position[2]] = t;
  });

  const mergedIds = new Set<string>();

  // Generic processing loops
  // The outer two loops iterate over the perpendicular plane
  // The inner loop iterates along the movement axis
  
  // To simplify, we can abstract the "line processing"
  // Let's iterate all "lines" in the movement direction
  
  const processLine = (get: (i: number) => TileData | null, set: (i: number, t: TileData | null) => void) => {
    let target = dx + dy + dz > 0 ? GRID_SIZE - 1 : 0;
    const step = dx + dy + dz > 0 ? -1 : 1;
    const start = dx + dy + dz > 0 ? GRID_SIZE - 1 : 0;
    const end = dx + dy + dz > 0 ? -1 : GRID_SIZE;

    // Collect tiles in this line
    const lineTiles: TileData[] = [];
    for (let i = start; i !== end; i += step) {
      const t = get(i);
      if (t) lineTiles.push(t);
    }

    if (lineTiles.length === 0) return;

    // Merge logic
    const newLineTiles: TileData[] = [];
    let skip = false;

    for (let i = 0; i < lineTiles.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }

      const current = lineTiles[i];
      const next = lineTiles[i + 1];

      if (next && current.value === next.value) {
        // Merge
        const mergedValue = current.value * 2;
        scoreIncrease += mergedValue;
        
        // We create a new tile for the merge result
        // But for animation, we want to keep the ID of one of them or handle it gracefully.
        // Simplest strategy for React Spring: Keep 'current' ID, update value. Delete 'next'.
        // Or create completely new tile.
        
        // Let's update 'current' to be the merged one
        const mergedTile: TileData = {
          ...current,
          value: mergedValue,
          isMerged: true,
        };
        
        // We need to mark 'next' as deleted/merged-into. 
        // In this functional logic, we just return the new state. 
        // To animate the "joining", both should travel to the destination, then swap.
        // This is complex for a single pass. 
        // Simplified: The 'current' tile moves to target, 'next' tile moves to target and disappears.
        // We will just return the survivor.
        
        newLineTiles.push(mergedTile);
        // We remove 'next' from the final array implicitly by skipping it
        skip = true;
      } else {
        newLineTiles.push(current);
      }
    }

    // Place back into grid
    let placeIdx = start;
    // Clear the line in the grid first
    for (let i = start; i !== end; i += step) {
      set(i, null);
    }

    newLineTiles.forEach(tile => {
      // Check if position changed
      const oldPos = tile.position;
      let newPos: Vector3 = [...oldPos] as Vector3;
      
      // Calculate new coords based on iteration axis
      if (dx !== 0) newPos[0] = placeIdx;
      if (dy !== 0) newPos[1] = placeIdx;
      if (dz !== 0) newPos[2] = placeIdx;

      if (newPos[0] !== oldPos[0] || newPos[1] !== oldPos[1] || newPos[2] !== oldPos[2]) {
        moved = true;
      }

      tile.position = newPos;
      set(placeIdx, tile);
      placeIdx += step;
    });
  };

  // Run processing along X
  if (dx !== 0) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        processLine(
          (x) => grid[x][y][z],
          (x, t) => grid[x][y][z] = t
        );
      }
    }
  }
  // Run along Y
  else if (dy !== 0) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        processLine(
          (y) => grid[x][y][z],
          (y, t) => grid[x][y][z] = t
        );
      }
    }
  }
  // Run along Z
  else if (dz !== 0) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        processLine(
          (z) => grid[x][y][z],
          (z, t) => grid[x][y][z] = t
        );
      }
    }
  }

  // Reconstruct flat array
  const finalTiles: TileData[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (grid[x][y][z]) {
          finalTiles.push(grid[x][y][z]!);
        }
      }
    }
  }

  return { tiles: finalTiles, scoreIncrease, moved };
};

export const checkGameOver = (tiles: TileData[]): boolean => {
  // If grid is not full, not game over
  if (tiles.length < GRID_SIZE * GRID_SIZE * GRID_SIZE) return false;

  // Check for any possible merges
  // Check neighbors in all 3 directions for every tile
  const grid: (TileData | null)[][][] = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null)
    )
  );
  tiles.forEach(t => grid[t.position[0]][t.position[1]][t.position[2]] = t);

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const current = grid[x][y][z];
        if (!current) continue; // Should not happen if full
        
        const neighbors = [
          { dx: 1, dy: 0, dz: 0 },
          { dx: 0, dy: 1, dz: 0 },
          { dx: 0, dy: 0, dz: 1 }
        ];

        for (const n of neighbors) {
          const nx = x + n.dx;
          const ny = y + n.dy;
          const nz = z + n.dz;
          
          if (nx < GRID_SIZE && ny < GRID_SIZE && nz < GRID_SIZE) {
            const neighbor = grid[nx][ny][nz];
            if (neighbor && neighbor.value === current.value) return false;
          }
        }
      }
    }
  }

  return true;
};
