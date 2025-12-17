import { Vector3 } from 'three';

export enum GameStatus {
  TUTORIAL = 'TUTORIAL',
  PLAYING = 'PLAYING',
  COUNSELING = 'COUNSELING',
  VICTORY = 'VICTORY',
}

export enum NpcType {
  INNOCENT = 'INNOCENT',
  HYPOCRITE = 'HYPOCRITE',
}

export enum Profession {
  DOCTOR = 'DOCTOR',
  TEACHER = 'TEACHER',
}

export interface NpcVisuals {
  skinColor: string;
  hairColor: string;
  hairStyle: number;
  heightScale: number;
  widthScale: number;
}

export interface NpcEntity {
  id: string;
  type: NpcType;
  profession: Profession;
  position: Vector3;
  velocity: Vector3;
  isScanned: boolean;
  isRemoved: boolean;
  color: string;
  visuals: NpcVisuals;
}

export interface GameState {
  status: GameStatus;
  npcs: NpcEntity[];
  scannedCount: number;
  coins: number;
}

export interface CityBlock {
  type: 'building' | 'sidewalk';
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color?: string;
}