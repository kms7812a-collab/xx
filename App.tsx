import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { World } from './components/World';
import { PlayerController, NpcManager } from './components/Entities';
import { GameUI } from './components/UI';
import { GameStatus, NpcEntity, NpcType, NpcVisuals } from './types';
import { generateValidSpawnPosition, getRandomProfession, generateCityLayout } from './components/Utils';
import { NPC_COUNT, HYPOCRITE_PROBABILITY } from './constants';
import { soundManager } from './components/SoundManager';


const App: React.FC = () => {
  // Start in Tutorial state
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.TUTORIAL);
  const [npcs, setNpcs] = useState<NpcEntity[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [victoryCount, setVictoryCount] = useState(0); // Track removed hypocrites
  const [isScanning, setIsScanning] = useState(false);
  const [coins, setCoins] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isDamaged, setIsDamaged] = useState(false);


  const cityLayout = useMemo(() => generateCityLayout(), []);


  const SKIN_TONES = ["#ffdbac", "#f1c27d", "#e0ac69", "#8d5524", "#c68642"];
  const HAIR_COLORS = ["#090806", "#2c1608", "#b8a33c", "#e6e6e6", "#503020"];


  const generateNpcVisuals = (): NpcVisuals => ({
    skinColor: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    hairStyle: Math.floor(Math.random() * 5),
    heightScale: 0.92 + Math.random() * 0.18,
    widthScale: 0.88 + Math.random() * 0.24,
  });


  const initGame = useCallback(() => {
    const newNpcs: NpcEntity[] = [];
    for (let i = 0; i < NPC_COUNT; i++) {
      newNpcs.push({
        id: `npc-${i}`,
        type: Math.random() < HYPOCRITE_PROBABILITY ? NpcType.HYPOCRITE : NpcType.INNOCENT,
        profession: getRandomProfession(),
        position: generateValidSpawnPosition(cityLayout, i, NPC_COUNT),
        velocity: new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        isScanned: false,
        isRemoved: false,
        color: '#888888',
        visuals: generateNpcVisuals(),
      });
    }
    setNpcs(newNpcs);
    setScannedCount(0);
    setVictoryCount(0);
    setCoins(0);
    setNotification(null);
    setResetTrigger(prev => prev + 1);
    setIsDamaged(false);
  }, [cityLayout]);


  useEffect(() => {
    initGame();
  }, [initGame]);


  const startGame = useCallback(() => {
    if (gameStatus === GameStatus.TUTORIAL) {
      soundManager.init();
      soundManager.startAmbiance();
      setGameStatus(GameStatus.PLAYING);
    }
  }, [gameStatus]);


  const handleRestart = useCallback(() => {
    soundManager.init();
    initGame();
    setGameStatus(GameStatus.TUTORIAL);
  }, [initGame]);


  // Handle key presses for Tutorial Start (Any Key) and Game End Restarts (Space Only)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameStatus === GameStatus.TUTORIAL) {
        // Any key to start the game
        startGame();
      } else if (gameStatus === GameStatus.VICTORY || gameStatus === GameStatus.COUNSELING) {
        // Space key only to restart
        if (e.code === 'Space') {
          handleRestart();
        }
      }
    };


    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameStatus, startGame, handleRestart]);


  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };


  const handleScanSuccess = useCallback((innocentCount: number, isHypocriteFound: boolean) => {
    soundManager.playScan();
    if (isHypocriteFound) {
      setScannedCount(prev => prev + 1); 
      showNotification("위선자 발견! (주의하세요)");
    } else if (innocentCount > 0) {
      showNotification("시민 확인됨. (가까이 가서 위로를 받으러 가세요)");
    }
  }, []);


  const handleCollectInnocent = useCallback((npcId: string) => {
    setNpcs(currentNpcs => {
      const npc = currentNpcs.find(n => n.id === npcId);
      if (npc && npc.type === NpcType.INNOCENT && npc.isScanned && !npc.isRemoved) {
        soundManager.playCollect();
        showNotification("마음을 열어준 시민 (동전 +1)");
        setCoins(prev => prev + 1);
        return currentNpcs.map(n => n.id === npcId ? { ...n, isRemoved: true } : n);
      }
      return currentNpcs;
    });
  }, []);


  const handleUseItem = useCallback((playerPos: Vector3) => {
    if (coins <= 0) {
      showNotification("동전이 부족합니다.");
      return;
    }


    let targetId: string | null = null;
    let minDistance = 6; 


    npcs.forEach(npc => {
      if (npc.type === NpcType.HYPOCRITE && !npc.isRemoved) {
        const dist = npc.position.distanceTo(playerPos);
        if (dist < minDistance) {
          targetId = npc.id;
          minDistance = dist;
        }
      }
    });


    if (targetId) {
      soundManager.playItemUse();
      setCoins(prev => prev - 1);
      const nextVictoryCount = victoryCount + 1;
      setVictoryCount(nextVictoryCount);
      setNpcs(current => current.map(n => n.id === targetId ? { ...n, isRemoved: true } : n));
      showNotification("마음을 열어준 이들의 힘을 모아 위선자를 처치했습니다.");
      
      // Check Victory Condition
      if (nextVictoryCount >= 10) {
          soundManager.playVictory();
          document.exitPointerLock();
          setGameStatus(GameStatus.VICTORY);
      }
    } else {
      showNotification("범위 내에 위선자가 없습니다.");
    }
  }, [coins, npcs, victoryCount]);


  const handleCatch = useCallback((npcId: string) => {
    if (gameStatus !== GameStatus.PLAYING) return;


    setCoins(prevCoins => {
      if (prevCoins > 0) {
        soundManager.playCaught();
        showNotification("돈을 뺏겼습니다! (동전 -1)");
        setIsDamaged(true);
        setTimeout(() => setIsDamaged(false), 300);


        setNpcs(currentNpcs => currentNpcs.map(npc => {
            if (npc.id === npcId) {
                // NPC who steals a coin immediately disappears
                return { ...npc, isRemoved: true };
            }
            return npc;
        }));
        
        return prevCoins - 1;
      } else {
        soundManager.playCaught();
        document.exitPointerLock();
        setGameStatus(GameStatus.COUNSELING);
        return 0;
      }
    });
  }, [gameStatus]);


  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden">
      {isDamaged && (
          <div className="fixed inset-0 bg-red-600/30 z-[60] pointer-events-none animate-pulse"></div>
      )}


      {/* 2D UI Layer */}
      <GameUI 
        status={gameStatus} 
        scannedCount={scannedCount} 
        victoryCount={victoryCount}
        coins={coins}
        onRestart={handleRestart} 
        onStartGame={startGame}
        isScanning={isScanning}
        notification={notification}
      />


      {/* 3D Scene Layer */}
      <Canvas shadows camera={{ fov: 75, position: [0, 1.7, 0] }}>
        <World layout={cityLayout} isScanning={isScanning} />
        
        <PlayerController 
          npcs={npcs} 
          setNpcs={setNpcs} 
          onScan={setIsScanning}
          onCatch={handleCatch}
          gameStatus={gameStatus}
          onScanSuccess={handleScanSuccess}
          onUseItem={handleUseItem}
          resetTrigger={resetTrigger}
          cityLayout={cityLayout}
        />


        <NpcManager 
          npcs={npcs} 
          playerStatus={gameStatus} 
          onCatch={handleCatch}
          onCollectInnocent={handleCollectInnocent}
          resetTrigger={resetTrigger}
          cityLayout={cityLayout}
        />
      </Canvas>
    </div>
  );
};


export default App;
