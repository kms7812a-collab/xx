import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NpcEntity, NpcType, GameStatus, Profession, CityBlock, NpcVisuals } from '../types';
import { checkWallCollision } from './Utils';
import { 
  PLAYER_SPEED, 
  SCAN_RANGE, 
  SCAN_ANGLE, 
  NPC_WALK_SPEED, 
  NPC_CHASE_SPEED, 
  CATCH_DISTANCE,
  INNOCENT_DIALOGUES,
  HYPOCRITE_DIALOGUES
} from '../constants';

// ==========================================
// LOW POLY NPC VISUAL COMPONENT
// ==========================================
const LowPolyHuman: React.FC<{ 
    profession: Profession, 
    isMoving: boolean, 
    visuals: NpcVisuals,
    colorOverride?: string,
    isWaving?: boolean
}> = ({ profession, isMoving, visuals, colorOverride, isWaving }) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Mesh>(null);
    const rightLegRef = useRef<THREE.Mesh>(null);
    const leftArmRef = useRef<THREE.Mesh>(null);
    const rightArmRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current || !groupRef.current) return;
        
        const baseScale = new THREE.Vector3(visuals.widthScale, visuals.heightScale, visuals.widthScale);

        if (colorOverride) {
            if (Math.random() < 0.05) {
                groupRef.current.scale.set(
                    baseScale.x + (Math.random() - 0.5) * 0.1,
                    baseScale.y + (Math.random() - 0.5) * 0.1,
                    baseScale.z + (Math.random() - 0.5) * 0.1
                );
            } else {
                groupRef.current.scale.copy(baseScale);
            }
        } else {
             groupRef.current.scale.copy(baseScale);
        }

        const t = state.clock.getElapsedTime();
        if (isWaving) {
            rightArmRef.current.rotation.x = Math.PI - 0.5;
            rightArmRef.current.rotation.z = Math.sin(t * 15) * 0.5 + 0.5;
            leftLegRef.current.rotation.x = 0;
            rightLegRef.current.rotation.x = 0;
        } else if (isMoving) {
            const speed = 10;
            const angle = Math.sin(t * speed) * 0.5;
            leftLegRef.current.rotation.x = angle;
            rightLegRef.current.rotation.x = -angle;
            leftArmRef.current.rotation.x = -angle;
            rightArmRef.current.rotation.x = angle;
            rightArmRef.current.rotation.z = 0; 
        } else {
            // Idle breathing
            const breathe = Math.sin(t * 2) * 0.02;
            leftLegRef.current.rotation.x = 0;
            rightLegRef.current.rotation.x = 0;
            leftArmRef.current.rotation.x = breathe;
            rightArmRef.current.rotation.x = breathe;
            rightArmRef.current.rotation.z = 0;
        }
    });

    const isDoctor = profession === Profession.DOCTOR;
    const coatColor = isDoctor ? "#f8fafc" : "#78350f"; 
    const pantsColor = isDoctor ? "#334155" : "#451a03"; 
    const shoeColor = "#222222";
    
    return (
        <group ref={groupRef}>
            {/* Head Group */}
            <group position={[0, 1.55, 0]}>
                {/* Main Head */}
                <mesh castShadow>
                    <boxGeometry args={[0.35, 0.4, 0.35]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} flatShading />
                </mesh>
                
                {/* Nose */}
                <mesh position={[0, 0, 0.18]}>
                    <boxGeometry args={[0.06, 0.1, 0.06]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} flatShading />
                </mesh>

                {/* Ears */}
                <mesh position={[0.18, 0, 0]}>
                    <boxGeometry args={[0.04, 0.1, 0.06]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} flatShading />
                </mesh>
                <mesh position={[-0.18, 0, 0]}>
                    <boxGeometry args={[0.04, 0.1, 0.06]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} flatShading />
                </mesh>

                {/* Face Details */}
                <group position={[0, 0, 0.18]}>
                    {/* Eyes */}
                    <mesh position={[-0.08, 0.08, 0.01]}>
                        <boxGeometry args={[0.05, 0.05, 0.02]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    <mesh position={[0.08, 0.08, 0.01]}>
                        <boxGeometry args={[0.05, 0.05, 0.02]} />
                        <meshStandardMaterial color="#000" />
                    </mesh>
                    {/* Eyebrows */}
                    <mesh position={[-0.08, 0.14, 0.01]}>
                        <boxGeometry args={[0.08, 0.02, 0.01]} />
                        <meshStandardMaterial color={visuals.hairColor} />
                    </mesh>
                    <mesh position={[0.08, 0.14, 0.01]}>
                        <boxGeometry args={[0.08, 0.02, 0.01]} />
                        <meshStandardMaterial color={visuals.hairColor} />
                    </mesh>
                    {/* Mouth */}
                    <mesh position={[0, -0.08, 0.01]}>
                        <boxGeometry args={[0.1, 0.02, 0.01]} />
                        <meshStandardMaterial color="#662222" />
                    </mesh>
                </group>

                {/* Hair */}
                <group position={[0, 0.15, 0]}>
                    {visuals.hairStyle === 0 && (
                        <mesh position={[0, 0.05, 0]}>
                            <boxGeometry args={[0.38, 0.15, 0.38]} />
                            <meshStandardMaterial color={visuals.hairColor} flatShading />
                        </mesh>
                    )}
                    {visuals.hairStyle === 1 && (
                        <group>
                            <mesh position={[0, 0.08, 0]}>
                                <boxGeometry args={[0.3, 0.25, 0.3]} />
                                <meshStandardMaterial color={visuals.hairColor} flatShading />
                            </mesh>
                            <mesh position={[0, 0.02, 0.15]}>
                                <boxGeometry args={[0.32, 0.1, 0.1]} />
                                <meshStandardMaterial color={visuals.hairColor} flatShading />
                            </mesh>
                        </group>
                    )}
                    {visuals.hairStyle === 2 && (
                        <mesh position={[0, 0.1, 0]}>
                            <cylinderGeometry args={[0.1, 0.2, 0.3, 5]} />
                            <meshStandardMaterial color={visuals.hairColor} flatShading />
                        </mesh>
                    )}
                    {visuals.hairStyle === 3 && (
                        <group>
                            <mesh position={[0, 0.05, 0]}>
                                <boxGeometry args={[0.42, 0.12, 0.42]} />
                                <meshStandardMaterial color={visuals.hairColor} flatShading />
                            </mesh>
                            <mesh position={[0.15, -0.15, -0.15]}>
                                <boxGeometry args={[0.1, 0.3, 0.1]} />
                                <meshStandardMaterial color={visuals.hairColor} flatShading />
                            </mesh>
                            <mesh position={[-0.15, -0.15, -0.15]}>
                                <boxGeometry args={[0.1, 0.3, 0.1]} />
                                <meshStandardMaterial color={visuals.hairColor} flatShading />
                            </mesh>
                        </group>
                    )}
                </group>
            </group>

            {/* Torso */}
            <group position={[0, 1.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.55, 0.65, 0.35]} />
                    <meshStandardMaterial color={colorOverride || coatColor} flatShading />
                </mesh>
                {/* Shirt/Tie detail */}
                <mesh position={[0, 0.15, 0.18]}>
                    <boxGeometry args={[0.15, 0.3, 0.02]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {!isDoctor && (
                   <mesh position={[0, 0.1, 0.19]}>
                       <boxGeometry args={[0.04, 0.2, 0.01]} />
                       <meshStandardMaterial color="#aa3333" />
                   </mesh>
                )}
                {/* Lapels for Doctor */}
                {isDoctor && (
                    <group>
                        <mesh position={[-0.1, 0.1, 0.18]} rotation={[0, 0, 0.2]}>
                            <boxGeometry args={[0.1, 0.4, 0.02]} />
                            <meshStandardMaterial color="#e2e8f0" />
                        </mesh>
                        <mesh position={[0.1, 0.1, 0.18]} rotation={[0, 0, -0.2]}>
                            <boxGeometry args={[0.1, 0.4, 0.02]} />
                            <meshStandardMaterial color="#e2e8f0" />
                        </mesh>
                    </group>
                )}
                {/* Buttons */}
                <mesh position={[0, -0.1, 0.18]}>
                    <boxGeometry args={[0.03, 0.03, 0.02]} />
                    <meshStandardMaterial color="#111111" />
                </mesh>
                <mesh position={[0, -0.25, 0.18]}>
                    <boxGeometry args={[0.03, 0.03, 0.02]} />
                    <meshStandardMaterial color="#111111" />
                </mesh>
            </group>

            {/* Arms */}
            <group position={[-0.35, 1.35, 0]}>
                <mesh ref={leftArmRef} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.65, 0.18]} />
                    <meshStandardMaterial color={colorOverride || coatColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.65, 0]}>
                    <boxGeometry args={[0.16, 0.1, 0.16]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} />
                </mesh>
            </group>
            <group position={[0.35, 1.35, 0]}>
                <mesh ref={rightArmRef} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.18, 0.65, 0.18]} />
                    <meshStandardMaterial color={colorOverride || coatColor} />
                </mesh>
                {/* Hand */}
                <mesh position={[0, -0.65, 0]}>
                    <boxGeometry args={[0.16, 0.1, 0.16]} />
                    <meshStandardMaterial color={colorOverride || visuals.skinColor} />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[-0.18, 0.8, 0]}>
                <mesh ref={leftLegRef} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.8, 0.22]} />
                    <meshStandardMaterial color={colorOverride || pantsColor} />
                </mesh>
                {/* Shoe */}
                <mesh position={[0, -0.85, 0.05]}>
                    <boxGeometry args={[0.24, 0.12, 0.35]} />
                    <meshStandardMaterial color={shoeColor} />
                </mesh>
            </group>
             <group position={[0.18, 0.8, 0]}>
                <mesh ref={rightLegRef} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.22, 0.8, 0.22]} />
                    <meshStandardMaterial color={colorOverride || pantsColor} />
                </mesh>
                {/* Shoe */}
                <mesh position={[0, -0.85, 0.05]}>
                    <boxGeometry args={[0.24, 0.12, 0.35]} />
                    <meshStandardMaterial color={shoeColor} />
                </mesh>
            </group>
        </group>
    )
}

// ==========================================
// PLAYER CONTROLLER
// ==========================================
interface PlayerProps {
  npcs: NpcEntity[];
  setNpcs: React.Dispatch<React.SetStateAction<NpcEntity[]>>;
  onScan: (scanStart: boolean) => void;
  onCatch: (id: string) => void;
  onUseItem: (pos: THREE.Vector3) => void;
  gameStatus: GameStatus;
  onScanSuccess: (innocentCount: number, isHypocrite: boolean) => void;
  resetTrigger: number;
  cityLayout: CityBlock[];
}

export const PlayerController: React.FC<PlayerProps> = ({ 
  npcs, 
  setNpcs, 
  onScan, 
  onCatch, 
  onUseItem,
  gameStatus,
  onScanSuccess,
  resetTrigger,
  cityLayout
}) => {
  const { camera } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    if (resetTrigger > 0) {
        camera.position.set(0, 1.7, 0);
        camera.lookAt(0, 1.7, -10);
    }
  }, [resetTrigger, camera]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(true); break;
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(true); break;
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(true); break;
        case 'ArrowRight':
        case 'KeyD': setMoveRight(true); break;
        case 'KeyE': handleScan(); break;
        case 'KeyQ': handleItemUse(); break;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': setMoveForward(false); break;
        case 'ArrowLeft':
        case 'KeyA': setMoveLeft(false); break;
        case 'ArrowDown':
        case 'KeyS': setMoveBackward(false); break;
        case 'ArrowRight':
        case 'KeyD': setMoveRight(false); break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [npcs, gameStatus, camera]);

  const handleScan = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    onScan(true);
    setTimeout(() => onScan(false), 300);

    const playerPos = camera.position;
    const playerDir = new THREE.Vector3();
    camera.getWorldDirection(playerDir);

    let hit = false;
    let foundHypocrite = false;
    let innocentCount = 0;

    const updatedNpcs = npcs.map(npc => {
      if (npc.isScanned || npc.isRemoved) return npc;
      const npcPos = npc.position.clone();
      const dist = playerPos.distanceTo(npcPos);
      if (dist < SCAN_RANGE) {
        const dirToNpc = npcPos.sub(playerPos).normalize();
        const angle = playerDir.dot(dirToNpc);
        if (angle > (1 - SCAN_ANGLE)) {
          hit = true;
          if (npc.type === NpcType.HYPOCRITE) { foundHypocrite = true; } 
          else { innocentCount++; }
          return { ...npc, isScanned: true };
        }
      }
      return npc;
    });

    if (hit) {
      setNpcs(updatedNpcs);
      onScanSuccess(innocentCount, foundHypocrite);
    }
  };

  const handleItemUse = () => {
    if (gameStatus !== GameStatus.PLAYING) return;
    onUseItem(camera.position);
  };

  useFrame((state, delta) => {
    if (gameStatus !== GameStatus.PLAYING) return;

    direction.current.z = Number(moveBackward) - Number(moveForward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.normalize();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const moveVector = new THREE.Vector3();
    if (moveForward) moveVector.add(forward);
    if (moveBackward) moveVector.sub(forward);
    if (moveLeft) moveVector.sub(right);
    if (moveRight) moveVector.add(right);

    if (moveVector.length() > 0) {
        moveVector.normalize().multiplyScalar(PLAYER_SPEED * delta);
        const currentPos = camera.position.clone();
        const nextPosX = currentPos.clone();
        nextPosX.x += moveVector.x;
        if (!checkWallCollision(nextPosX, cityLayout)) { camera.position.x += moveVector.x; }
        const nextPosZ = camera.position.clone();
        nextPosZ.z += moveVector.z;
        if (!checkWallCollision(nextPosZ, cityLayout)) { camera.position.z += moveVector.z; }
    }
    camera.position.y = 1.7; 
    if (camera.position.x > 45) camera.position.x = 45;
    if (camera.position.x < -45) camera.position.x = -45;
    if (camera.position.z > 45) camera.position.z = 45;
    if (camera.position.z < -45) camera.position.z = -45;
  });

  return (
    <PointerLockControls />
  );
};

// ==========================================
// NPC MANAGER
// ==========================================
interface NpcManagerProps {
  npcs: NpcEntity[];
  playerStatus: GameStatus;
  onCatch: (id: string) => void;
  onCollectInnocent: (id: string) => void;
  resetTrigger: number;
  cityLayout: CityBlock[];
}

export const NpcManager: React.FC<NpcManagerProps> = ({ npcs, playerStatus, onCatch, onCollectInnocent, resetTrigger, cityLayout }) => {
  const { camera } = useThree();

  return (
    <>
      {npcs.map(npc => !npc.isRemoved && (
        <IndividualNpc 
          key={npc.id} 
          data={npc} 
          playerPos={camera.position} 
          gameStatus={playerStatus} 
          onCatch={onCatch}
          onCollectInnocent={onCollectInnocent}
          resetTrigger={resetTrigger}
          cityLayout={cityLayout}
        />
      ))}
    </>
  );
};

// ==========================================
// INDIVIDUAL NPC LOGIC
// ==========================================
const IndividualNpc: React.FC<{ 
  data: NpcEntity; 
  playerPos: THREE.Vector3; 
  gameStatus: GameStatus;
  onCatch: (id: string) => void;
  onCollectInnocent: (id: string) => void;
  resetTrigger: number;
  cityLayout: CityBlock[];
}> = ({ data, playerPos, gameStatus, onCatch, onCollectInnocent, resetTrigger, cityLayout }) => {
  const ref = useRef<THREE.Group>(null);
  const [direction] = useState(new THREE.Vector3((Math.random()-0.5), 0, (Math.random()-0.5)).normalize());
  const [isMoving, setIsMoving] = useState(true);
  const [isWaving, setIsWaving] = useState(false);
  const lastTouchTime = useRef(0);

  const dialogueLine = useMemo(() => {
    const pool = data.type === NpcType.INNOCENT ? INNOCENT_DIALOGUES : HYPOCRITE_DIALOGUES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [data.type]);

  useFrame((state, delta) => {
    if (!ref.current || gameStatus !== GameStatus.PLAYING || data.isRemoved) return;

    const myPos = ref.current.position.clone();
    let speed = NPC_WALK_SPEED;
    setIsMoving(true);
    setIsWaving(false);
    
    let shouldChase = (data.type === NpcType.HYPOCRITE && data.isScanned);
    let reactionSlowdown = 1.0;
    const distToPlayer = myPos.distanceTo(playerPos);
    
    if (distToPlayer < 6 && !shouldChase) {
         ref.current.lookAt(playerPos.x, ref.current.position.y, playerPos.z);
         if (distToPlayer < 3.5) {
            reactionSlowdown = 0; 
            setIsWaving(true);
            setIsMoving(false);
         } else {
            reactionSlowdown = 0.3;
         }
    }

    if (shouldChase) {
      speed = NPC_CHASE_SPEED;
      ref.current.lookAt(playerPos.x, ref.current.position.y, playerPos.z);
      const chaseDir = new THREE.Vector3().subVectors(playerPos, myPos).normalize();
      const avoidanceForce = new THREE.Vector3();
      const lookAheadPos = myPos.clone().add(chaseDir.clone().multiplyScalar(2.5));
      for (const block of cityLayout) {
          if (block.type === 'building') {
              const blockPos = new THREE.Vector3(block.x, 0.75, block.z);
              if (blockPos.distanceTo(lookAheadPos) < (Math.max(block.width, block.depth)/2 + 2)) {
                  const awayFromWall = new THREE.Vector3().subVectors(myPos, blockPos).normalize();
                  avoidanceForce.add(awayFromWall.multiplyScalar(3.0));
              }
          }
      }
      const finalDir = new THREE.Vector3().addVectors(chaseDir, avoidanceForce).normalize();
      const moveVector = finalDir.multiplyScalar(speed * delta);
      const nextPosX = myPos.clone();
      nextPosX.x += moveVector.x;
      if (!checkWallCollision(nextPosX, cityLayout)) { ref.current.position.x += moveVector.x; }
      const nextPosZ = ref.current.position.clone();
      nextPosZ.z += moveVector.z;
      if (!checkWallCollision(nextPosZ, cityLayout)) { ref.current.position.z += moveVector.z; }
    } else if (reactionSlowdown > 0) {
      const nextPos = myPos.clone().addScaledVector(direction, speed * reactionSlowdown * delta);
      if (checkWallCollision(nextPos, cityLayout) || Math.abs(nextPos.x) > 45 || Math.abs(nextPos.z) > 45) {
          direction.x = (Math.random() - 0.5);
          direction.z = (Math.random() - 0.5);
          direction.normalize();
      } else {
          ref.current.position.copy(nextPos);
          if (!distToPlayer || distToPlayer >= 6) {
             ref.current.rotation.y = Math.atan2(direction.x, direction.z);
          }
      }
    }
    
    // Force height to 0 to prevent floating
    ref.current.position.y = 0;

    const dist2D = Math.hypot(playerPos.x - ref.current.position.x, playerPos.z - ref.current.position.z);
    if (dist2D < CATCH_DISTANCE) {
      const now = Date.now();
      if (now - lastTouchTime.current > 1000) {
          lastTouchTime.current = now;
          if (data.type === NpcType.INNOCENT && data.isScanned) {
              onCollectInnocent(data.id);
          } 
          else if (data.type === NpcType.HYPOCRITE && data.isScanned) {
              onCatch(data.id);
          }
      }
    }

    ref.current.rotation.x = 0;
    ref.current.rotation.z = 0;
    data.position.copy(ref.current.position);
  });

  useEffect(() => {
    if(ref.current) {
        ref.current.position.copy(data.position);
        ref.current.position.y = 0;
    }
  }, []);

  const highlightColor = data.isScanned 
    ? (data.type === NpcType.HYPOCRITE ? "#ef4444" : "#22c55e") 
    : undefined;

  return (
    <group ref={ref}>
        <LowPolyHuman 
            profession={data.profession} 
            isMoving={isMoving} 
            visuals={data.visuals}
            colorOverride={highlightColor}
            isWaving={isWaving}
        />
        {data.isScanned && (
            <group position={[0, 2.5, 0]}>
            {data.type === NpcType.HYPOCRITE ? (
                <Html center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className="bg-red-500 text-white border-2 border-red-400 rounded-2xl px-4 py-2 mb-3 whitespace-nowrap shadow-2xl animate-bounce">
                             <span className="text-sm font-black italic">"{dialogueLine}"</span>
                        </div>
                        <div className="text-red-500 font-bold text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">😈</div>
                    </div>
                </Html>
            ) : (
                <Html center distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className="bg-green-500 text-white border-2 border-green-400 rounded-2xl px-4 py-2 mb-3 whitespace-nowrap shadow-xl">
                             <span className="text-sm font-bold">"{dialogueLine}"</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] font-black uppercase">
                            Citizen
                        </div>
                    </div>
                </Html>
            )}
            </group>
        )}
    </group>
  );
}