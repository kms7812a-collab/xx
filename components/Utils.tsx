import { Vector3 } from 'three';
import { CITY_SIZE } from '../constants';
import { Profession, CityBlock } from '../types';

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Collision detection: Circle (Player/NPC) vs AABB (Building)
export const checkWallCollision = (nextPos: Vector3, layout: CityBlock[], padding: number = 0.5): boolean => {
  for (const block of layout) {
    if (block.type === 'building') {
      const minX = block.x - block.width / 2 - padding;
      const maxX = block.x + block.width / 2 + padding;
      const minZ = block.z - block.depth / 2 - padding;
      const maxZ = block.z + block.depth / 2 + padding;

      if (nextPos.x > minX && nextPos.x < maxX && nextPos.z > minZ && nextPos.z < maxZ) {
        return true; 
      }
    }
  }
  return false;
};

const findRandomValidPosition = (layout: CityBlock[]): Vector3 => {
  let attempt = 0;
  while (attempt < 100) {
    const x = randomRange(-CITY_SIZE / 2 + 2, CITY_SIZE / 2 - 2);
    const z = randomRange(-CITY_SIZE / 2 + 2, CITY_SIZE / 2 - 2);
    const pos = new Vector3(x, 0, z); // Changed from 0.75 to 0

    if (!checkWallCollision(pos, layout, 1.5)) {
      if (Math.abs(x) > 8 || Math.abs(z) > 8) {
        return pos;
      }
    }
    attempt++;
  }
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * 8;
  return new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r); // Changed from 0.75 to 0
};

export const generateValidSpawnPosition = (layout: CityBlock[], index: number = 0, total: number = 1): Vector3 => {
  const sectorSize = (Math.PI * 2) / total;
  const angleStart = index * sectorSize;
  
  let attempt = 0;
  while(attempt < 20) {
      const angle = angleStart + Math.random() * sectorSize;
      const radius = randomRange(15, CITY_SIZE/2 - 3); 
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const pos = new Vector3(x, 0, z); // Fixed height to ground
      
      if (!checkWallCollision(pos, layout, 1.5)) {
          return pos;
      }
      attempt++;
  }
  return findRandomValidPosition(layout);
};

export const getRandomProfession = (): Profession => {
  return Math.random() > 0.5 ? Profession.DOCTOR : Profession.TEACHER;
};

export const generateCityLayout = (): CityBlock[] => {
  const blocks: CityBlock[] = [];
  const streetWidth = 8;
  const blockSize = 15;
  const halfCity = CITY_SIZE / 2;
  
  for (let x = -halfCity + 10; x < halfCity - 10; x += blockSize + streetWidth) {
    for (let z = -halfCity + 10; z < halfCity - 10; z += blockSize + streetWidth) {
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

      const height = Math.random() * 15 + 8;
      const width = blockSize - 2;
      const depth = blockSize - 2;
      
      blocks.push({
        type: 'building',
        x: x + width/2,
        z: z + depth/2,
        width,
        depth,
        height,
        color: Math.random() > 0.5 ? '#2c2c2e' : '#1c1c1e' // Darker, cleaner buildings
      });

      blocks.push({
        type: 'sidewalk',
        x: x + width/2,
        z: z + depth/2,
        width: blockSize,
        depth: blockSize,
        height: 0.1 // Lowered sidewalk height
      });
    }
  }
  return blocks;
};