"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";
import { PokemonCard } from "@/components/Card";
import type { Card } from "@/lib/data";
import { openPackClient } from "@/lib/client-data";
import { useSounds, type RarityLevel } from "@/lib/useSounds";
import { useCollection } from "@/lib/collection";

interface PackOpeningProps {
  cards: Card[];
  setId: string;
  setName: string;
  packImage: string;
  getImagePath: (card: Card) => string;
  booster?: string;
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

const getPackSize = (setId: string): number => {
  if (setId === "A4B") return 4;
  if (setId === "P-A" || setId === "P-B") return 1;
  return 5;
};

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

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

type GameState = "idle" | "opening" | "revealing" | "revealed" | "multi-opening" | "multi-revealing" | "multi-viewing" | "multi-summary";

interface MultiPackData {
  cards: Card[];
}

export function PackOpening({ cards, setId, setName, packImage, getImagePath, booster }: PackOpeningProps) {
  const packSize = getPackSize(setId);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [packCards, setPackCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const cardsAddedRef = useRef(false);

  // Multi-pack state
  const [multiPacks, setMultiPacks] = useState<MultiPackData[]>([]);
  const [currentMultiIndex, setCurrentMultiIndex] = useState(0);
  const autoRevealRef = useRef<NodeJS.Timeout | null>(null);
  const MULTI_PACK_COUNT = 10;
  
  const { playPackOpen, playCardFlip, playRarityReveal, playMultiPackStart, playMultiPackComplete, isMuted, toggleMute } = useSounds();
  const { addCards, hasCard } = useCollection();
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    preloadImage("/images/card-back.webp");
  }, []);

  useEffect(() => {
    if (gameState === "revealed" && packCards.length > 0 && !cardsAddedRef.current) {
      cardsAddedRef.current = true;
      addCards(packCards.map((c) => c.id));
    }
  }, [gameState, packCards, addCards]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRevealRef.current) clearTimeout(autoRevealRef.current);
    };
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

  // Single pack functions
  const openPack = useCallback(() => {
    setGameState("opening");
    setFlippedIndices(new Set());
    cardsAddedRef.current = false;
    playPackOpen();

    const newPack = openPackClient(cards, packSize, booster, setId);
    newPack.forEach(card => preloadImage(getImagePath(card)));
    
    // Track which cards are new (not in collection yet)
    const newIds = new Set(newPack.filter(card => !hasCard(card.id)).map(card => card.id));
    setNewCardIds(newIds);

    setTimeout(() => {
      setPackCards(newPack);
      setGameState("revealing");
    }, 1600);
  }, [cards, packSize, playPackOpen, getImagePath, booster, setId, hasCard]);

  const toggleCard = useCallback((index: number) => {
    const card = packCards[index];
    if (flippedIndices.has(index)) return;
    
    playCardFlip();
    
    setFlippedIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      const rarityLevel = RARITY_MAP[card.rarity || "common"] || "common";
      setTimeout(() => {
        playRarityReveal(rarityLevel);
        if (CONFETTI_RARITIES.includes(card.rarity || "")) {
          triggerEffects(card);
        }
      }, 250);
      if (newSet.size === packCards.length && gameState === "revealing") {
        setTimeout(() => setGameState("revealed"), 350);
      }
      return newSet;
    });
  }, [packCards, flippedIndices, playCardFlip, playRarityReveal, triggerEffects, gameState]);

  const revealAll = useCallback(() => {
    packCards.forEach((card, i) => {
      if (flippedIndices.has(i)) return;
      setTimeout(() => {
        playCardFlip();
        setFlippedIndices((prev) => {
          const newSet = new Set(prev);
          newSet.add(i);
          const rarityLevel = RARITY_MAP[card.rarity || "common"] || "common";
          setTimeout(() => {
            playRarityReveal(rarityLevel);
            if (CONFETTI_RARITIES.includes(card.rarity || "")) triggerEffects(card);
          }, 150);
          if (newSet.size === packCards.length && gameState === "revealing") {
            setTimeout(() => setGameState("revealed"), 350);
          }
          return newSet;
        });
      }, i * 150);
    });
  }, [packCards, flippedIndices, playCardFlip, playRarityReveal, triggerEffects, gameState]);

  const reset = useCallback(() => {
    if (autoRevealRef.current) clearTimeout(autoRevealRef.current);
    setGameState("idle");
    setPackCards([]);
    setFlippedIndices(new Set());
    setScreenFlash(null);
    cardsAddedRef.current = false;
    setMultiPacks([]);
    setCurrentMultiIndex(0);
    setNewCardIds(new Set());
  }, []);

  // Multi-pack auto functions
  const startMultiPack = useCallback(() => {
    playMultiPackStart();
    
    // Generate all packs upfront
    const packs: MultiPackData[] = [];
    const collectedIds = new Set<string>();
    const newIds = new Set<string>();
    
    for (let i = 0; i < MULTI_PACK_COUNT; i++) {
      const newPack = openPackClient(cards, packSize, booster, setId);
      newPack.forEach(card => {
        preloadImage(getImagePath(card));
        // Track new cards (not in collection AND not already seen in this batch)
        if (!hasCard(card.id) && !collectedIds.has(card.id)) {
          newIds.add(card.id);
        }
        collectedIds.add(card.id);
      });
      packs.push({ cards: newPack });
    }
    
    setNewCardIds(newIds);
    setMultiPacks(packs);
    setCurrentMultiIndex(0);
    
    // Add all cards to collection
    const allCardIds = packs.flatMap(p => p.cards.map(c => c.id));
    addCards(allCardIds);
    
    // Start opening first pack
    setGameState("multi-opening");
  }, [cards, packSize, booster, setId, getImagePath, playMultiPackStart, addCards, hasCard]);

  // Auto reveal current multi-pack cards
  const autoRevealMultiPack = useCallback(() => {
    const currentPack = multiPacks[currentMultiIndex];
    if (!currentPack) return;

    currentPack.cards.forEach((card, i) => {
      setTimeout(() => {
        playCardFlip();
        setFlippedIndices((prev) => {
          const newSet = new Set(prev);
          newSet.add(i);
          const rarityLevel = RARITY_MAP[card.rarity || "common"] || "common";
          setTimeout(() => {
            playRarityReveal(rarityLevel);
            if (CONFETTI_RARITIES.includes(card.rarity || "")) triggerEffects(card);
          }, 120);
          return newSet;
        });
      }, i * 120);
    });

    // After all cards revealed, wait then move to next
    const revealTime = multiPacks[currentMultiIndex].cards.length * 120 + 400;
    autoRevealRef.current = setTimeout(() => {
      setGameState("multi-viewing");
      
      // Wait 1.8s for user to see, then next pack
      autoRevealRef.current = setTimeout(() => {
        if (currentMultiIndex < MULTI_PACK_COUNT - 1) {
          setCurrentMultiIndex(prev => prev + 1);
          setFlippedIndices(new Set());
          setGameState("multi-opening");
        } else {
          // All done
          playMultiPackComplete();
          setGameState("multi-summary");
        }
      }, 1800);
    }, revealTime);
  }, [multiPacks, currentMultiIndex, playCardFlip, playRarityReveal, triggerEffects, playMultiPackComplete]);

  // Handle multi-pack state transitions
  useEffect(() => {
    if (gameState === "multi-opening" && multiPacks.length > 0) {
      const currentPack = multiPacks[currentMultiIndex];
      if (currentPack) {
        playPackOpen();
        setPackCards(currentPack.cards);
        setFlippedIndices(new Set());
        
        // After pack open animation, start revealing
        autoRevealRef.current = setTimeout(() => {
          setGameState("multi-revealing");
        }, 1400);
      }
    }
  }, [gameState, multiPacks, currentMultiIndex, playPackOpen]);

  useEffect(() => {
    if (gameState === "multi-revealing") {
      autoRevealMultiPack();
    }
  }, [gameState, autoRevealMultiPack]);

  const getGlowClass = (card: Card, isFlipped: boolean) => {
    if (!isFlipped) return "";
    const rarity = card.rarity || "";
    if (LEGENDARY_RARITIES.includes(rarity)) return "shadow-[0_0_25px_rgba(34,211,238,0.5)]";
    if (SUPER_RARE_RARITIES.includes(rarity)) return "shadow-[0_0_20px_rgba(168,85,247,0.4)]";
    if (GLOW_RARITIES.includes(rarity)) return "shadow-[0_0_15px_rgba(250,204,21,0.35)]";
    return "";
  };

  const renderCards = (isMulti = false) => {
    const cardList = packCards;
    
    if (packSize === 1) {
      return (
        <div className="flex justify-center w-full max-w-[180px]">
          {cardList.map((card, index) => {
            const isFlipped = flippedIndices.has(index);
            const isNew = newCardIds.has(card.id);
            return (
              <motion.div
                key={`${card.id}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.3, type: "spring" }}
                className={`aspect-[5/7] relative ${isMulti ? "" : "cursor-pointer"} w-full rounded-lg ${getGlowClass(card, isFlipped)} transition-shadow duration-300`}
                onClick={() => !isMulti && toggleCard(index)}
              >
                <PokemonCard card={card} imageSrc={getImagePath(card)} isFlipped={isFlipped} showBack={true} />
                {!isFlipped && !isMulti && <TapHint />}
                {isFlipped && isNew && <NewBadge />}
              </motion.div>
            );
          })}
        </div>
      );
    }

    if (packSize === 4) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 w-full max-w-md md:max-w-2xl">
          {cardList.map((card, index) => {
            const isFlipped = flippedIndices.has(index);
            const isNew = newCardIds.has(card.id);
            return (
              <motion.div
                key={`${card.id}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.3, type: "spring" }}
                className={`aspect-[5/7] relative ${isMulti ? "" : "cursor-pointer"} rounded-lg ${getGlowClass(card, isFlipped)} transition-shadow duration-300`}
                onClick={() => !isMulti && toggleCard(index)}
              >
                <PokemonCard card={card} imageSrc={getImagePath(card)} isFlipped={isFlipped} showBack={true} />
                {!isFlipped && !isMulti && <TapHint />}
                {isFlipped && isNew && <NewBadge />}
              </motion.div>
            );
          })}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
          {cardList.slice(0, 3).map((card, index) => {
            const isFlipped = flippedIndices.has(index);
            const isNew = newCardIds.has(card.id);
            return (
              <motion.div
                key={`${card.id}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.3, type: "spring" }}
                className={`aspect-[5/7] relative ${isMulti ? "" : "cursor-pointer"} rounded-lg ${getGlowClass(card, isFlipped)} transition-shadow duration-300`}
                onClick={() => !isMulti && toggleCard(index)}
              >
                <PokemonCard card={card} imageSrc={getImagePath(card)} isFlipped={isFlipped} showBack={true} />
                {!isFlipped && !isMulti && <TapHint />}
                {isFlipped && isNew && <NewBadge />}
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 sm:gap-3 w-2/3">
          {cardList.slice(3, 5).map((card, index) => {
            const actualIndex = index + 3;
            const isFlipped = flippedIndices.has(actualIndex);
            const isNew = newCardIds.has(card.id);
            return (
              <motion.div
                key={`${card.id}-${actualIndex}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: actualIndex * 0.08, duration: 0.3, type: "spring" }}
                className={`aspect-[5/7] relative ${isMulti ? "" : "cursor-pointer"} flex-1 rounded-lg ${getGlowClass(card, isFlipped)} transition-shadow duration-300`}
                onClick={() => !isMulti && toggleCard(actualIndex)}
              >
                <PokemonCard card={card} imageSrc={getImagePath(card)} isFlipped={isFlipped} showBack={true} />
                {!isFlipped && !isMulti && <TapHint />}
                {isFlipped && isNew && <NewBadge />}
              </motion.div>
            );
          })}
        </div>
      </>
    );
  };

  const isMultiMode = gameState.startsWith("multi-");

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
        className="fixed top-20 right-4 z-50 w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white transition-all"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <AnimatePresence mode="wait">
        {/* Idle */}
        {gameState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <motion.div
              className="w-44 relative cursor-pointer rounded-xl overflow-hidden shadow-xl bg-black/80"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={openPack}
            >
              <img src={packImage} alt={setName} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-600" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white text-xs font-medium">{setName}</span>
                <span className="block text-white/50 text-[10px] mt-0.5">Tap to open</span>
              </div>
            </motion.div>

            {packSize > 1 && (
              <button
                onClick={startMultiPack}
                className="text-sm text-white/60 hover:text-white/90 underline underline-offset-4 transition-colors"
              >
                Open 10 packs (auto)
              </button>
            )}
          </motion.div>
        )}

        {/* Single Pack Opening Animation */}
        {gameState === "opening" && (
          <motion.div key="opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
            <motion.div
              className="w-44 relative rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.4)] bg-black/80"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: [1, 1.04, 1.08, 1.1, 0], rotate: [0, -2, 2, -1, 0], y: [0, -6, -10, -14, -60] }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              <img src={packImage} alt={setName} className="w-full h-auto" />
            </motion.div>
          </motion.div>
        )}

        {/* Single Pack Cards Reveal */}
        {(gameState === "revealing" || gameState === "revealed") && (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-3 max-w-2xl px-2">
            <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
              {renderCards(false)}
            </div>

            <div className="flex gap-3 mt-4">
              {gameState === "revealing" && flippedIndices.size < packCards.length && (
                <motion.button
                  className="px-5 py-2 text-sm rounded-full bg-white/10 text-white/80 border border-white/20 hover:bg-white/15 transition-colors"
                  onClick={revealAll}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Reveal All
                </motion.button>
              )}
              {gameState === "revealed" && (
                <motion.button
                  className="px-5 py-2 text-sm rounded-full bg-amber-500/90 text-black font-medium hover:bg-amber-400 transition-colors"
                  onClick={reset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Open Another
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* Multi-pack Opening Animation */}
        {gameState === "multi-opening" && (
          <motion.div key="multi-opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-4">
            <div className="text-sm text-white/70">Pack {currentMultiIndex + 1} / {MULTI_PACK_COUNT}</div>
            <motion.div
              className="w-40 relative rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.3)] bg-black/80"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: [1, 1.03, 1.06, 1.08, 0], rotate: [0, -1.5, 1.5, -1, 0], y: [0, -5, -8, -12, -50] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <img src={packImage} alt={setName} className="w-full h-auto" />
            </motion.div>
          </motion.div>
        )}

        {/* Multi-pack Cards Revealing/Viewing */}
        {(gameState === "multi-revealing" || gameState === "multi-viewing") && (
          <motion.div key="multi-cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-3 max-w-2xl px-2">
            <div className="text-sm text-white/70 mb-1">Pack {currentMultiIndex + 1} / {MULTI_PACK_COUNT}</div>
            <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
              {renderCards(true)}
            </div>
            {gameState === "multi-viewing" && (
              <motion.div 
                className="mt-3 text-xs text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {currentMultiIndex < MULTI_PACK_COUNT - 1 ? "Next pack coming..." : "Finishing up..."}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Multi-pack Summary */}
        {gameState === "multi-summary" && (
          <motion.div key="multi-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-5 max-w-3xl">
            <h2 className="text-lg font-medium text-white/90">{MULTI_PACK_COUNT} packs opened!</h2>

            <div className="w-full">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 max-h-[350px] overflow-y-auto p-1">
                {multiPacks.flatMap((pack, packIdx) => 
                  pack.cards.map((card, cardIdx) => {
                    const isRare = GLOW_RARITIES.includes(card.rarity || "");
                    const isSuperRare = SUPER_RARE_RARITIES.includes(card.rarity || "");
                    const isLegendary = LEGENDARY_RARITIES.includes(card.rarity || "");
                    const isNew = newCardIds.has(card.id);
                    return (
                      <motion.div
                        key={`${packIdx}-${cardIdx}-${card.id}`}
                        className={`aspect-[5/7] rounded overflow-hidden relative ${
                          isLegendary ? "ring-2 ring-cyan-400" : 
                          isSuperRare ? "ring-2 ring-purple-400" : 
                          isRare ? "ring-1 ring-yellow-400" : ""
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (packIdx * packSize + cardIdx) * 0.006 }}
                        whileHover={{ scale: 1.4, zIndex: 20 }}
                      >
                        <img src={getImagePath(card)} alt={card.name} className="w-full h-full object-cover" />
                        {isNew && <span className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[6px] px-1 py-px rounded font-bold">NEW</span>}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            <motion.button
              className="px-6 py-2.5 text-sm rounded-full bg-amber-500/90 text-black font-medium hover:bg-amber-400 transition-colors"
              onClick={reset}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TapHint() {
  return (
    <motion.span 
      className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400/90 text-black text-[9px] px-1.5 py-0.5 rounded font-medium"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
    >
      Tap
    </motion.span>
  );
}

function NewBadge() {
  return (
    <motion.span 
      className="absolute top-1 left-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-lg z-10"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
    >
      NEW
    </motion.span>
  );
}
