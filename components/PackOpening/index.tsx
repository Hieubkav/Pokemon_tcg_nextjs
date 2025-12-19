"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { PokemonCard } from "@/components/Card";
import type { Card } from "@/lib/data";
import { openPackClient } from "@/lib/client-data";
import { useSounds } from "@/lib/useSounds";
import { useCollection } from "@/lib/collection";

interface PackOpeningProps {
  cards: Card[];
  setName: string;
  packImage: string;
  getImagePath: (card: Card) => string;
  booster?: string;
}

const RARE_RARITIES = ["rare", "double-rare", "art-rare", "super-rare", "crown", "immersive"];

// Preload card back image
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

export function PackOpening({
  cards,
  setName,
  packImage,
  getImagePath,
  booster,
}: PackOpeningProps) {
  const [gameState, setGameState] = useState<"idle" | "opening" | "revealing" | "revealed">("idle");
  const [packCards, setPackCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const cardsAddedRef = useRef(false);
  
  const { playPackOpen, playCardFlip, playCardReveal, isMuted, toggleMute } = useSounds();
  const { addCards } = useCollection();

  // Preload card back on mount
  useEffect(() => {
    preloadImage("/images/card-back.webp");
  }, []);

  // Add cards to collection when all revealed
  useEffect(() => {
    if (gameState === "revealed" && packCards.length > 0 && !cardsAddedRef.current) {
      cardsAddedRef.current = true;
      addCards(packCards.map((c) => c.id));
    }
  }, [gameState, packCards, addCards]);

  const openPack = useCallback(() => {
    setGameState("opening");
    setFlippedIndices(new Set());
    playPackOpen();

    // Generate cards early but delay reveal for smoother animation
    const newPack = openPackClient(cards, 6, booster);
    
    // Preload all card images
    newPack.forEach(card => preloadImage(getImagePath(card)));

    setTimeout(() => {
      setPackCards(newPack);
      setGameState("revealing");
    }, 2200); // Longer delay for preloading
  }, [cards, playPackOpen, getImagePath]);

  const toggleCard = useCallback((index: number) => {
    const card = packCards[index];
    const isRare = card && RARE_RARITIES.includes(card.rarity || "");
    
    playCardFlip();
    
    setFlippedIndices((prev) => {
      const newSet = new Set(prev);
      if (prev.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        setTimeout(() => playCardReveal(isRare), 300);
      }
      
      if (newSet.size === packCards.length) {
        setTimeout(() => setGameState("revealed"), 500);
      }
      return newSet;
    });
  }, [packCards, playCardFlip, playCardReveal]);

  const revealAll = useCallback(() => {
    packCards.forEach((_, i) => {
      setTimeout(() => {
        if (!flippedIndices.has(i)) {
          playCardFlip();
          setFlippedIndices((prev) => {
            const newSet = new Set(prev);
            newSet.add(i);
            if (newSet.size === packCards.length) {
              setTimeout(() => setGameState("revealed"), 500);
            }
            return newSet;
          });
        }
      }, i * 150);
    });
  }, [packCards, flippedIndices, playCardFlip]);

  const reset = useCallback(() => {
    setGameState("idle");
    setPackCards([]);
    setFlippedIndices(new Set());
    cardsAddedRef.current = false;
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
      {/* Mute Button */}
      <button 
        className="fixed top-20 right-4 z-50 w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {/* Idle State */}
        {gameState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              className="w-48 relative cursor-pointer rounded-xl overflow-hidden shadow-2xl bg-black/90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openPack}
            >
              <img src={packImage} alt={setName} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-white text-sm font-semibold uppercase tracking-wide">{setName}</span>
                <span className="block text-white/60 text-xs mt-1 animate-pulse">Tap to Open</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Opening Animation */}
        {gameState === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <motion.div
              className="w-48 relative rounded-xl overflow-hidden shadow-[0_0_60px_rgba(255,215,0,0.5)] bg-black/90"
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: [1, 1.05, 1.1, 1.15, 1.2, 0],
                rotate: [0, -3, 3, -3, 3, 0],
                y: [0, -10, -15, -20, -25, -100],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <img src={packImage} alt={setName} className="w-full h-auto" />
            </motion.div>
          </motion.div>
        )}

        {/* Cards Reveal */}
        {(gameState === "revealing" || gameState === "revealed") && (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* 3x2 Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full max-w-2xl px-2">
              {packCards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4, type: "spring" }}
                  className="aspect-[5/7] relative cursor-pointer"
                  onClick={() => toggleCard(index)}
                >
                  <PokemonCard
                    card={card}
                    imageSrc={getImagePath(card)}
                    isFlipped={flippedIndices.has(index)}
                    showBack={true}
                  />
                  {!flippedIndices.has(index) && (
                    <motion.span 
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Tap
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {gameState === "revealing" && flippedIndices.size < packCards.length && (
                <motion.button
                  className="px-6 py-2.5 rounded-full bg-white/10 text-white border border-white/30 font-semibold hover:bg-white/20 transition-colors"
                  onClick={revealAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reveal All
                </motion.button>
              )}
              {gameState === "revealed" && (
                <motion.button
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-shadow"
                  onClick={reset}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Open Another Pack
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
