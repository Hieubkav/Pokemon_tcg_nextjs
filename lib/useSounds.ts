"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export function useSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) return null;
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
    if (isMuted) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [ensureContext, isMuted]);

  const playNoise = useCallback((duration: number, volume = 0.2) => {
    if (isMuted) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 1000;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
  }, [ensureContext, isMuted]);

  const playPackOpen = useCallback(() => {
    // Whoosh + sparkle effect
    playNoise(0.3, 0.15);
    setTimeout(() => playTone(800, 0.1, "sine", 0.2), 100);
    setTimeout(() => playTone(1200, 0.1, "sine", 0.15), 150);
    setTimeout(() => playTone(1600, 0.15, "sine", 0.1), 200);
    // Magical chime
    setTimeout(() => {
      playTone(523, 0.3, "sine", 0.2);  // C5
      setTimeout(() => playTone(659, 0.3, "sine", 0.18), 50);  // E5
      setTimeout(() => playTone(784, 0.4, "sine", 0.15), 100); // G5
      setTimeout(() => playTone(1047, 0.5, "sine", 0.12), 150); // C6
    }, 250);
  }, [playTone, playNoise]);

  const playCardFlip = useCallback(() => {
    // Quick swoosh
    playNoise(0.08, 0.1);
    playTone(300, 0.05, "triangle", 0.15);
    setTimeout(() => playTone(500, 0.08, "triangle", 0.1), 30);
  }, [playTone, playNoise]);

  const playCardReveal = useCallback((isRare = false) => {
    if (isRare) {
      // Sparkly reveal for rare cards
      playTone(523, 0.2, "sine", 0.25);
      setTimeout(() => playTone(659, 0.2, "sine", 0.22), 80);
      setTimeout(() => playTone(784, 0.25, "sine", 0.2), 160);
      setTimeout(() => playTone(1047, 0.3, "sine", 0.18), 240);
      setTimeout(() => playTone(1319, 0.4, "sine", 0.15), 320);
    } else {
      // Simple reveal
      playTone(400, 0.1, "triangle", 0.15);
      setTimeout(() => playTone(600, 0.15, "triangle", 0.1), 50);
    }
  }, [playTone]);

  const playSparkle = useCallback(() => {
    const notes = [1047, 1319, 1568, 2093];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, "sine", 0.08), i * 40);
    });
  }, [playTone]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playPackOpen,
    playCardFlip,
    playCardReveal,
    playSparkle,
    isMuted,
    toggleMute,
  };
}
