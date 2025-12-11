import React, { useState, useEffect, useRef } from 'react';
import Logo from './components/Logo';
import Confetti from './components/Confetti';
import { generateNamesWithAI } from './services/geminiService';

// Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"></path></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const HashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
);

type Mode = 'names' | 'numbers';

export default function App() {
  const [mode, setMode] = useState<Mode>('names');
  
  // Names Mode State
  const [namesText, setNamesText] = useState('');
  const [namesList, setNamesList] = useState<string[]>([]);
  
  // Numbers Mode State
  const [numMin, setNumMin] = useState<number>(1);
  const [numMax, setNumMax] = useState<number>(100);

  // Shared State
  const [winners, setWinners] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rollingName, setRollingName] = useState(''); 
  const [quantity, setQuantity] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Handlers ---

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNamesText(text);
    const list = text.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);
    setNamesList(list);
  };

  // Ensure quantity is valid for the current pool
  const maxQuantity = mode === 'names' 
    ? Math.max(1, namesList.length) 
    : Math.max(1, (numMax - numMin + 1));

  useEffect(() => {
    if (quantity > maxQuantity && maxQuantity > 0) {
      setQuantity(maxQuantity);
    } else if (quantity === 0) {
      setQuantity(1);
    }
  }, [maxQuantity, quantity, namesList.length, numMax, numMin, mode]);

  const incrementQuantity = () => {
    if (quantity < maxQuantity) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const clearAll = () => {
    setNamesText('');
    setNamesList([]);
    setWinners([]);
    setQuantity(1);
    setShowConfetti(false);
    // Keep range as is
  };

  const handleAIImport = async () => {
    setLoadingAI(true);
    try {
      const generatedNames = await generateNamesWithAI("nomes variados para sorteio");
      const currentList = namesList;
      const newList = [...new Set([...currentList, ...generatedNames])]; 
      setNamesList(newList);
      setNamesText(newList.join('\n'));
    } catch (err) {
      alert("Não foi possível gerar nomes. Verifique sua chave de API.");
    } finally {
      setLoadingAI(false);
    }
  };

  // --- Drawing Logic ---

  const canDraw = () => {
    if (isDrawing) return false;
    if (mode === 'names') return namesList.length > 0;
    if (mode === 'numbers') return numMax >= numMin;
    return false;
  };

  const drawWinner = () => {
    if (!canDraw()) return;
    
    setIsDrawing(true);
    setWinners([]);
    setShowConfetti(false);

    let counter = 0;
    const maxIterations = 30;
    
    const interval = setInterval(() => {
      let preview;
      if (mode === 'names') {
        preview = namesList[Math.floor(Math.random() * namesList.length)];
      } else {
        preview = Math.floor(Math.random() * (numMax - numMin + 1) + numMin).toString();
      }
      setRollingName(preview);
      counter++;

      if (counter > maxIterations) {
        clearInterval(interval);
        finishDraw();
      }
    }, 80);
  };

  const finishDraw = () => {
    let result: string[] = [];

    if (mode === 'names') {
      const shuffled = [...namesList].sort(() => 0.5 - Math.random());
      result = shuffled.slice(0, quantity);
    } else {
      // Draw unique numbers
      const pool = [];
      for (let i = numMin; i <= numMax; i++) pool.push(i);
      
      const shuffled = pool.sort(() => 0.5 - Math.random());
      result = shuffled.slice(0, quantity).map(String);
    }
    
    setWinners(result);
    setIsDrawing(false);
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-4 md:p-8 flex flex-col items-center relative overflow-hidden font-sans">
      
      <Confetti active={showConfetti} />

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        
        <Logo />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Left Column: Configuration */}
          <div className="glass p-6 rounded-2xl shadow-2xl shadow-red-950/50 flex flex-col h-full border-t border-red-800/30">
            
            {/* Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
              <button 
                onClick={() => { setMode('names'); setWinners([]); setShowConfetti(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'names' ? 'bg-red-900 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <UsersIcon /> Nomes
              </button>
              <button 
                onClick={() => { setMode('numbers'); setWinners([]); setShowConfetti(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'numbers' ? 'bg-red-900 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <HashIcon /> Números
              </button>
            </div>

            {mode === 'names' ? (
              <>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-100">
                  <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                  Participantes
                </h2>
                
                <div className="flex-grow mb-4 relative">
                  <textarea 
                    ref={textareaRef}
                    className="w-full h-64 md:h-80 bg-black/40 border border-red-900/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
                    placeholder="Digite os nomes aqui, um por linha..."
                    value={namesText}
                    onChange={handleTextChange}
                  ></textarea>
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/60 px-2 py-1 rounded-md">
                    {namesList.length} nomes
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleAIImport}
                    disabled={loadingAI || isDrawing}
                    className="flex-1 bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-100 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                  >
                    {loadingAI ? 'Gerando...' : (
                      <>
                        <SparklesIcon /> Auto Preencher
                      </>
                    )}
                  </button>
                  <button 
                    onClick={clearAll}
                    disabled={isDrawing || namesList.length === 0}
                    className="px-4 bg-black/40 hover:bg-black/60 border border-gray-700/50 text-gray-300 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                    title="Limpar nomes"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-100">
                  <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                  Intervalo
                </h2>
                
                <div className="flex-grow flex flex-col justify-center gap-6 p-4">
                   <div className="flex flex-col gap-2">
                     <label className="text-sm text-gray-400 font-semibold">Número Inicial (De)</label>
                     <input 
                        type="number" 
                        value={numMin} 
                        onChange={(e) => setNumMin(Number(e.target.value))}
                        className="bg-black/40 border border-red-900/50 rounded-xl p-4 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-600"
                     />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-sm text-gray-400 font-semibold">Número Final (Até)</label>
                     <input 
                        type="number" 
                        value={numMax} 
                        onChange={(e) => setNumMax(Number(e.target.value))}
                        className="bg-black/40 border border-red-900/50 rounded-xl p-4 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-600"
                     />
                   </div>
                   <div className="text-center text-gray-500 text-sm mt-4">
                     Total de números: <span className="text-white font-bold">{Math.max(0, numMax - numMin + 1)}</span>
                   </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Actions & Display */}
          <div className="flex flex-col gap-6">
            
            {/* Draw Area */}
            <div className="glass p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center min-h-[300px] border-t border-red-800/30 relative overflow-hidden transition-all duration-500">
               {/* Shine effect */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

               {winners.length === 0 && !isDrawing && (
                  <div className="text-gray-400 flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/40">
                      <span className="text-4xl">{mode === 'numbers' ? '123' : '?'}</span>
                    </div>
                    <p className="font-light">
                      {mode === 'names' ? 'Aguardando sorteio de nomes...' : 'Aguardando sorteio numérico...'}
                    </p>
                  </div>
               )}

               {isDrawing && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="text-lg text-red-400 font-semibold tracking-wider uppercase">Sorteando</div>
                    <div className="text-5xl md:text-6xl font-black text-white tracking-tight scale-110 transition-all duration-75">
                      {rollingName}
                    </div>
                 </div>
               )}

               {winners.length > 0 && !isDrawing && (
                 <div className="w-full h-full flex flex-col items-center max-h-[350px] overflow-y-auto">
                    <div className="text-sm font-bold text-red-500 tracking-[0.2em] uppercase mb-4 sticky top-0 bg-black/0 backdrop-blur-sm w-full py-2 z-10">
                      {winners.length > 1 ? 'Vencedores' : 'Vencedor(a)'}
                    </div>
                    
                    {winners.length === 1 ? (
                       <div className="flex flex-col items-center animate-[bounce_1s_infinite] my-auto">
                          <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-[0_5px_5px_rgba(255,0,0,0.5)]">
                            {winners[0]}
                          </div>
                          <div className="mt-6 text-sm text-gray-400">Parabéns!</div>
                       </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {winners.map((winnerName, idx) => (
                           <div key={idx} className="bg-gradient-to-br from-red-900/80 to-black border border-red-700/50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[120px] justify-center transform hover:scale-105 transition-transform">
                              <span className="text-red-400 font-bold text-lg">#{idx + 1}</span>
                              <span className="text-2xl font-bold text-white">{winnerName}</span>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Quantity Control & Action Button */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between glass px-4 py-3 rounded-xl border-t border-red-800/30">
                  <span className="text-sm text-gray-300 font-medium">Quantidade de Ganhadores:</span>
                  <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                    <button 
                      onClick={decrementQuantity}
                      disabled={isDrawing || quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                    >
                      <MinusIcon />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <button 
                      onClick={incrementQuantity}
                      disabled={isDrawing || quantity >= maxQuantity}
                      className="w-8 h-8 flex items-center justify-center rounded bg-red-600/20 hover:bg-red-600/40 text-red-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>

                <button
                  onClick={drawWinner}
                  disabled={!canDraw() || isDrawing}
                  className={`
                    group relative w-full py-5 rounded-2xl font-bold text-xl uppercase tracking-widest transition-all duration-300
                    shadow-[0_0_20px_rgba(220,38,38,0.3)]
                    ${!canDraw() || isDrawing 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(220,38,38,0.5)] active:translate-y-0'
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-3">
                    {isDrawing ? 'Sorteando...' : (
                      <>
                        <PlayIcon /> {quantity > 1 ? 'Sortear Ganhadores' : 'Sortear Agora'}
                      </>
                    )}
                  </span>
                </button>
            </div>

            {/* Recent List Preview (Only for Names) */}
            {mode === 'names' && (
              <div className="glass rounded-xl p-4 flex flex-col gap-2 max-h-48 overflow-y-auto border border-white/5">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lista de Nomes ({namesList.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {namesList.slice(0, 20).map((name, idx) => (
                      <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">
                        {name}
                      </span>
                    ))}
                    {namesList.length > 20 && (
                      <span className="text-xs text-gray-500 px-2 py-1">...mais {namesList.length - 20}</span>
                    )}
                    {namesList.length === 0 && <span className="text-xs text-gray-600 italic">Nenhum nome adicionado.</span>}
                  </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-gray-600 text-xs text-center">
        © 2025 Sorteador 10 Anos. Powered by Gemini.
      </footer>
    </div>
  );
}