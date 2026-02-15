import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SudokuEngine, Board, getDailySeed } from '../../../lib/boundle/sudoku/engine';
import { Eraser, Lightbulb, PartyPopper, ChevronLeft, CheckCircle2, Lock, Share2 } from 'lucide-react';
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

            // Notları da temizle
            const newNotes = { ...prev.notes };
            delete newNotes[selectedCell];

            return { ...prev, current: newCurrent, notes: newNotes };
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


    // --- SHARING ---
    const handleShare = async () => {
        if (!gameState) return;

        const shareData = {
            title: '1863 Postası - Sudoku',
            text: `Günün Sudolusu tamamlandı! 🎉\nSkorum: 75 Puan\n\nSen de çöz:`,
            url: 'https://www.1863postasi.org/boundle'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                const textToCopy = `${shareData.text} ${shareData.url}`;
                await navigator.clipboard.writeText(textToCopy);
                alert("Sonuç panoya kopyalandı!");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    // --- RENDERING ---

    // Hücre Stili Belirleme
    const getCellStyle = (index: number) => {
        if (!gameState) return "";

        const isSelected = index === selectedCell;
        const val = gameState.current[index];
        const isInitial = gameState.puzzle[index] !== null;
        const isError = val !== null && val !== gameState.solution[index];
        const isSameNumber = selectedCell !== null && gameState.current[selectedCell] === val && val !== null;

        // Related Cells Calculation
        let isRelated = false;
        if (selectedCell !== null) {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);

            const sRow = Math.floor(selectedCell / 9);
            const sCol = selectedCell % 9;
            const sBlock = Math.floor(sRow / 3) * 3 + Math.floor(sCol / 3);

            if (row === sRow || col === sCol || block === sBlock) {
                isRelated = true;
            }
        }

        return cn(
            "relative flex items-center justify-center text-xl md:text-3xl select-none transition-all duration-75 cursor-pointer h-[min(9vw,44px)] w-[min(9vw,44px)] md:h-14 md:w-14",

            // Background Colors
            "bg-white",
            // Highlight related cells (row, col, block) - subtle
            isRelated && !isSelected && !isSameNumber && !isError && "bg-blue-50/50",

            // Text Colors
            isInitial ? "text-stone-900" : "text-blue-600 font-medium",

            // Interaction States
            isSameNumber && !isSelected && !isError && "bg-blue-100/80 text-blue-800",
            isSelected && "bg-blue-100 ring-4 ring-inset ring-blue-500/50 z-20",

            // Error overlay
            isError && "bg-red-50 text-red-600 ring-inset ring-2 ring-red-500"
        );
    };

    if (boundleLoading || initializing || !gameState) return <div className="min-h-screen flex items-center justify-center flex-col gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-boun-blue"></div><span className="text-xs text-stone-400">Yükleniyor...</span></div>;

    return (
        <div className="flex flex-col items-center max-w-lg mx-auto pb-4">
            {gameState.isComplete && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            {/* HEADER AREA */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-400 tracking-wider">GÜNLÜK SUDOKU</span>
                    <h2 className="text-2xl font-serif font-bold text-stone-800">
                        {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    {gameState.isComplete && (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={14} /> 75 PUAN
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
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                        <Link to="/boundle" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
                            Diğer Oyunlara Dön
                        </Link>
                        <button
                            onClick={handleShare}
                            className="px-6 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                        >
                            <Share2 size={16} />
                            Paylaş
                        </button>
                    </div>
                </motion.div>
            )}

            {/* SUDOKU BOARD CONTAINER */}
            <div className={cn(
                "bg-stone-800 p-1 md:p-1.5 rounded-xl shadow-2xl shadow-stone-300/50 mb-6 select-none touch-manipulation relative",
                gameState.isComplete && "opacity-90 grayscale-[0.2]"
            )}>
                {/* Tamamlandı Overlay */}
                {gameState.isComplete && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px] pointer-events-none rounded-xl">
                    </div>
                )}

                {/* 
                    Grid System:
                    - Main grid: 3x3 for the "blocks" (thick borders)
                    - Sub grids: 3x3 for the cells (thin borders)
                */}
                <div className="grid grid-cols-3 gap-0.5 md:gap-1 bg-stone-800 border-2 border-stone-800 rounded-lg overflow-hidden">
                    {/* 9 Major Blocks */}
                    {Array.from({ length: 9 }).map((_, blockIndex) => (
                        <div key={blockIndex} className="grid grid-cols-3 gap-[1px] bg-stone-300">
                            {/* 9 Cells per Block */}
                            {Array.from({ length: 9 }).map((_, cellIndex) => {
                                // Calculate global index (0-80) based on block and cell index
                                const blockRow = Math.floor(blockIndex / 3);
                                const blockCol = blockIndex % 3;
                                const cellRow = Math.floor(cellIndex / 3);
                                const cellCol = cellIndex % 3;

                                const globalRow = blockRow * 3 + cellRow;
                                const globalCol = blockCol * 3 + cellCol;
                                const globalIndex = globalRow * 9 + globalCol;

                                return (
                                    <div
                                        key={globalIndex}
                                        onClick={!gameState.isComplete ? () => setSelectedCell(globalIndex) : undefined}
                                        className={getCellStyle(globalIndex)}
                                    >
                                        <span className={cn(
                                            "z-10 relative",
                                            gameState.puzzle[globalIndex] !== null && "font-serif font-black text-2xl md:text-3xl"
                                        )}>
                                            {gameState.current[globalIndex]}
                                        </span>

                                        {/* Notes Display */}
                                        {gameState.current[globalIndex] === null && gameState.notes[globalIndex] && gameState.notes[globalIndex].length > 0 && (
                                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[2px] pointer-events-none">
                                                {gameState.notes[globalIndex].map(note => (
                                                    <div key={note} className="flex items-center justify-center text-[8px] md:text-[10px] font-medium text-stone-500 leading-none" style={{ gridArea: `${Math.ceil(note / 3)} / ${(note - 1) % 3 + 1}` }}>
                                                        {note}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTROLS (Hide if complete) */}
            {!gameState.isComplete && (
                <div className="w-full max-w-[420px] flex flex-col gap-6">
                    {/* Tools Row */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setIsNoteMode(!isNoteMode)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-bold shadow-sm border",
                                isNoteMode
                                    ? "bg-stone-800 text-white border-stone-800 shadow-lg scale-105"
                                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                            )}
                        >
                            <div className="relative">
                                <Lightbulb size={18} fill={isNoteMode ? "currentColor" : "none"} />
                                {isNoteMode && <div className="absolute -top-1 -right-1 bg-white text-stone-800 rounded-full w-2 h-2" />}
                            </div>
                            <span>Not Modu</span>
                        </button>

                        <button
                            onClick={handleErase}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all text-sm font-bold shadow-sm active:scale-95"
                        >
                            <Eraser size={18} />
                            <span>Sil</span>
                        </button>
                    </div>

                    {/* Numpad Grid */}
                    <div className="grid grid-cols-9 gap-1 md:gap-2 px-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberInput(num)}
                                className={cn(
                                    "aspect-[4/5] md:aspect-square flex items-center justify-center rounded-xl text-xl md:text-2xl font-medium transition-all shadow-[0_2px_0_0_rgba(168,162,158,0.3)] active:shadow-none active:translate-y-[2px] touch-manipulation",
                                    "bg-white border border-stone-200 text-stone-700 hover:text-boun-blue hover:border-boun-blue/50",
                                    isNoteMode && "text-stone-400 border-dashed"
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
