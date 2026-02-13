import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SudokuEngine, Board, getDailySeed } from '../../../lib/boundle/sudoku/engine';
import { Eraser, Lightbulb, RotateCcw, PartyPopper, ChevronLeft, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useBoundle } from '../../../lib/boundle/hooks';

// TYPES
type CellValue = number | null;
type Notes = Set<number>;

interface GameState {
    puzzle: Board; // Başlangıç (sabit) ipuçları
    current: Board; // Şu anki durum
    solution: Board; // Çözüm
    notes: { [key: number]: number[] }; // Hücre bazlı notlar
    mistakes: number;
    isComplete: boolean;
    history: Board[]; // Undo için (basit versiyon: sadece board state)
    lastPlayed: string; // Tarih
}

const Sudoku: React.FC = () => {
    // --- HOOKS ---
    const { canPlay, submitScore, loading: boundleLoading } = useBoundle();
    const { width, height } = useWindowSize();

    // --- STATE ---
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);
    const [isNoteMode, setIsNoteMode] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);

    // --- INIT & PERSISTENCE ---
    useEffect(() => {
        const today = getDailySeed(); // YYYY-MM-DD
        const savedData = localStorage.getItem('boundle_sudoku_state');

        // Eğer boundle yükleniyorsa bekle
        if (boundleLoading) return;

        // Oynama hakkı kontrolü (Daha önce tamamlamış mı?)
        const userCanPlay = canPlay('sudoku');

        let loadedState: GameState | null = null;

        // Eğer kullanıcı bugün oynamışsa ve tamamlamışsa, state'i tamamlanmış olarak başlatmak isteyebiliriz
        // Ancak localStorage'da bitmiş oyun varsa onu yüklemek en iyisi.

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Eğer kayıtlı oyun bugüne aitse yükle
                if (parsed.lastPlayed === today) {
                    loadedState = parsed;
                }
            } catch (e) {
                console.error("Save file corrupted", e);
            }
        }

        if (!loadedState) {
            // Yeni oyun oluştur
            const engine = new SudokuEngine(today);
            const { puzzle: newPuzzle, solution: newSolution } = engine.generate('medium');

            loadedState = {
                puzzle: newPuzzle,
                current: [...newPuzzle],
                solution: newSolution,
                notes: {},
                mistakes: 0,
                isComplete: false,
                history: [],
                lastPlayed: today
            };
        }

        // Eğer kullanıcı veritabanına göre bugün oynamışsa (örn: başka cihazda), 
        // local state bitmemiş olsa bile oyunu kilitli/bitmiş göstermeliyiz.
        if (!userCanPlay) {
            // Eğer localde bitmiş oyun yoksa, temiz bir "tamamlandı" state'i uydur
            if (!loadedState.isComplete) {
                loadedState.isComplete = true;
                loadedState.current = loadedState.solution; // Çözülmüş göster
            }
            setScoreSubmitted(true); // Zaten gönderilmiş
        }

        setGameState(loadedState);
        setInitializing(false);
    }, [boundleLoading]);

    // Her değişiklikte kaydet
    useEffect(() => {
        if (gameState && !initializing) {
            localStorage.setItem('boundle_sudoku_state', JSON.stringify(gameState));
        }
    }, [gameState, initializing]);


    // --- SCORE SUBMISSION ---
    useEffect(() => {
        // Oyun yeni bittiyse ve henüz skor gönderilmediyse
        if (gameState?.isComplete && !scoreSubmitted && canPlay('sudoku')) {
            submitScore('sudoku', 75);
            setScoreSubmitted(true);
        }
    }, [gameState?.isComplete, scoreSubmitted, canPlay, submitScore]);


    // --- ACTIONS ---
    const handleNumberInput = useCallback((num: number) => {
        if (!gameState || selectedCell === null || gameState.isComplete) return;

        // Sabit sayıysa değiştirme
        if (gameState.puzzle[selectedCell] !== null) return;

        // NOT MODU
        if (isNoteMode) {
            setGameState(prev => {
                if (!prev) return null;
                const newNotes = { ...prev.notes };
                const cellNotes = newNotes[selectedCell] || [];

                if (cellNotes.includes(num)) {
                    newNotes[selectedCell] = cellNotes.filter(n => n !== num);
                } else {
                    newNotes[selectedCell] = [...cellNotes, num];
                }

                return { ...prev, notes: newNotes };
            });
            return;
        }

        // NORMAL GİRİŞ
        const correctVal = gameState.solution[selectedCell];
        const isMistake = num !== correctVal;

        setGameState(prev => {
            if (!prev) return null;
            const newCurrent = [...prev.current];
            newCurrent[selectedCell] = num;

            // Hata ise mistake sayacını artır (Opsiyonel: Hata engellenebilir, ama genelde gösterilir)
            const newMistakes = isMistake ? prev.mistakes + 1 : prev.mistakes;

            // Oyun bitti mi kontrolü
            let isComplete = false;
            if (!isMistake) {
                // Tahta dolu mu ve doğru mu?
                const isFullAndCorrect = newCurrent.every((val, idx) => val === prev.solution[idx]);
                isComplete = isFullAndCorrect;
            }

            return {
                ...prev,
                current: newCurrent,
                mistakes: newMistakes,
                isComplete,
                // Hatalı girilen notları temizle (isteğe bağlı)
                notes: { ...prev.notes, [selectedCell]: [] }
            };
        });

    }, [gameState, selectedCell, isNoteMode]);

    const handleErase = () => {
        if (!gameState || selectedCell === null || gameState.isComplete) return;
        if (gameState.puzzle[selectedCell] !== null) return;

        setGameState(prev => {
            if (!prev) return null;
            const newCurrent = [...prev.current];
            newCurrent[selectedCell] = null;
            return { ...prev, current: newCurrent };
        });
    };

    // Klavye Desteği
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameState || gameState.isComplete) return;

            // Sayılar
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            }
            // Silme
            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleErase();
            }
            // Yön Tuşları (Basit navigasyon)
            if (selectedCell !== null) {
                if (e.key === 'ArrowUp' && selectedCell >= 9) setSelectedCell(selectedCell - 9);
                if (e.key === 'ArrowDown' && selectedCell < 72) setSelectedCell(selectedCell + 9);
                if (e.key === 'ArrowLeft' && selectedCell % 9 !== 0) setSelectedCell(selectedCell - 1);
                if (e.key === 'ArrowRight' && selectedCell % 9 !== 8) setSelectedCell(selectedCell + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, selectedCell, handleNumberInput]);


    // --- RENDERING ---

    // Hücre Stili Belirleme
    const getCellStyle = (index: number) => {
        if (!gameState) return "";

        const isSelected = index === selectedCell;
        const val = gameState.current[index];
        const isInitial = gameState.puzzle[index] !== null;
        const isError = val !== null && val !== gameState.solution[index];
        const isSameNumber = selectedCell !== null && gameState.current[selectedCell] === val && val !== null;

        const row = Math.floor(index / 9);
        const col = index % 9;
        const isRightBorder = col === 2 || col === 5;
        const isBottomBorder = row === 2 || row === 5;

        return cn(
            "relative flex items-center justify-center text-xl md:text-2xl font-bold select-none transition-all duration-100 cursor-pointer h-[min(10vw,48px)] w-[min(10vw,48px)] md:h-12 md:w-12",
            isRightBorder && "border-r-2 border-stone-800",
            isBottomBorder && "border-b-2 border-stone-800",
            !isRightBorder && "border-r border-stone-200",
            !isBottomBorder && "border-b border-stone-200",

            // Renkler
            isInitial ? "text-stone-900 bg-stone-100" : "text-boun-blue bg-white",
            isError && "bg-red-100 text-red-600 animate-pulse",

            // Highlight
            isSameNumber && !isSelected && !isError && "bg-boun-blue/10",
            isSelected && "bg-boun-blue/30 scale-105 z-10 rounded-md shadow-md ring-2 ring-boun-blue border-transparent"
        );
    };

    if (boundleLoading || initializing || !gameState) return <div className="min-h-screen flex items-center justify-center flex-col gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-boun-blue"></div><span className="text-xs text-stone-400">Yükleniyor...</span></div>;

    return (
        <div className="flex flex-col items-center max-w-lg mx-auto pb-10">
            {gameState.isComplete && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            {/* HEADER AREA */}
            <div className="w-full flex items-center justify-between mb-6 px-2">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-400 tracking-wider">GÜNLÜK SUDOKU</span>
                    <h2 className="text-2xl font-serif font-bold text-stone-800">
                        {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    {gameState.isComplete ? (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={14} /> 75 PUAN
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-stone-400 font-bold">HATALAR</span>
                            <span className={cn("text-lg font-bold font-mono", gameState.mistakes > 2 ? "text-red-500" : "text-stone-700")}>
                                {gameState.mistakes}/3
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* GAME COMPLETED STATE */}
            {gameState.isComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 w-full bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3"
                >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <PartyPopper size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800">Tebrikler! 🎉</h3>
                    <p className="text-emerald-700 text-sm">Bugünün bulmacasını tamamladın ve puanını kaptın.</p>
                    <Link to="/boundle" className="inline-block mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
                        Diğer Oyunlara Dön
                    </Link>
                </motion.div>
            )}

            {/* SUDOKU BOARD CONTAINER */}
            <div className={cn(
                "p-1 bg-stone-800 rounded-lg shadow-2xl overflow-hidden mb-6 select-none touch-manipulation relative",
                gameState.isComplete && "opacity-90 grayscale-[0.2]"
            )}>
                {/* Tamamlandı Overlay */}
                {gameState.isComplete && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 pointer-events-none">
                    </div>
                )}

                <div className="grid grid-cols-9 bg-stone-300 gap-[1px] border-2 border-stone-800">
                    {Array.from({ length: 81 }).map((_, i) => (
                        <div
                            key={i}
                            onClick={!gameState.isComplete ? () => setSelectedCell(i) : undefined}
                            className={getCellStyle(i)}
                        >
                            {gameState.current[i]}

                            {/* Notes Display */}
                            {gameState.current[i] === null && gameState.notes[i] && gameState.notes[i].length > 0 && (
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[2px] pointer-events-none">
                                    {gameState.notes[i].map(note => (
                                        <div key={note} className="flex items-center justify-center text-[7px] md:text-[9px] font-bold text-stone-500 leading-none" style={{ gridArea: `${Math.ceil(note / 3)} / ${(note - 1) % 3 + 1}` }}>
                                            {note}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTROLS (Hide if complete) */}
            {!gameState.isComplete && (
                <div className="w-full max-w-[400px]">
                    {/* Tools Row */}
                    <div className="flex items-center justify-around mb-6 text-stone-600">
                        <button
                            onClick={() => setIsNoteMode(!isNoteMode)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-20",
                                isNoteMode ? "bg-boun-blue text-white shadow-lg shadow-boun-blue/30 scale-105" : "hover:bg-stone-100"
                            )}
                        >
                            <div className="relative">
                                <Lightbulb size={22} fill={isNoteMode ? "currentColor" : "none"} />
                                <div className="absolute -top-1 -right-1 bg-white text-boun-blue rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold">ON</div>
                            </div>
                            <span className="text-[10px] font-bold">Not Al</span>
                        </button>

                        <button
                            onClick={handleErase}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-stone-100 transition-all w-20 active:scale-95"
                        >
                            <Eraser size={22} />
                            <span className="text-[10px] font-bold">Sil</span>
                        </button>

                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl opacity-50 cursor-not-allowed w-20">
                            <RotateCcw size={22} />
                            <span className="text-[10px] font-bold">Geri Al</span>
                        </div>
                    </div>

                    {/* Numpad Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-9 gap-2 md:gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberInput(num)}
                                className={cn(
                                    "h-12 md:h-10 rounded-lg text-lg md:text-xl font-bold transition-all shadow-sm active:scale-95 touch-manipulation",
                                    "bg-white border border-stone-200 text-boun-blue hover:border-boun-blue hover:shadow-md",
                                    isNoteMode && "text-stone-500 border-stone-300 border-dashed"
                                )}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 text-center space-y-2">
                {gameState.isComplete && (
                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2">
                        <Lock size={14} /> Yarın yeni bulmaca için tekrar gel!
                    </p>
                )}
                <p className="text-xs text-stone-400">
                    Her gün 00:00'da yeni bulmaca
                </p>
            </div>
        </div>
    );
};

export default Sudoku;
