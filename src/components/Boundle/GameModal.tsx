import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Delete, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SPRINGS } from '../../lib/animations';
import { checkDailyWord, calculateScore } from '../../lib/boundle_service';
import { useAuth } from '../../context/AuthContext';
import { ResultOverlay } from './ResultOverlay';
import { triggerHaptic } from '../../lib/haptics';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHighContrast: boolean;
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

import { getRandomFortune } from '../../lib/fortunes';

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, isHighContrast }) => {
  const { userProfile } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Game State
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill("").map(() => Array(COLS).fill("")));
  const [colors, setColors] = useState<CellStatus[][]>(Array(ROWS).fill("").map(() => Array(COLS).fill("empty")));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [keyStatus, setKeyStatus] = useState<Record<string, CellStatus>>({});

  // Shake animation state
  const [shakeRow, setShakeRow] = useState<number | null>(null);

  // Flow State
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fortune, setFortune] = useState<string>('');
  const [showShareCard, setShowShareCard] = useState(false);

  // Color Mapping Logic
  const getColor = (status: CellStatus) => {
    if (status === 'correct') return isHighContrast ? '#f5793a' : '#4ade80'; // HC: Orange, Normal: Green
    if (status === 'present') return isHighContrast ? '#85c0f9' : '#facc15'; // HC: Blue, Normal: Yellow
    if (status === 'absent') return '#78716c'; // Absent is always Gray
    return 'transparent';
  };

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
      setShowShareCard(false);
      setShakeRow(null);
      // Select random fortune
      setFortune(getRandomFortune());
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
    triggerHaptic('light'); // Tap feedback
    const newGrid = [...grid];
    newGrid[currentRow][currentCol] = char;
    setGrid(newGrid);
    setCurrentCol(prev => prev + 1);
  };

  const handleDelete = () => {
    if (currentCol <= 0) return;
    triggerHaptic('light');
    const newGrid = [...grid];
    newGrid[currentRow][currentCol - 1] = "";
    setGrid(newGrid);
    setCurrentCol(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (currentCol !== COLS) {
      showError("Eksik harf var. Tam 5 harf girmelisin!");
      // Shake animation
      setShakeRow(currentRow);
      setTimeout(() => setShakeRow(null), 500);
      triggerHaptic('warning');
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
        triggerHaptic('success'); // Victory vibration
        const calculatedScore = calculateScore(currentRow + 1, true);
        setScore(calculatedScore);
        setGameState('won');
      } else if (currentRow === ROWS - 1) {
        triggerHaptic('error'); // Loss vibration
        setGameState('lost');
      } else {
        setCurrentRow(prev => prev + 1);
        setCurrentCol(0);
      }

    } catch (error: any) {
      triggerHaptic('error'); // Error vibration
      showError(error.message);
      // Trigger shake animation
      setShakeRow(currentRow);
      setTimeout(() => setShakeRow(null), 500);
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
    triggerHaptic('medium');
    showError("Sonuç kopyalandı!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-0 md:p-4">
      {/* MAIN CONTAINER */}
      <div className="w-full h-full md:w-[500px] md:h-[800px] md:max-h-[90vh] bg-[#f5f5f4] flex flex-col md:rounded-xl shadow-2xl overflow-hidden border border-stone-300 relative">

        {/* 1. HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-300 bg-[#e7e5e4] shrink-0 z-20 shadow-sm">
          <div className="w-8"></div> {/* Spacer */}
          <h2 className="font-serif text-3xl font-bold text-stone-800 tracking-tight">Boundle</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-stone-300 rounded-full transition-colors text-stone-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* 2. GAME GRID AREA */}
        {/* Flex-1 ensures it takes available vertical space but not more */}
        <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-4 bg-[#f5f5f4]">

          {/* 
                Grid Wrapper: 
                - Scales to fit width (max 380px)
                - Scales to fit height (max 500px)
                - Maintains aspect ratio
            */}
          <div className="w-full max-w-[380px] h-full max-h-[500px] aspect-[5/6] grid grid-rows-6 gap-2">
            {grid.map((row, rIdx) => (
              <motion.div
                key={rIdx}
                className="grid grid-cols-5 gap-2"
                animate={shakeRow === rIdx ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {row.map((cell, cIdx) => {
                  const status = colors[rIdx][cIdx];
                  const isActive = rIdx === currentRow && cIdx === currentCol;
                  const isFilled = !!cell;

                  // Calculate delay for reveal animation
                  const revealDelay = shouldReduceMotion ? 0 : (rIdx === currentRow - 1 ? cIdx * 0.1 : 0);

                  return (
                    <motion.div
                      key={cIdx}
                      initial={false}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        backgroundColor: getColor(status),
                        borderColor: status !== 'empty' ? 'transparent' : isFilled ? '#57534e' : '#d6d3d1',
                        color: status !== 'empty' ? '#ffffff' : '#1c1917',
                        // Rotate animation on reveal
                        rotateX: status !== 'empty' && !shouldReduceMotion ? [90, 0] : 0
                      }}
                      transition={{
                        duration: 0.2,
                        delay: revealDelay, // Staggered reveal
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className={cn(
                        "w-full h-full border-2 flex items-center justify-center",
                        "text-3xl font-serif font-bold uppercase select-none",
                        "rounded-[4px] shadow-sm backface-hidden"
                      )}
                    >
                      {cell}
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>

        </div>

        {/* 3. KEYBOARD (Fixed Bottom) */}
        <div className="shrink-0 bg-[#e7e5e4] border-t border-stone-300 pb-safe pt-4 px-2 md:px-4 md:pb-6 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {/* Error Toast Positioned absolutely relative to the container, floating above keyboard */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-48 left-1/2 -translate-x-1/2 bg-stone-800 text-stone-100 px-6 py-3 rounded-lg text-sm font-bold shadow-xl z-50 whitespace-nowrap border border-stone-600"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 max-w-[500px] mx-auto">
            {KEYBOARD_ROWS.map((row, i) => (
              <div key={i} className="flex justify-center gap-1.5">
                {row.map(key => {
                  const status = keyStatus[key];

                  let btnClass = "bg-white text-stone-800 border-stone-300 hover:bg-stone-50"; // Default

                  if (status === 'correct') {
                    btnClass = isHighContrast
                      ? "bg-game-hcWin text-white border-orange-800"
                      : "bg-boun-green text-white border-green-900";
                  } else if (status === 'present') {
                    btnClass = isHighContrast
                      ? "bg-game-hcPresent text-white border-blue-800"
                      : "bg-boun-gold text-white border-yellow-800";
                  } else if (status === 'absent') {
                    btnClass = "bg-stone-500 text-white border-stone-700";
                  }

                  return (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={key}
                      onClick={() => handleInput(key)}
                      disabled={gameState !== 'playing' || loading}
                      className={cn(
                        "h-14 flex-1 rounded-[4px] font-serif font-bold text-lg transition-colors shadow-sm border-b-4",
                        btnClass
                      )}
                    >
                      {key}
                    </motion.button>
                  );
                })}
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleDelete} disabled={gameState !== 'playing'} className="flex-[1] h-14 bg-white rounded-[4px] font-bold text-stone-700 border-b-4 border-stone-300 flex items-center justify-center transition-colors hover:bg-stone-50"><Delete size={24} /></motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={gameState !== 'playing' || loading}
                className="flex-[1.5] h-14 bg-stone-800 text-white rounded-[4px] font-serif font-bold text-lg border-b-4 border-black flex items-center justify-center gap-2 transition-colors disabled:opacity-80 hover:bg-stone-700"
              >
                {loading ? <Loader2 className="animate-spin" /> : "ENTER"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* 4. RESULT OVERLAY (Separate Component) */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <ResultOverlay
              gameState={gameState}
              score={score}
              streak={userProfile?.boundleStreak || 0}
              showShareCard={showShareCard}
              onToggleShareCard={() => setShowShareCard(!showShareCard)}
              onShare={handleShare}
              onClose={onClose}
              username={userProfile?.displayName || 'Anonim'}
              guessCount={currentRow + 1}
              dayNumber={Math.floor((Date.now() - new Date('2024-01-01').getTime()) / 86400000)}
              grid={grid}
              colors={colors}
              fortune={fortune}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default GameModal;