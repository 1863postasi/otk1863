import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import WordleGame from './Games/Wordle';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: 'wordle' | null; // Expandable union type
  isHighContrast: boolean;
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose, gameType, isHighContrast }) => {
  if (!isOpen || !gameType) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/90 md:bg-stone-900/80 md:backdrop-blur-md p-0 md:p-4">
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

        {/* 2. GAME CONTENT */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {gameType === 'wordle' && (
            <WordleGame onClose={onClose} isHighContrast={isHighContrast} />
          )}
        </div>

      </div>
    </div>
  );
};

export default GameModal;
