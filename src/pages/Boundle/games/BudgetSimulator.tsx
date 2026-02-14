import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyBudgetGame, getTodayString, GameItem, BudgetGameDaily } from '../../../lib/boundle/budget/engine';
import { useBoundle } from '../../../lib/boundle/hooks';
import { cn } from '../../../lib/utils';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
    Coins,
    ShoppingCart,
    Trash2,
    PartyPopper,
    Share2,
    AlertCircle,
    Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPES ---
interface BudgetGameState {
    balance: number;
    inventory: { [itemId: string]: number }; // itemId -> quantity
    lastPlayed: string; // YYYY-MM-DD
    isComplete: boolean;
}

const BudgetSimulator: React.FC = () => {
    // --- HOOKS ---
    const { canPlay, submitScore, loading: boundleLoading } = useBoundle();
    const { width, height } = useWindowSize();

    // --- STATE ---
    const [dailyGame, setDailyGame] = useState<BudgetGameDaily | null>(null);
    const [gameState, setGameState] = useState<BudgetGameState | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);

    // --- INIT ---
    useEffect(() => {
        if (boundleLoading) return;

        const today = getTodayString();
        const game = getDailyBudgetGame(today);
        setDailyGame(game);

        // Load State from LocalStorage
        const savedData = localStorage.getItem('boundle_budget_state');
        let loadedState: BudgetGameState | null = null;

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.lastPlayed === today) {
                    loadedState = parsed;
                }
            } catch (e) {
                console.error("Save file corrupted", e);
            }
        }

        // Initialize if no valid save found
        if (!loadedState) {
            loadedState = {
                balance: game.initialBalance,
                inventory: {},
                lastPlayed: today,
                isComplete: false
            };
        }

        // Already played check (Global/Server State)
        if (!canPlay('budget')) {
            if (!loadedState.isComplete) {
                loadedState.isComplete = true; // Force complete visually
                loadedState.balance = 0; // Show as 0
            }
            setScoreSubmitted(true);
        }

        setGameState(loadedState);
        setInitializing(false);
    }, [boundleLoading]);

    // --- PERSISTENCE ---
    useEffect(() => {
        if (gameState && !initializing) {
            localStorage.setItem('boundle_budget_state', JSON.stringify(gameState));
        }
    }, [gameState, initializing]);

    // --- ACTIONS ---
    const handleTransaction = (item: GameItem, quantityChange: number) => {
        if (!gameState || gameState.isComplete) return;

        const currentQty = gameState.inventory[item.id] || 0;
        const newQty = currentQty + quantityChange;

        // Validation
        if (newQty < 0) return; // Cannot sell what you don't have
        if (item.maxQuantity && newQty > item.maxQuantity) {
            toast.error(`Bu öğeden en fazla ${item.maxQuantity} adet alabilirsin.`);
            return;
        }

        const cost = item.price * quantityChange;

        // Bakiye Kontrolü (Sadece satın alırken)
        if (quantityChange > 0 && gameState.balance < cost) {
            toast.error("Yetersiz bütçe!");
            return;
        }

        // Update State
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                balance: prev.balance - cost,
                inventory: {
                    ...prev.inventory,
                    [item.id]: newQty
                }
            };
        });
    };

    const handleComplete = () => {
        if (!gameState || !canPlay('budget') || scoreSubmitted) return;

        if (gameState.balance === 0) {
            submitScore('budget', 75);
            setScoreSubmitted(true);
            setGameState(prev => prev ? { ...prev, isComplete: true } : null);
            toast.success("Tebrikler! Bütçeyi sıfırladın.");
        }
    };

    const handleShare = () => {
        const text = `Boğaziçi Bütçe Simülatörü 📉\nBütçeyi Sıfırladım! 💸\n\nSen de dene: https://1863postasi.com/boundle #Boundle`;
        navigator.clipboard.writeText(text);
        toast.success("Sonuç panoya kopyalandı!");
    };

    // --- FORMATTERS ---
    const formatMoney = (amount: number) => {
        return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
    };

    if (initializing || !dailyGame || !gameState) {
        return <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-boun-blue"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4 md:px-0">
            {gameState.isComplete && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            {/* HEADER */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-stone-200 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-2">GÜNÜN MANŞETİ</h2>
                    <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-800 italic">"{dailyGame.newsHeadline}"</h1>
                    <div className="mt-4 flex flex-col items-center">
                        <span className="text-xs text-stone-500 mb-1">Kalan Bütçe</span>
                        <div className={cn(
                            "text-3xl md:text-5xl font-black font-mono tabular-nums transition-colors duration-300",
                            gameState.balance === 0 ? "text-emerald-600" : "text-boun-blue"
                        )}>
                            {formatMoney(gameState.balance)}
                        </div>
                    </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-5 grayscale pointer-events-none">
                    <Coins size={120} />
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-2 bg-stone-200 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, ((dailyGame.initialBalance - gameState.balance) / dailyGame.initialBalance) * 100))}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                />
            </div>

            {/* GAME COMPLETED */}
            <AnimatePresence>
                {gameState.isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center mb-8 flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                            <PartyPopper size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-emerald-900">Mükemmel Yönetim!</h3>
                            <p className="text-emerald-700">Hiç para artırmadan bütçeyi yönettin.</p>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md active:translate-y-0.5"
                        >
                            <Share2 size={18} /> Sonucu Paylaş
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WIN BUTTON (Visible when balance is 0 but not yet submitted/complete locally) */}
            {!gameState.isComplete && gameState.balance === 0 && !scoreSubmitted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:sticky md:bottom-auto mb-8"
                >
                    <button
                        onClick={handleComplete}
                        className="bg-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-emerald-500/40 hover:bg-emerald-500 hover:scale-105 transition-all flex items-center gap-3 animate-pulse"
                    >
                        <PartyPopper size={24} />
                        GÖREVİ TAMAMLA
                    </button>
                </motion.div>
            )}

            {/* 1. GELİR VE TASARRUFLAR (INCOME) */}
            <div className="mb-8">
                <h3 className="text-stone-800 font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-700 p-1.5 rounded-lg"><Coins size={20} /></span>
                    Gelir ve Tasarruf Ekle
                    <span className="text-xs font-normal text-stone-400 ml-auto">Bütçeyi artırır</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyGame.items.filter(i => i.price < 0).map((item) => {
                        const quantity = gameState.inventory[item.id] || 0;
                        const isMaxed = item.maxQuantity ? quantity >= item.maxQuantity : false;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                className="bg-amber-50/50 rounded-xl p-4 border border-amber-200 relative flex flex-col justify-between group h-full hover:shadow-md transition-all"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-4xl">{item.emoji}</div>
                                        <div className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-amber-100 text-amber-700">
                                            Politika
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-stone-800 leading-tight mb-1">{item.name}</h3>

                                    <div className="font-mono font-bold text-lg mb-4 text-emerald-600">
                                        +{formatMoney(Math.abs(item.price))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-white/50 rounded-lg p-1 border border-amber-100">
                                    <button
                                        onClick={() => handleTransaction(item, -1)}
                                        disabled={quantity <= 0 || gameState.isComplete}
                                        className="w-10 h-10 flex items-center justify-center rounded-md text-stone-400 hover:text-red-500 hover:bg-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="font-bold text-xl min-w-[30px] text-center text-stone-800">
                                        {quantity}
                                    </div>

                                    <button
                                        onClick={() => handleTransaction(item, 1)}
                                        disabled={isMaxed || gameState.isComplete}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center rounded-md transition-all shadow-sm",
                                            isMaxed
                                                ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                                                : "bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200"
                                        )}
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>

                                {item.maxQuantity && (
                                    <div className="absolute top-2 right-12 text-[10px] text-amber-700/50 font-bold px-1.5 py-0.5">
                                        Limit: {item.maxQuantity}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 2. HARCAMALAR (EXPENSES) */}
            <div className="mb-8">
                <h3 className="text-stone-800 font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-stone-100 text-stone-600 p-1.5 rounded-lg"><ShoppingCart size={20} /></span>
                    Harcama Yap
                    <span className="text-xs font-normal text-stone-400 ml-auto">Bütçeyi düşürür</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dailyGame.items.filter(i => i.price > 0).map((item) => {
                        const quantity = gameState.inventory[item.id] || 0;
                        const isMaxed = item.maxQuantity ? quantity >= item.maxQuantity : false;
                        const canAfford = gameState.balance >= item.price;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                className="bg-white rounded-xl p-4 border border-stone-200 relative flex flex-col justify-between group h-full hover:border-boun-blue/30 hover:shadow-lg hover:shadow-boun-blue/5 transition-all"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-4xl">{item.emoji}</div>
                                        <div className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-stone-100 text-stone-500">
                                            {item.category === 'infrastructure' ? 'Yatırım' :
                                                item.category === 'student' ? 'Öğrenci' : 'Eğlence'}
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-stone-800 leading-tight mb-1">{item.name}</h3>

                                    <div className="font-mono font-bold text-lg mb-4 text-stone-600">
                                        {formatMoney(Math.abs(item.price))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-stone-50 rounded-lg p-1 border border-stone-100">
                                    <button
                                        onClick={() => handleTransaction(item, -1)}
                                        disabled={quantity <= 0 || gameState.isComplete}
                                        className="w-10 h-10 flex items-center justify-center rounded-md text-stone-400 hover:text-red-500 hover:bg-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="font-bold text-xl min-w-[30px] text-center text-stone-800">
                                        {quantity}
                                    </div>

                                    <button
                                        onClick={() => handleTransaction(item, 1)}
                                        disabled={(!canAfford && item.price > 0) || isMaxed || gameState.isComplete}
                                        className={cn(
                                            "w-10 h-10 flex items-center justify-center rounded-md transition-all shadow-sm",
                                            isMaxed || !canAfford
                                                ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                                                : "bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200"
                                        )}
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>

                                {item.maxQuantity && (
                                    <div className="absolute top-2 right-12 text-[10px] text-stone-400/50 font-bold px-1.5 py-0.5">
                                        Limit: {item.maxQuantity}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* INFO FOOTER */}
            <div className="mt-8 flex items-center justify-center gap-2 text-stone-400 text-xs text-center max-w-md mx-auto">
                <Info size={14} className="shrink-0" />
                <p>Her gün 00:00'da yeni bir bütçe senaryosu ve harcama listesi yayınlanır. Bütçeyi tam olarak sıfırlayarak puan kazanabilirsin.</p>
            </div>
        </div>
    );
};

export default BudgetSimulator;
