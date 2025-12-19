"use client";

import { useRef, useState, useCallback, useEffect, type MouseEvent, type TouchEvent } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import type { Card } from "@/lib/data";
import "./card.css";

interface PokemonCardProps {
  card: Card;
  imageSrc: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  showBack?: boolean;
}

const springConfig = { stiffness: 150, damping: 20 };

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function PokemonCard({
  card,
  imageSrc,
  isFlipped = true,
  onFlip,
  showBack = false,
}: PokemonCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const springPointerX = useSpring(pointerX, springConfig);
  const springPointerY = useSpring(pointerY, springConfig);
  
  const backgroundX = useMotionValue(50);
  const backgroundY = useMotionValue(50);
  const springBgX = useSpring(backgroundX, springConfig);
  const springBgY = useSpring(backgroundY, springConfig);

  const pointerFromCenter = useTransform(
    [springPointerX, springPointerY],
    ([x, y]: number[]) => {
      const dx = (x as number) - 50;
      const dy = (y as number) - 50;
      return clamp(Math.sqrt(dx * dx + dy * dy) / 50, 0, 1);
    }
  );

  const handleInteract = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = clamp((x / rect.width) * 100);
    const percentY = clamp((y / rect.height) * 100);

    const rotX = -((percentY - 50) / 50) * 20;
    const rotY = ((percentX - 50) / 50) * 20;

    rotateX.set(rotX);
    rotateY.set(rotY);
    pointerX.set(percentX);
    pointerY.set(percentY);
    
    const bgX = 37 + (percentX / 100) * 26;
    const bgY = 33 + (percentY / 100) * 34;
    backgroundX.set(bgX);
    backgroundY.set(bgY);

    setIsInteracting(true);
  }, [rotateX, rotateY, pointerX, pointerY, backgroundX, backgroundY]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (interactTimeoutRef.current) {
      clearTimeout(interactTimeoutRef.current);
    }
    handleInteract(e.clientX, e.clientY);
  }, [handleInteract]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (interactTimeoutRef.current) {
      clearTimeout(interactTimeoutRef.current);
    }
    const touch = e.touches[0];
    handleInteract(touch.clientX, touch.clientY);
  }, [handleInteract]);

  const handleInteractEnd = useCallback(() => {
    interactTimeoutRef.current = setTimeout(() => {
      springRotateX.set(0);
      springRotateY.set(0);
      springPointerX.set(50);
      springPointerY.set(50);
      springBgX.set(50);
      springBgY.set(50);
      
      rotateX.set(0);
      rotateY.set(0);
      pointerX.set(50);
      pointerY.set(50);
      backgroundX.set(50);
      backgroundY.set(50);
      
      setIsInteracting(false);
    }, 300);
  }, [springRotateX, springRotateY, springPointerX, springPointerY, springBgX, springBgY, rotateX, rotateY, pointerX, pointerY, backgroundX, backgroundY]);

  useEffect(() => {
    return () => {
      if (interactTimeoutRef.current) {
        clearTimeout(interactTimeoutRef.current);
      }
    };
  }, []);

  const rarityClass = card.rarity || "common";

  if (showBack) {
    return (
      <div className="w-full h-full [perspective:1200px]">
        <div 
          className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ease-out ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          onClick={onFlip}
          style={{ cursor: onFlip ? "pointer" : "default" }}
        >
          {/* Card Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <motion.div
              ref={cardRef}
              className={`pokemon-card w-full h-full ${rarityClass} ${isInteracting ? "interacting" : ""}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleInteractEnd}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleInteractEnd}
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                "--pointer-x": springPointerX,
                "--pointer-y": springPointerY,
                "--background-x": springBgX,
                "--background-y": springBgY,
              } as React.CSSProperties}
            >
              <div className="card-inner">
                <img
                  src={imageSrc}
                  alt={card.name}
                  className="card-image"
                  draggable={false}
                />
                <div className="card-shine" />
                <div className="card-glare" />
                <div className="card-holo" />
                <div className="card-sparkle" />
              </div>
            </motion.div>
          </div>
          {/* Card Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden shadow-xl">
            <img 
              src="/images/card-back.webp" 
              alt="Card Back" 
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={`pokemon-card w-full h-full ${rarityClass} ${isInteracting ? "interacting" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleInteractEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleInteractEnd}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        "--pointer-x": springPointerX,
        "--pointer-y": springPointerY,
        "--background-x": springBgX,
        "--background-y": springBgY,
      } as React.CSSProperties}
    >
      <div className="card-inner">
        <img
          src={imageSrc}
          alt={card.name}
          className="card-image"
          draggable={false}
        />
        <div className="card-shine" />
        <div className="card-glare" />
        <div className="card-holo" />
        <div className="card-sparkle" />
      </div>
    </motion.div>
  );
}
