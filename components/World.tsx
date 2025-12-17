import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_SIZE, FOG_COLOR, FOG_DENSITY } from '../constants';
import { CityBlock } from '../types';

const LowPolyTree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1, 5]} />
        <meshStandardMaterial color="#5c4033" flatShading />
      </mesh>
      {/* Leaves */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#2d5a27" flatShading />
      </mesh>
    </group>
  );
};

const StreetLight: React.FC<{ position: [number, number, number], rotation?: number }> = ({ position, rotation = 0 }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const emissiveRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!lightRef.current || !emissiveRef.current) return;
    
    // Subtle flickering logic
    const t = state.clock.getElapsedTime();
    const noise = Math.sin(t * 10) * Math.cos(t * 13);
    const flicker = Math.random() > 0.98 ? 0.2 : 1.0;
    const baseIntensity = 2.0;
    
    const intensity = (baseIntensity + noise * 0.2) * flicker;
    lightRef.current.intensity = intensity;
    emissiveRef.current.emissiveIntensity = intensity;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[0.1, 4, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Arm */}
      <mesh position={[0.5, 3.8, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Light Bulb enclosure */}
      <mesh position={[1, 3.6, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial 
          ref={emissiveRef}
          color="#ffcc77" 
          emissive="#ffcc77" 
          emissiveIntensity={2} 
        />
      </mesh>
      {/* Light Source */}
      <pointLight ref={lightRef} position={[1, 3.0, 0]} distance={10} intensity={2} color="#ffaa00" decay={2} castShadow />
    </group>
  );
};

// Component that creates a dynamic "scanner flash" point light when scanning
const ScannerLight: React.FC<{ active: boolean }> = ({ active }) => {
  const { camera } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    
    // Target slightly in front of the camera
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const targetPos = camera.position.clone().add(direction.multiplyScalar(5));
    
    lightRef.current.position.copy(camera.position);
    lightRef.current.target.position.copy(targetPos);
    lightRef.current.target.updateMatrixWorld();

    if (active) {
      const t = state.clock.getElapsedTime();
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 15, 0.2);
      lightRef.current.angle = 0.5 + Math.sin(t * 20) * 0.1; // Pulsating beam
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
    }
  });

  return (
    <>
      <spotLight 
        ref={lightRef}
        color="#4ade80" 
        intensity={0} 
        distance={20} 
        angle={0.5} 
        penumbra={0.5} 
        decay={2}
        castShadow
      />
      <primitive object={lightRef.current?.target || new THREE.Object3D()} />
    </>
  );
};

interface WorldProps {
    layout: CityBlock[];
    isScanning: boolean;
}

export const World: React.FC<WorldProps> = ({ layout, isScanning }) => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Periodic city "breathing" light cycle
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = Math.sin(t * 0.1); // Very slow cycle
    
    if (ambientRef.current) {
        ambientRef.current.intensity = 0.2 + cycle * 0.1;
    }
    if (hemiRef.current) {
        hemiRef.current.intensity = 0.4 + cycle * 0.2;
        hemiRef.current.color.setHSL(0.6, 0.2, 0.5 + cycle * 0.1);
    }
    if (dirLightRef.current) {
        dirLightRef.current.intensity = 0.8 + cycle * 0.3;
        // Shift light angle slightly over time
        dirLightRef.current.position.x = 50 + Math.cos(t * 0.05) * 20;
    }
  });

  // Generate decor (Trees & Lights)
  const decor = useMemo(() => {
    const items = [];
    for (let i = 0; i < 20; i++) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.random() * 30 + 10;
        items.push(<LowPolyTree key={`tree-${i}`} position={[Math.cos(theta)*r, 0, Math.sin(theta)*r]} />);
    }
    return items;
  }, []);

  return (
    <group>
      {/* Sky & Fog */}
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      
      {/* Dynamic Global Lighting */}
      <ambientLight ref={ambientRef} intensity={0.3} /> 
      <hemisphereLight ref={hemiRef} args={["#ffffff", "#222222", 0.6]} />
      <directionalLight 
        ref={dirLightRef}
        position={[50, 80, 50]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60, 0.1, 200]} />
      </directionalLight>

      {/* Scanner Interaction Light */}
      <ScannerLight active={isScanning} />

      {/* Ground (Asphalt) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE * 3, CITY_SIZE * 3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* City Blocks */}
      {layout.map((item, i) => {
        if (item.type === 'sidewalk') {
            return (
                <mesh key={`sidewalk-${i}`} position={[item.x, 0.1, item.z]} receiveShadow>
                    <boxGeometry args={[item.width, 0.2, item.depth]} />
                    <meshStandardMaterial color="#aaaaaa" roughness={0.8} />
                </mesh>
            );
        }
        return (
            <group key={`bldg-${i}`} position={[item.x, item.height / 2, item.z]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[item.width, item.height, item.depth]} />
                <meshStandardMaterial color={item.color} flatShading />
              </mesh>
              {/* Dynamic Windows with slight flicker */}
              <BuildingWindows item={item} bldgIdx={i} />
            </group>
        );
      })}

      {/* Decor */}
      {decor}
      
      {/* Street Lights */}
      <StreetLight position={[10, 0, 10]} rotation={-Math.PI/4} />
      <StreetLight position={[-10, 0, -10]} rotation={Math.PI*0.75} />
      <StreetLight position={[10, 0, -10]} rotation={-Math.PI*0.75} />
      <StreetLight position={[-10, 0, 10]} rotation={Math.PI/4} />
      
      {/* Add more street lights in the distance for depth */}
      <StreetLight position={[25, 0, 0]} rotation={0} />
      <StreetLight position={[-25, 0, 0]} rotation={Math.PI} />
      <StreetLight position={[0, 0, 25]} rotation={Math.PI/2} />
      <StreetLight position={[0, 0, -25]} rotation={-Math.PI/2} />

    </group>
  );
};

// Sub-component for buildings to manage window flickering without re-rendering the whole world
const BuildingWindows: React.FC<{ item: CityBlock, bldgIdx: number }> = ({ item, bldgIdx }) => {
    const emissiveRef = useRef<THREE.MeshStandardMaterial>(null);
    const windowCount = Math.floor(item.height / 3);

    useFrame((state) => {
        if (!emissiveRef.current) return;
        const t = state.clock.getElapsedTime();
        // Unique frequency per building for non-uniform flickering
        const freq = 1 + (bldgIdx % 5) * 0.2;
        const noise = Math.sin(t * freq + bldgIdx);
        emissiveRef.current.emissiveIntensity = 0.5 + noise * 0.5;
    });

    return (
        <>
            {Array.from({length: windowCount}).map((_, idx) => (
                <mesh key={`win-${bldgIdx}-${idx}`} position={[0, -item.height/2 + (idx * 3) + 2, item.depth/2 + 0.05]}>
                    <boxGeometry args={[item.width * 0.8, 1, 0.1]} />
                    <meshStandardMaterial 
                        ref={idx === 0 ? emissiveRef : null}
                        color="#112233" 
                        emissive="#113355" 
                        emissiveIntensity={0.5} 
                    />
                </mesh>
            ))}
        </>
    );
};
