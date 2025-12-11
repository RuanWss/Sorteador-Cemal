import React, { useState, useEffect, useRef } from 'react';
import Logo from './components/Logo';
import Confetti from './components/Confetti';
import { generateNamesWithAI } from './services/geminiService';

// Icons
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

export default function App() {
  const [namesText, setNamesText] = useState('');
  const [namesList, setNamesList] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rollingName, setRollingName] = useState(''); // For the animation effect

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update list whenever textarea changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNamesText(text);
    // Split by newlines or commas, filter empty
    const list = text.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);
    setNamesList(list);
  };

  const clearAll = () => {
    setNamesText('');
    setNamesList([]);
    setWinner(null);
    setShowConfetti(false);
  };

  const handleAIImport = async () => {
    setLoadingAI(true);
    try {
      const generatedNames = await generateNamesWithAI("nomes variados para sorteio");
      const currentList = namesList;
      const newList = [...new Set([...currentList, ...generatedNames])]; // Dedupe
      setNamesList(newList);
      setNamesText(newList.join('\n'));
    } catch (err) {
      alert("Não foi possível gerar nomes. Verifique sua chave de API.");
    } finally {
      setLoadingAI(false);
    }
  };

  const drawWinner = () => {
    if (namesList.length === 0) return;
    
    setIsDrawing(true);
    setWinner(null);
    setShowConfetti(false);

    let counter = 0;
    const maxIterations = 30; // Number of flickers
    
    const interval = setInterval(() => {
      const randomName = namesList[Math.floor(Math.random() * namesList.length)];
      setRollingName(randomName);
      counter++;

      if (counter > maxIterations) {
        clearInterval(interval);
        finishDraw();
      }
    }, 100); // Speed of flicker
  };

  const finishDraw = () => {
    const finalWinner = namesList[Math.floor(Math.random() * namesList.length)];
    setWinner(finalWinner);
    setIsDrawing(false);
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      
      <Confetti active={showConfetti} />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        
        <Logo />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Left Column: Input */}
          <div className="glass p-6 rounded-2xl shadow-2xl shadow-red-950/50 flex flex-col h-full border-t border-red-800/30">
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
                title="Limpar tudo"
              >
                <TrashIcon />
              </button>
            </div>
          </div>

          {/* Right Column: Actions & Display */}
          <div className="flex flex-col gap-6">
            
            {/* Draw Area */}
            <div className="glass p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center min-h-[300px] border-t border-red-800/30 relative overflow-hidden">
               {/* Shine effect */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

               {!winner && !isDrawing && (
                  <div className="text-gray-400 flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/40">
                      <span className="text-4xl">?</span>
                    </div>
                    <p className="font-light">Aguardando sorteio...</p>
                  </div>
               )}

               {isDrawing && (
                 <div className="flex flex-col items-center gap-2">
                    <div className="text-lg text-red-400 font-semibold tracking-wider uppercase">Sorteando</div>
                    <div className="text-4xl md:text-5xl font-black text-white tracking-tight scale-110 transition-all duration-75">
                      {rollingName}
                    </div>
                 </div>
               )}

               {winner && !isDrawing && (
                 <div className="flex flex-col items-center animate-[bounce_1s_infinite]">
                    <div className="text-sm font-bold text-red-500 tracking-[0.2em] uppercase mb-2">Vencedor(a)</div>
                    <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-[0_5px_5px_rgba(255,0,0,0.5)]">
                      {winner}
                    </div>
                    <div className="mt-6 text-sm text-gray-400">Parabéns!</div>
                 </div>
               )}
            </div>

            {/* Action Button */}
            <button
              onClick={drawWinner}
              disabled={namesList.length === 0 || isDrawing}
              className={`
                group relative w-full py-5 rounded-2xl font-bold text-xl uppercase tracking-widest transition-all duration-300
                shadow-[0_0_20px_rgba(220,38,38,0.3)]
                ${namesList.length === 0 || isDrawing 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(220,38,38,0.5)] active:translate-y-0'
                }
              `}
            >
              <span className="flex items-center justify-center gap-3">
                {isDrawing ? 'Sorteando...' : (
                  <>
                    <PlayIcon /> Sortear Agora
                  </>
                )}
              </span>
            </button>

            {/* Recent List Preview (Optional aesthetics) */}
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

          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-gray-600 text-xs text-center">
        © 2025 Sorteador 10 Anos. Powered by Gemini.
      </footer>
    </div>
  );
}