import React from 'react';
import { GameStatus } from '../types';
import { Activity, RotateCcw, Coins, Users, Zap, Trophy, ShieldAlert, HeartHandshake, Keyboard } from 'lucide-react';

interface UIProps {
  status: GameStatus;
  scannedCount: number;
  coins: number;
  victoryCount: number;
  onRestart: () => void;
  onStartGame: () => void;
  isScanning: boolean;
  notification: string | null;
}

export const GameUI: React.FC<UIProps> = ({ status, scannedCount, coins, victoryCount, onRestart, onStartGame, isScanning, notification }) => {
  
  const cardBaseClass = "relative bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 text-white max-w-2xl w-full";

  if (status === GameStatus.TUTORIAL) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
        <div className={cardBaseClass}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-green-500/20 rounded-2xl text-green-400">
               <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">위선자 도시</h1>
              <p className="text-zinc-400 font-medium">진실을 스캔하고 시민을 구원하세요</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-green-500" /> 기본 조작
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-zinc-400 text-sm">이동</span><span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded shadow-inner">WASD</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-400 text-sm">전방 스캔</span><span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded shadow-inner">E</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-400 text-sm">아이템 (제거)</span><span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded shadow-inner">Q</span></div>
              </div>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HeartHandshake size={18} className="text-yellow-500" /> 승리 규칙
              </h2>
              <ul className="space-y-3 text-zinc-300 text-xs">
                <li className="flex gap-2"><span className="text-yellow-500">•</span> 시민을 스캔 후 접촉하여 <b>동전</b> 획득</li>
                <li className="flex gap-2"><span className="text-red-500">•</span> 동전이 0개인 상태에서 위선자에게 한 번 더 잡히면 병원 상담실로 끌려가 <b>패배</b>합니다.</li>
                <li className="flex gap-2"><span className="text-green-500">•</span> 동전 1개로 위선자 1명 <b>제거</b> 가능</li>
                <li className="flex gap-2"><span className="text-blue-500">•</span> 총 <b>10명</b>의 위선자 제거 시 승리</li>
              </ul>
            </div>
          </div>

          <div className="w-full py-5 bg-white/10 border border-white/20 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 animate-pulse">
            <Keyboard size={24} /> 아무 키나 눌러서 게임 시작
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.VICTORY) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md font-sans p-4">
        <div className={`${cardBaseClass} text-center border-yellow-500/50`}>
          <div className="inline-block p-6 bg-yellow-500/20 rounded-full text-yellow-500 mb-6">
            <Trophy size={64} />
          </div>
          <h1 className="text-5xl font-black mb-4 text-white uppercase tracking-tight">Victory</h1>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-medium">
            당신은 <span className="text-green-500 font-black">10명</span>의 위선자를 모두 제거하여<br />
            도시를 편견으로부터 구원했습니다.
          </p>
          <div className="flex items-center justify-center w-full py-5 bg-green-500/20 border border-green-500/50 text-green-400 font-black rounded-2xl shadow-xl animate-pulse text-lg gap-3">
            <Keyboard size={24} /> 스페이스 키를 눌러서 다시 시작하세요
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.COUNSELING) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md font-sans p-4">
        <div className={`${cardBaseClass} text-center border-red-500/50`}>
          <div className="text-7xl mb-6">🏥</div>
          <h1 className="text-4xl font-black mb-4 text-white">상담실 감금</h1>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
            모든 돈을 빼앗기고 사회적 편견의 감옥에 갇혔습니다.<br />
            "게임 중독자"라는 낙인이 찍힌 당신의 여행은 여기서 멈춥니다.
          </p>
          <div className="flex items-center justify-center w-full py-5 bg-red-600/20 border border-red-500/50 text-red-400 font-black rounded-2xl shadow-xl animate-pulse text-lg gap-3">
            <Keyboard size={24} /> 스페이스 키를 눌러서 다시 시작하세요
          </div>
        </div>
      </div>
    );
  }

  const canUseItem = coins > 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Controls Hint (Top-Left) */}
      {status === GameStatus.PLAYING && (
        <div className="absolute top-6 left-6 z-50 pointer-events-auto bg-zinc-950/70 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl">
          <h3 className="text-green-400 font-black text-xs uppercase tracking-widest mb-3 border-b border-white/10 pb-1">조작 키 안내</h3>
          <div className="space-y-2">
             <div className="flex items-center justify-between gap-6">
               <span className="text-zinc-400 text-[11px] font-bold">이동</span>
               <span className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">WASD</span>
             </div>
             <div className="flex items-center justify-between gap-6">
               <span className="text-zinc-400 text-[11px] font-bold">스캔</span>
               <span className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">E</span>
             </div>
             <div className="flex items-center justify-between gap-6">
               <span className="text-zinc-400 text-[11px] font-bold">위선자 제거 (동전 1개)</span>
               <span className="font-mono text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">Q</span>
             </div>
          </div>
        </div>
      )}

      {/* Scan Beam Effect */}
      {isScanning && (
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute bottom-[-10%] right-[10%] w-[160vh] h-[160vh] origin-bottom-right transform -rotate-[50deg] bg-gradient-to-t from-green-500/0 via-green-400/5 to-transparent mix-blend-screen" 
                  style={{ clipPath: 'polygon(50% 100%, 20% 0%, 80% 0%)' }}
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-green-500/30 rotate-[40deg] origin-bottom-right" />
         </div>
      )}

      {/* Notifications */}
      {notification && (
        <div key={notification} className="absolute top-[10%] left-1/2 -translate-x-1/2 animate-slide-in">
           <div className="bg-zinc-900/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl font-bold text-lg shadow-2xl border border-white/10 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xl">!</span> 
              {notification}
           </div>
        </div>
      )}

      {/* Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-green-400 shadow-[0_0_20px_#4ade80]' : 'bg-white/40'} transition-all duration-300`} />
        {isScanning && <div className="absolute w-20 h-20 border-2 border-green-500/20 rounded-full animate-ping" />}
      </div>

      {/* Handheld Device - Polished Visuals */}
      <div className="absolute bottom-[-30px] right-6 md:right-12 w-[340px] md:w-[400px] pointer-events-auto transition-all duration-500 hover:translate-y-[-20px] group">
        <div className="relative bg-zinc-900 rounded-[3rem] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[10px] border-zinc-800 transform rotate-[-1deg] group-hover:rotate-0 transition-transform duration-500">
          
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="w-20 h-2.5 bg-zinc-800 rounded-full shadow-inner"></div>
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
          </div>

          <div className="bg-[#050805] rounded-3xl overflow-hidden border-[6px] border-zinc-700 shadow-inner relative h-80 flex flex-col">
            <div className={`relative h-full p-5 flex flex-col justify-between font-mono ${isScanning ? 'bg-green-900/5' : ''}`}>
               {/* Scanlines Effect Overlay */}
               <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none"></div>
               
               <div className="flex justify-between items-center border-b border-white/5 pb-3 z-10">
                  <div className="text-green-500 font-black text-xs tracking-widest flex items-center gap-2">
                     <Activity size={14} className={isScanning ? "animate-spin" : "animate-pulse"} />
                     TRUTH_FINDER_v4
                  </div>
                  <div className="text-zinc-600 text-[9px] font-bold">LOCKED_CORE</div>
               </div>

               <div className="flex flex-col gap-3 py-4 z-10">
                  <div className="flex items-center justify-between bg-zinc-800/40 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500"><Coins size={20} /></div>
                          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Credits</span>
                      </div>
                      <span key={coins} className="text-3xl font-black text-white tabular-nums animate-pop">{coins}</span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-800/40 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><Trophy size={20} /></div>
                          <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Exposed</span>
                      </div>
                      <span key={victoryCount} className="text-3xl font-black text-white tabular-nums animate-pop">{victoryCount}<span className="text-xs text-zinc-600 ml-1">/10</span></span>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${canUseItem ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-zinc-800/20 border-white/5 text-zinc-700'}`}>
                      <div className="flex items-center gap-3">
                          <Zap size={20} className={canUseItem ? "animate-pulse" : ""} />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black leading-none uppercase">Cleaner [Q]</span>
                             <span className="text-[8px] opacity-40">Hypocrite Removal</span>
                          </div>
                      </div>
                      <span className="text-xs font-black uppercase">{canUseItem ? "READY" : "OFF"}</span>
                  </div>
               </div>

               <div className="z-10">
                   <div className={`text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isScanning ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
                       {isScanning ? "Scanning Matrix..." : "Awaiting Command"}
                   </div>
               </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center px-6 pb-2">
             <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] relative active:scale-95 transition-transform">
                 <div className="w-1.5 h-12 bg-zinc-700 rounded-full absolute"></div>
                 <div className="w-12 h-1.5 bg-zinc-700 rounded-full absolute"></div>
             </div>
             <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-red-700 shadow-[0_5px_0_rgba(153,27,27,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-red-950 font-black">B</div>
                 <div className="w-12 h-12 rounded-full bg-red-700 shadow-[0_5px_0_rgba(153,27,27,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center text-red-950 font-black">A</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};