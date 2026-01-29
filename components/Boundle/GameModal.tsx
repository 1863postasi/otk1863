import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Check, Share2, Loader2, RotateCcw } from 'lucide-react';
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
      showError("Kelime 5 harfli olmalı.");
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
    setTimeout(() => setErrorMessage(null), 3000);
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
        // If lost, last row might not be validated fully visually if engine stopped, but we have colors
        resultString += colors[i].map(c => emojiMap[c] || '⬜').join('') + '\n';
    }
    
    resultString += `Güney yokuşu kadar zordu... 🌉\nhttps://1863postasi.org/boundle`;

    navigator.clipboard.writeText(resultString);
    showError("Sonuç panoya kopyalandı!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#f5f5f4] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-stone-200 bg-white">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Boundle</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full"><X size={20} /></button>
        </div>

        {/* ERROR TOAST */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 bg-stone-800 text-white px-4 py-2 rounded text-sm font-bold shadow-lg z-50"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID AREA */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="grid grid-rows-6 gap-2 mb-4">
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-5 gap-2">
                {row.map((cell, cIdx) => {
                  const status = colors[rIdx][cIdx];
                  const isActive = rIdx === currentRow && cIdx === currentCol;
                  const hasLetter = !!cell;
                  
                  return (
                    <motion.div 
                      key={cIdx}
                      initial={false}
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: status === 'correct' ? '#2d4f1e' : status === 'present' ? '#b48e43' : status === 'absent' ? '#78716c' : '#ffffff',
                        borderColor: status !== 'empty' ? 'transparent' : hasLetter ? '#44403c' : '#d6d3d1',
                        color: status !== 'empty' ? '#ffffff' : '#1c1917'
                      }}
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 border-2 rounded flex items-center justify-center text-2xl font-bold font-sans uppercase select-none transition-colors duration-300",
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

        {/* KEYBOARD AREA */}
        <div className="p-2 pb-6 bg-stone-200">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1 mb-2">
              {row.map(key => {
                const status = keyStatus[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleInput(key)}
                    disabled={gameState !== 'playing' || loading}
                    className={cn(
                      "h-12 min-w-[32px] md:min-w-[40px] px-1 rounded font-bold text-sm md:text-base transition-colors",
                      status === 'correct' ? "bg-boun-green text-white" :
                      status === 'present' ? "bg-boun-gold text-white" :
                      status === 'absent' ? "bg-stone-500 text-white" :
                      "bg-white text-stone-900 hover:bg-stone-100"
                    )}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center gap-2 px-4">
             <button onClick={handleDelete} disabled={gameState !== 'playing'} className="flex-1 h-12 bg-white rounded font-bold text-stone-700 flex items-center justify-center"><Delete /></button>
             <button 
                onClick={handleSubmit} 
                disabled={gameState !== 'playing' || loading}
                className="flex-[1.5] h-12 bg-stone-900 text-white rounded font-bold flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin"/> : "ENTER"}
             </button>
          </div>
        </div>

        {/* RESULT OVERLAY */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-stone-900/90 flex flex-col items-center justify-center text-white p-8 text-center"
            >
              <h2 className="font-serif text-4xl font-bold mb-2">
                {gameState === 'won' ? 'Tebrikler!' : 'Oyun Bitti'}
              </h2>
              <p className="text-stone-400 mb-8 text-lg">
                {gameState === 'won' ? 'Güney yokuşunu tırmanmış kadar oldun.' : 'Bir dahaki sefere...'}
              </p>

              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-boun-gold">{score}</div>
                  <div className="text-xs uppercase tracking-widest text-stone-500">Puan</div>
                </div>
                <div className="w-px bg-stone-700"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{userProfile?.boundleStreak || 0}</div>
                  <div className="text-xs uppercase tracking-widest text-stone-500">Seri</div>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 bg-boun-green text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Share2 size={20} /> SONUCU PAYLAŞ
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-stone-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-stone-600 transition-colors"
                >
                  <RotateCcw size={20} /> KAPAT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default GameModal;