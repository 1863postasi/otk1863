import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Lock, Flame, Trophy, Map, Calendar, 
  Smile, HelpCircle, PenTool, User, Medal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/Boundle/GameCard';
import GameModal from '../components/Boundle/GameModal';
import { subscribeToLeaderboard, LeaderboardUser } from '../lib/boundle_service';
import { cn } from '../lib/utils';

const Boundle: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [isGameOpen, setIsGameOpen] = useState(false);

  // Real-time Leaderboard Subscription
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setLeaderboard(data);
      setLoadingLB(false);
    });
    return () => unsubscribe();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper for Rank Icons
  const getRankIcon = (index: number) => {
      if (index === 0) return <Medal size={20} className="text-yellow-500 fill-yellow-500" />;
      if (index === 1) return <Medal size={20} className="text-stone-400 fill-stone-400" />;
      if (index === 2) return <Medal size={20} className="text-orange-700 fill-orange-700" />;
      return <span className="font-mono font-bold text-stone-400 w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] pb-20">
      
      {/* GAME MODAL */}
      <GameModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />

      {/* HERO / HEADER */}
      <div className="bg-stone-900 text-stone-100 pt-16 pb-24 px-4 relative overflow-hidden">
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform rotate-12">
              <Gamepad2 size={300} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                  <h4 className="text-boun-gold font-bold uppercase tracking-widest text-xs mb-2">Günlük Zeka Oyunları</h4>
                  <h1 className="font-serif text-4xl md:text-6xl font-bold mb-2 flex items-center gap-3">
                      Boundle
                  </h1>
                  <p className="text-stone-400 max-w-lg text-sm md:text-base font-light">
                      Boğaziçi kültürünü ne kadar tanıyorsun? Her gün yeni bir bulmaca çöz, puanları topla, ismini efsaneler arasına yazdır.
                  </p>
              </div>
              
              {/* Mobile Stats Summary (Visible only on small screens) */}
              <div className="md:hidden w-full bg-stone-800/50 rounded-lg p-4 border border-stone-700 flex justify-around">
                  <div className="text-center">
                      <div className="text-2xl font-bold text-white">{userProfile?.boundleTotalPoints || 0}</div>
                      <div className="text-[10px] text-stone-400 uppercase">Puan</div>
                  </div>
                  <div className="text-center">
                      <div className="text-2xl font-bold text-boun-gold flex items-center justify-center gap-1">
                          {userProfile?.boundleStreak || 0} <Flame size={16} fill="currentColor" />
                      </div>
                      <div className="text-[10px] text-stone-400 uppercase">Seri</div>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: GAME GRID (BENTO) */}
              <div className="lg:col-span-8">
                  <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]"
                  >
                      {/* CARD 1: WORDLE (Main Game) */}
                      <motion.div variants={item} className="md:col-span-2 md:row-span-2">
                          <GameCard 
                              title="Kelime (Wordle)" 
                              description="5 Harfli, Boğaziçi temalı günlük kelime avı. Her gün yeni bir kelime."
                              status="active"
                              icon={<PenTool size={32} />}
                              onClick={() => setIsGameOpen(true)}
                              span={true}
                              imageUrl="https://cdn.1863postasi.org/boundle/wordle-bg.jpg"
                          />
                      </motion.div>

                      {/* CARD 2: MAP */}
                      <motion.div variants={item}>
                          <GameCard 
                              title="Kampüs Krokisi" 
                              status="coming_soon"
                              icon={<Map size={24} />}
                              description="Binaları kuşbakışı tanıyabilir misin?"
                          />
                      </motion.div>

                      {/* CARD 3: HISTORY */}
                      <motion.div variants={item}>
                          <GameCard 
                              title="Tarihte Bugün" 
                              status="coming_soon"
                              icon={<Calendar size={24} />}
                              description="Arşivden çıkan olayları kronolojiye diz."
                          />
                      </motion.div>

                      {/* CARD 4: EMOJI */}
                      <motion.div variants={item}>
                          <GameCard 
                              title="Emoji Bulmaca" 
                              status="coming_soon"
                              icon={<Smile size={24} />}
                              description="Emojilerle anlatılan mekanı veya hocayı bul."
                          />
                      </motion.div>

                      {/* CARD 5: TEACHER GUESS */}
                      <motion.div variants={item}>
                          <GameCard 
                              title="Hoca Tahmini" 
                              status="coming_soon"
                              icon={<HelpCircle size={24} />}
                              description="Anonim sözlerinden hocayı tahmin et."
                          />
                      </motion.div>

                  </motion.div>
              </div>

              {/* RIGHT COLUMN: STATS & LEADERBOARD */}
              <div className="lg:col-span-4 space-y-6">
                  
                  {/* USER STATS CARD (Sticky Desktop) */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm sticky top-20"
                  >
                      {/* User Info */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                          <div className="w-14 h-14 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-stone-400 shrink-0">
                              {userProfile?.photoUrl ? (
                                  <img src={userProfile.photoUrl} alt="Me" className="w-full h-full object-cover" />
                              ) : (
                                  <User size={24} />
                              )}
                          </div>
                          <div>
                              <h3 className="font-serif font-bold text-lg text-stone-900">{userProfile?.displayName || userProfile?.username}</h3>
                              <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{userProfile?.department || "Öğrenci"}</p>
                          </div>
                      </div>

                      {/* Points Display */}
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-stone-500 text-sm font-medium">Toplam Puan</span>
                          <span className="font-serif font-bold text-3xl text-stone-900">{userProfile?.boundleTotalPoints || 0}</span>
                      </div>
                      
                      {/* Streak Display */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg p-3 border border-orange-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-orange-200 rounded-full text-orange-700">
                                  <Flame size={16} fill="currentColor" />
                              </div>
                              <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Günlük Seri</span>
                          </div>
                          <span className="font-bold text-xl text-orange-900">{userProfile?.boundleStreak || 0} <span className="text-xs font-normal opacity-70">Gün</span></span>
                      </div>
                  </motion.div>

                  {/* LEADERBOARD LIST */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]"
                  >
                      <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
                          <h3 className="font-serif font-bold text-stone-800 flex items-center gap-2">
                              <Trophy size={16} className="text-boun-gold"/> Zirvedekiler
                          </h3>
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-2 py-0.5 rounded font-bold">TOP 20</span>
                      </div>
                      
                      <div className="overflow-y-auto custom-scrollbar">
                          {loadingLB ? (
                              <div className="p-4 space-y-3">
                                  {[...Array(5)].map((_, i) => (
                                      <div key={i} className="flex items-center gap-3 animate-pulse">
                                          <div className="w-6 h-6 bg-stone-200 rounded-full"></div>
                                          <div className="w-8 h-8 bg-stone-200 rounded-full"></div>
                                          <div className="flex-1 h-4 bg-stone-200 rounded"></div>
                                      </div>
                                  ))}
                              </div>
                          ) : leaderboard.length === 0 ? (
                              <div className="p-8 text-center text-stone-400 text-sm">Henüz veri yok.</div>
                          ) : (
                              <div className="divide-y divide-stone-50">
                                  {leaderboard.map((user, idx) => {
                                      const isMe = currentUser?.uid === user.uid;
                                      return (
                                          <div 
                                            key={user.uid} 
                                            className={cn(
                                                "flex items-center gap-3 p-3 px-4 transition-colors text-sm", 
                                                isMe ? "bg-stone-100 border-l-4 border-l-boun-gold" : "hover:bg-stone-50"
                                            )}
                                          >
                                              {/* Rank */}
                                              <div className="w-6 flex justify-center shrink-0">
                                                  {getRankIcon(idx)}
                                              </div>

                                              {/* Avatar */}
                                              <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center text-stone-400 shrink-0 border border-stone-300">
                                                  {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover"/> : <User size={14}/>}
                                              </div>

                                              {/* Name */}
                                              <div className="flex-1 min-w-0">
                                                  <div className={cn("font-bold truncate", isMe ? "text-stone-900" : "text-stone-700")}>
                                                      {user.displayName} {isMe && "(Sen)"}
                                                  </div>
                                                  <div className="text-[10px] text-stone-400 truncate">{user.department}</div>
                                              </div>

                                              {/* Points */}
                                              <div className="font-mono font-bold text-stone-600">
                                                  {user.boundleTotalPoints}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          )}
                      </div>
                  </motion.div>

              </div>
          </div>
      </div>
    </div>
  );
};

export default Boundle;