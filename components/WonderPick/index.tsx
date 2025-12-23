"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Wand2 } from "lucide-react";
import confetti from "canvas-confetti";
import { PokemonCard } from "@/components/Card";
import type { Card } from "@/lib/data";
import { generateWonderPick } from "@/lib/wonder-pick";
import { useSounds, type RarityLevel } from "@/lib/useSounds";
import { useCollection } from "@/lib/collection";

interface WonderPickProps {
  cards: Card[];
  setName: string;
  getImagePath: (card: Card) => string;
}

const RARITY_MAP: Record<string, RarityLevel> = {
  "common": "common",
  "uncommon": "uncommon",
  "rare": "rare",
  "double-rare": "super-rare",
  "art-rare": "super-rare",
  "super-rare": "super-rare",
  "special-art-rare": "ultra-rare",
  "ultra-rare": "ultra-rare",
  "crown": "crown",
  "immersive": "immersive",
};

const GLOW_RARITIES = ["rare", "art-rare", "super-rare", "special-art-rare", "ultra-rare", "crown", "immersive"];
const CONFETTI_RARITIES = ["art-rare", "super-rare", "special-art-rare", "ultra-rare", "crown", "immersive"];
const SUPER_RARE_RARITIES = ["super-rare", "special-art-rare", "ultra-rare", "crown", "immersive"];
const LEGENDARY_RARITIES = ["crown", "immersive"];

const fireRareConfetti = () => {
  confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 }, colors: ["#FFD700", "#FFA500"] });
};

const fireSuperRareConfetti = () => {
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 2, angle: 60, spread: 45, origin: { x: 0 }, colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] });
    confetti({ particleCount: 2, angle: 120, spread: 45, origin: { x: 1 }, colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

const fireLegendaryConfetti = () => {
  const end = Date.now() + 2000;
  const colors = ["#FFD700", "#FFF200", "#FF6B6B", "#E040FB", "#00E5FF"];
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors, shapes: ["star", "circle"], scalar: 1.1 });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors, shapes: ["star", "circle"], scalar: 1.1 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

type GameState = 
  | "idle" 
  | "preview"      // Show 5 cards face up
  | "shuffling"    // Shuffle animation
  | "selecting"    // Player picks one (cards face down)
  | "suspense"     // Suspenseful reveal sequence
  | "revealed";    // Final result

// Card positions for the arc layout (mobile)
const CARD_POSITIONS_MOBILE = [
  { x: -140, y: 25, rotate: -12 },
  { x: -70, y: 5, rotate: -6 },
  { x: 0, y: 0, rotate: 0 },
  { x: 70, y: 5, rotate: 6 },
  { x: 140, y: 25, rotate: 12 },
];

// Card positions for desktop (wider spread)
const CARD_POSITIONS_DESKTOP = [
  { x: -220, y: 30, rotate: -12 },
  { x: -110, y: 8, rotate: -6 },
  { x: 0, y: 0, rotate: 0 },
  { x: 110, y: 8, rotate: 6 },
  { x: 220, y: 30, rotate: 12 },
];

const STACKED_POSITION = { x: 0, y: 0, rotate: 0 };

// Hook to detect desktop
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

export function WonderPick({ cards, setName, getImagePath }: WonderPickProps) {
  const isDesktop = useIsDesktop();
  const CARD_POSITIONS = isDesktop ? CARD_POSITIONS_DESKTOP : CARD_POSITIONS_MOBILE;
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [pickCards, setPickCards] = useState<Card[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cardPositions, setCardPositions] = useState<typeof CARD_POSITIONS_MOBILE>([...CARD_POSITIONS_MOBILE]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [newCardIndices, setNewCardIndices] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const { 
    playCardFlip, 
    playRarityReveal, 
    playWonderPickIntro,
    playWonderPickShuffle,
    playWonderPickSuspense,
    playWonderPickRevealOther,
    playWonderPickWin,
    playWonderPickMiss,
    isMuted, 
    toggleMute 
  } = useSounds();
  const { addCard, hasCard, collection } = useCollection();

  const ownedCardIds = useMemo(() => new Set(Object.keys(collection.cards).filter(id => collection.cards[id] > 0)), [collection.cards]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/card-back.webp";
  }, []);

  const triggerEffects = useCallback((card: Card) => {
    const rarity = card.rarity || "common";
    if (LEGENDARY_RARITIES.includes(rarity)) {
      setScreenFlash("legendary");
      fireLegendaryConfetti();
      setTimeout(() => setScreenFlash(null), 600);
    } else if (SUPER_RARE_RARITIES.includes(rarity)) {
      setScreenFlash("super-rare");
      fireSuperRareConfetti();
      setTimeout(() => setScreenFlash(null), 400);
    } else if (CONFETTI_RARITIES.includes(rarity)) {
      setScreenFlash("rare");
      fireRareConfetti();
      setTimeout(() => setScreenFlash(null), 300);
    }
  }, []);

  const startNewPick = useCallback(() => {
    // Clear previous timeouts
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];

    const newCards = generateWonderPick(cards, ownedCardIds, 5);
    newCards.forEach(card => {
      const img = new Image();
      img.src = getImagePath(card);
    });
    
    // Determine which cards are NEW (not owned)
    const newIndices = new Set<number>();
    newCards.forEach((card, i) => {
      if (!ownedCardIds.has(card.id)) {
        newIndices.add(i);
      }
    });
    
    setPickCards(newCards);
    setNewCardIndices(newIndices);
    setSelectedIndex(null);
    setRevealedIndices(new Set([0, 1, 2, 3, 4])); // All cards face up in preview
    setCardPositions([...CARD_POSITIONS]);
    setGameState("preview");
    playWonderPickIntro();
  }, [cards, ownedCardIds, getImagePath, playWonderPickIntro]);

  const startShuffle = useCallback(() => {
    setRevealedIndices(new Set()); // Flip all cards face down
    setGameState("shuffling");
    
    let count = 0;
    const maxShuffles = 6;
    
    // Stack cards first
    setCardPositions(Array(5).fill(STACKED_POSITION));
    
    const shuffleInterval = setInterval(() => {
      count++;
      playWonderPickShuffle();
      
      // Random shuffle positions
      const shuffled = [...CARD_POSITIONS].sort(() => Math.random() - 0.5);
      setCardPositions(shuffled);
      
      if (count >= maxShuffles) {
        clearInterval(shuffleInterval);
        // Final spread
        const t = setTimeout(() => {
          setCardPositions([...CARD_POSITIONS]);
          setGameState("selecting");
        }, 300);
        timeoutsRef.current.push(t);
      }
    }, 250);
  }, [playWonderPickShuffle]);

  const selectCard = useCallback((index: number) => {
    if (gameState !== "selecting" || selectedIndex !== null) return;
    
    setSelectedIndex(index);
    playCardFlip();
    setGameState("suspense");
    playWonderPickSuspense();

    const playerPickedNew = newCardIndices.has(index);
    
    // Find indices of new and non-new cards (excluding selected)
    const otherIndices = [0, 1, 2, 3, 4].filter(i => i !== index);
    const otherNewIndices = otherIndices.filter(i => newCardIndices.has(i));
    const otherOwnedIndices = otherIndices.filter(i => !newCardIndices.has(i));
    
    let revealOrder: number[] = [];
    
    if (playerPickedNew) {
      // Player picked NEW card: reveal non-new cards first, then new cards, then player's card last
      revealOrder = [...otherOwnedIndices, ...otherNewIndices, index];
    } else {
      // Player picked owned card: reveal player's card first, then others, save NEW cards for last
      revealOrder = [index, ...otherOwnedIndices, ...otherNewIndices];
    }
    
    // Reveal cards one by one with suspense
    let delay = 1800; // Start after suspense sound
    revealOrder.forEach((cardIndex, i) => {
      const t = setTimeout(() => {
        playWonderPickRevealOther();
        setRevealedIndices(prev => new Set([...prev, cardIndex]));
        
        // Trigger effects for rare cards
        const card = pickCards[cardIndex];
        if (CONFETTI_RARITIES.includes(card.rarity || "")) {
          triggerEffects(card);
        }
        
        // Last card - play result sound and finish
        if (i === revealOrder.length - 1) {
          const finalT = setTimeout(() => {
            if (playerPickedNew) {
              playWonderPickWin();
              const rarityLevel = RARITY_MAP[pickCards[index].rarity || "common"] || "common";
              playRarityReveal(rarityLevel);
            } else {
              playWonderPickMiss();
            }
            addCard(pickCards[index].id);
            setGameState("revealed");
          }, 400);
          timeoutsRef.current.push(finalT);
        }
      }, delay + i * 600);
      timeoutsRef.current.push(t);
    });
  }, [gameState, selectedIndex, newCardIndices, pickCards, playCardFlip, playWonderPickSuspense, playWonderPickRevealOther, playWonderPickWin, playWonderPickMiss, playRarityReveal, triggerEffects, addCard]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setGameState("idle");
    setPickCards([]);
    setSelectedIndex(null);
    setCardPositions([...CARD_POSITIONS]);
    setScreenFlash(null);
    setRevealedIndices(new Set());
    setNewCardIndices(new Set());
  }, []);

  const getGlowClass = (card: Card, isRevealed: boolean) => {
    if (!isRevealed) return "";
    const rarity = card.rarity || "";
    if (LEGENDARY_RARITIES.includes(rarity)) return "shadow-[0_0_30px_rgba(34,211,238,0.6)]";
    if (SUPER_RARE_RARITIES.includes(rarity)) return "shadow-[0_0_25px_rgba(168,85,247,0.5)]";
    if (GLOW_RARITIES.includes(rarity)) return "shadow-[0_0_20px_rgba(250,204,21,0.4)]";
    return "";
  };

  const playerPickedNew = selectedIndex !== null && newCardIndices.has(selectedIndex);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      {/* Screen Flash */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={`fixed inset-0 z-40 pointer-events-none ${
              screenFlash === "legendary" ? "bg-gradient-to-r from-yellow-400/40 via-purple-500/40 to-cyan-400/40" 
              : screenFlash === "super-rare" ? "bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-indigo-500/30"
              : "bg-yellow-400/20"
            }`}
          />
        )}
      </AnimatePresence>

      {/* Mute Button */}
      <button 
        className="fixed top-20 right-4 z-50 w-10 h-10 rounded-full bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-black/60 hover:text-gray-900 dark:hover:text-white transition-all shadow-md dark:shadow-none"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <AnimatePresence mode="wait">
        {/* Idle State */}
        {gameState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Wand2 className="w-6 h-6 text-amber-500 dark:text-yellow-400" />
                Wonder Pick
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{setName}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Chọn 1 trong 5 thẻ bí ẩn</p>
            </div>

            <motion.button
              onClick={startNewPick}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 dark:from-yellow-500 dark:to-amber-600 text-white dark:text-black font-bold text-lg hover:from-amber-400 hover:to-orange-400 dark:hover:from-yellow-400 dark:hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 dark:shadow-yellow-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bắt đầu
            </motion.button>
          </motion.div>
        )}

        {/* Preview State - Show cards face up */}
        {gameState === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.p
              className="text-amber-600 dark:text-yellow-400 font-medium text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              5 thẻ bạn có thể nhận được!
            </motion.p>
            
            <div className="relative w-[340px] md:w-[560px] h-52 md:h-72 flex items-center justify-center">
              {pickCards.map((card, index) => {
                const isNew = newCardIndices.has(index);
                const isRevealed = revealedIndices.has(index);
                return (
                  <motion.div
                    key={index}
                    className={`absolute w-20 md:w-28 aspect-[5/7] ${getGlowClass(card, isRevealed)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: CARD_POSITIONS[index].x,
                      y: CARD_POSITIONS[index].y,
                      rotate: CARD_POSITIONS[index].rotate,
                    }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <PokemonCard
                      card={card}
                      imageSrc={getImagePath(card)}
                      isFlipped={isRevealed}
                      showBack={true}
                    />
                    {isNew && isRevealed && (
                      <motion.span 
                        className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded font-bold shadow-lg z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        NEW
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              onClick={startShuffle}
              className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Xáo bài
            </motion.button>
          </motion.div>
        )}

        {/* Shuffling State */}
        {gameState === "shuffling" && (
          <motion.div
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.p
              className="text-amber-600 dark:text-yellow-400 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              Đang xáo bài...
            </motion.p>
            
            <div className="relative w-[340px] md:w-[560px] h-52 md:h-72 flex items-center justify-center">
              {pickCards.map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute w-20 md:w-28 aspect-[5/7]"
                  animate={{
                    x: cardPositions[index]?.x || 0,
                    y: cardPositions[index]?.y || 0,
                    rotate: cardPositions[index]?.rotate || 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="/images/card-back.webp"
                      alt="Card back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selecting State */}
        {gameState === "selecting" && (
          <motion.div
            key="selecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">Chọn một thẻ!</p>
            
            <div className="relative w-[340px] md:w-[560px] h-52 md:h-72 flex items-center justify-center">
              {pickCards.map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute w-20 md:w-28 aspect-[5/7] cursor-pointer"
                  style={{
                    x: CARD_POSITIONS[index].x,
                    y: CARD_POSITIONS[index].y,
                    rotate: CARD_POSITIONS[index].rotate,
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    y: CARD_POSITIONS[index].y - 15,
                    zIndex: 10,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectCard(index)}
                >
                  <div className="w-full h-full rounded-lg overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-yellow-500/30 transition-shadow">
                    <img
                      src="/images/card-back.webp"
                      alt="Card back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.span 
                    className="absolute -bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2 bg-amber-400/90 text-black text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    Chọn
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suspense / Revealed State */}
        {(gameState === "suspense" || gameState === "revealed") && selectedIndex !== null && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {gameState === "suspense" && (
              <motion.p
                className="text-amber-600 dark:text-yellow-400 font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                Đang mở...
              </motion.p>
            )}
            
            <div className="relative w-[340px] md:w-[560px] h-52 md:h-72 flex items-center justify-center">
              {pickCards.map((card, index) => {
                const isSelected = index === selectedIndex;
                const isRevealed = revealedIndices.has(index);
                const isNew = newCardIndices.has(index);
                
                return (
                  <motion.div
                    key={index}
                    className={`absolute w-20 md:w-28 aspect-[5/7] ${getGlowClass(card, isRevealed)} ${isSelected ? "z-20" : ""}`}
                    initial={{
                      x: CARD_POSITIONS[index].x,
                      y: CARD_POSITIONS[index].y,
                      rotate: CARD_POSITIONS[index].rotate,
                    }}
                    animate={gameState === "revealed" && isSelected ? {
                      x: 0,
                      y: -20,
                      rotate: 0,
                      scale: 1.5,
                    } : {
                      x: CARD_POSITIONS[index].x,
                      y: CARD_POSITIONS[index].y,
                      rotate: CARD_POSITIONS[index].rotate,
                      scale: gameState === "revealed" && !isSelected ? 0.8 : 1,
                      opacity: gameState === "revealed" && !isSelected ? 0.5 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <PokemonCard
                      card={card}
                      imageSrc={getImagePath(card)}
                      isFlipped={isRevealed}
                      showBack={true}
                    />
                    {isNew && isRevealed && (
                      <motion.span 
                        className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded font-bold shadow-lg z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        NEW
                      </motion.span>
                    )}
                    {isSelected && !isRevealed && (
                      <motion.div 
                        className="absolute inset-0 rounded-lg border-2 border-yellow-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {gameState === "revealed" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-3 mt-4"
              >
                <div className="text-center">
                  <h3 className="text-gray-900 dark:text-white font-medium text-lg">{pickCards[selectedIndex].name}</h3>
                  {playerPickedNew ? (
                    <motion.span 
                      className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded font-bold mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      Thẻ mới!
                    </motion.span>
                  ) : (
                    <span className="inline-block text-gray-500 dark:text-gray-400 text-xs mt-2">
                      Đã có trong bộ sưu tập
                    </span>
                  )}
                </div>

                <motion.button
                  className="px-6 py-2.5 text-sm rounded-full bg-amber-500 text-white dark:text-black font-medium hover:bg-amber-400 transition-colors"
                  onClick={reset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Chơi tiếp
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
