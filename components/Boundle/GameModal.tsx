import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Share2, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { checkDailyWord } from '../../lib/boundle_service';
import { useAuth } from '../../context/AuthContext';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROWS = 6;
const COLS = 5;

// Turkish QWERTY Layout
const KEYBOARD_ROWS = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç']
];

type CellStatus = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  
  // Game State
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill("").map(() => Array(COLS).fill("")));
  const [colors, setColors] = useState<CellStatus[][]>(Array(ROWS).fill("").map(() => Array(COLS).fill("empty")));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [keyStatus, setKeyStatus] = useState<Record<string, CellStatus>>({});
  
  // Flow State
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset Game
  useEffect(() => {
    if (isOpen) {
      setGrid(Array(ROWS).fill("").map(() => Array(COLS).fill("")));
      setColors(Array(ROWS).fill("").map(() => Array(COLS).fill("empty")));
      setCurrentRow(0);
      setCurrentCol(0);
      setKeyStatus({});
      setGameState('playing');
      setScore(0);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || gameState !== 'playing' || loading) return;

      const key = e.key.toLocaleUpperCase('tr-TR');

      if (key === 'ENTER') {
        handleSubmit();
      } else if (key === 'BACKSPACE') {
        handleDelete();
      } else if (/^[A-ZÇĞİÖŞÜ]$/.test(key)) {
        handleInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, loading, currentRow, currentCol, grid]);

  const handleInput = (char: string) => {
    if (currentCol >= COLS) return;
    const newGrid = [...grid];
    newGrid[currentRow][currentCol] = char;
    setGrid(newGrid);
    setCurrentCol(prev => prev + 1);
  };

  const handleDelete = () => {
    if (currentCol <= 0) return;
    const newGrid = [...grid];
    newGrid[currentRow][currentCol - 1] = "";
    setGrid(newGrid);
    setCurrentCol(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (currentCol !== COLS) {
      showError("Eksik harf var.");
      return;
    }

    const guess = grid[currentRow].join("");
    setLoading(true);
    setErrorMessage(null);

    try {
      // Build history for backend record
      const history = grid.slice(0, currentRow + 1).map(row => row.join(""));
      
      const response = await checkDailyWord(guess, currentRow, history);
      
      // Update Grid Colors
      const newColors = [...colors];
      response.result.forEach((status: any, idx: number) => {
        newColors[currentRow][idx] = status;
        
        // Update Keyboard
        const char = guess[idx];
        setKeyStatus(prev => {
          const currentStatus = prev[char];
          if (currentStatus === 'correct') return prev; // Green stays green
          if (status === 'correct') return { ...prev, [char]: 'correct' };
          if (currentStatus === 'present') return prev; // Yellow stays yellow unless green
          return { ...prev, [char]: status };
        });
      });
      setColors(newColors);

      if (response.status === 'win') {
        setScore(response.score);
        setGameState('won');
      } else if (currentRow === ROWS - 1) {
        setGameState('lost');
      } else {
        setCurrentRow(prev => prev + 1);
        setCurrentCol(0);
      }

    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  const handleShare = () => {
    const emojiMap: Record<string, string> = {
      correct: '🟩',
      present: '🟨',
      absent: '⬜',
      empty: '⬜'
    };

    let resultString = `Boundle #${Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000)} · ${gameState === 'won' ? currentRow + 1 : 'X'}/${ROWS} 🐈\n`;
    
    // Only include rows that were played
    for (let i = 0; i <= currentRow; i++) {
        resultString += colors[i].map(c => emojiMap[c] || '⬜').join('') + '\n';
    }
    
    resultString += `1863postasi.org/boundle`;

    navigator.clipboard.writeText(resultString);
    showError("Sonuç kopyalandı!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 backdrop-blur-sm">
      {/* MAIN CONTAINER: Full Width/Height on Mobile, Centered Card on Desktop */}
      <div className="w-full h-full md:w-full md:max-w-md md:h-[85vh] md:rounded-2xl bg-[#f5f5f4] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* 1. HEADER (Fixed Height) */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-stone-200 bg-white shrink-0 z-20">
          <div className="w-8"></div> {/* Spacer for centering */}
          <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">Boundle</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} className="text-stone-600" />
          </button>
        </div>

        {/* 2. GAME GRID (Flexible Space - Grow/Shrink) */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 md:p-4 bg-[#f5f5f4]">
            
            {/* Grid Container: Constrained by Max Width & Aspect Ratio */}
            <div className="w-full max-w-[350px] aspect-[5/6] grid grid-rows-6 gap-1.5 md:gap-2">
              {grid.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {row.map((cell, cIdx) => {
                    const status = colors[rIdx][cIdx];
                    const isActive = rIdx === currentRow && cIdx === currentCol;
                    const isFilled = !!cell;
                    
                    return (
                      <motion.div 
                        key={cIdx}
                        initial={false}
                        animate={{ 
                          scale: isActive ? 1.05 : 1,
                          backgroundColor: status === 'correct' ? '#2d4f1e' : status === 'present' ? '#b48e43' : status === 'absent' ? '#78716c' : '#ffffff',
                          borderColor: status !== 'empty' ? 'transparent' : isFilled ? '#44403c' : '#d6d3d1',
                          color: status !== 'empty' ? '#ffffff' : '#1c1917'
                        }}
                        className={cn(
                          "w-full h-full border-2 rounded-md flex items-center justify-center",
                          "text-2xl md:text-3xl font-serif font-bold uppercase select-none transition-colors duration-200"
                        )}
                      >
                        {cell}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>

        </div>

        {/* 3. KEYBOARD (Fixed Bottom) */}
        <div className="shrink-0 bg-stone-200 pb-safe pt-2 px-1 md:px-2 md:pb-4 mt-auto">
          {/* Error Toast Positioned Absolute relative to content */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg z-50 whitespace-nowrap"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-1.5 mb-2">
            {KEYBOARD_ROWS.map((row, i) => (
              <div key={i} className="flex justify-center gap-1">
                {row.map(key => {
                  const status = keyStatus[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handleInput(key)}
                      disabled={gameState !== 'playing' || loading}
                      className={cn(
                        "h-12 flex-1 max-w-[40px] md:max-w-[44px] rounded-md font-serif font-bold text-sm md:text-lg transition-all active:scale-95 shadow-sm",
                        status === 'correct' ? "bg-boun-green text-white border-b-4 border-green-800" :
                        status === 'present' ? "bg-boun-gold text-white border-b-4 border-yellow-700" :
                        status === 'absent' ? "bg-stone-500 text-white border-b-4 border-stone-600" :
                        "bg-white text-stone-900 border-b-4 border-stone-300 hover:bg-stone-50"
                      )}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="flex justify-center gap-2 px-1 mt-1">
               <button onClick={handleDelete} disabled={gameState !== 'playing'} className="flex-[1] h-12 bg-white rounded-md font-bold text-stone-700 border-b-4 border-stone-300 flex items-center justify-center active:scale-95 transition-transform"><Delete size={20} /></button>
               <button 
                  onClick={handleSubmit} 
                  disabled={gameState !== 'playing' || loading}
                  className="flex-[1.5] h-12 bg-stone-900 text-white rounded-md font-serif font-bold text-sm border-b-4 border-stone-950 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-80"
               >
                  {loading ? <Loader2 className="animate-spin"/> : "ENTER"}
               </button>
            </div>
          </div>
        </div>

        {/* 4. RESULT OVERLAY (Absolute Full Cover) */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
              className="absolute inset-0 z-50 bg-stone-900/85 flex flex-col items-center justify-center text-white p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-full max-w-sm"
              >
                  <h2 className="font-serif text-5xl font-bold mb-4 text-boun-gold">
                    {gameState === 'won' ? 'Harika!' : 'Oyun Bitti'}
                  </h2>
                  <p className="text-stone-300 mb-8 text-lg font-serif">
                    {gameState === 'won' ? 'Boğaziçi ruhu seninle.' : 'Yarın yeni bir kelimeyle gel.'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8 bg-white/10 p-4 rounded-xl border border-white/10">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white font-mono">{score}</div>
                      <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Puan</div>
                    </div>
                    <div className="text-center border-l border-white/10">
                      <div className="text-3xl font-bold text-white font-mono">{userProfile?.boundleStreak || 0}</div>
                      <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Seri</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={handleShare}
                      className="w-full py-4 bg-boun-green text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg active:scale-95"
                    >
                      <Share2 size={20} /> SONUCU PAYLAŞ
                    </button>
                    <button 
                      onClick={onClose}
                      className="w-full py-4 bg-stone-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-600 transition-colors shadow-lg active:scale-95"
                    >
                      <RotateCcw size={20} /> KAPAT
                    </button>
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default GameModal;