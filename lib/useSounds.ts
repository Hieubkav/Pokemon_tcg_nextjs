"use client";

import { useCallback, useRef, useEffect, useState } from "react";

export type RarityLevel = "common" | "uncommon" | "rare" | "super-rare" | "ultra-rare" | "crown" | "immersive";

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

  const playPackTear = useCallback(() => {
    if (isMuted) return;
    const ctx = ensureContext();
    if (!ctx) return;

    // Layer 1: Main tear sound - longer, louder
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Crinkle texture with more variation
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(t * Math.PI) * (1 - t * 0.3);
      data[i] = noise * envelope * (1 + Math.sin(t * 50) * 0.3);
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2500, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4);
    filter.Q.value = 0.8;

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();

    // Layer 2: Crisp high freq crackle
    setTimeout(() => {
      const crackleSize = ctx.sampleRate * 0.15;
      const crackleBuffer = ctx.createBuffer(1, crackleSize, ctx.sampleRate);
      const crackleData = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleSize; i++) {
        crackleData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackleSize * 0.3));
      }
      const crackleSource = ctx.createBufferSource();
      const crackleGain = ctx.createGain();
      const highPass = ctx.createBiquadFilter();
      
      crackleSource.buffer = crackleBuffer;
      highPass.type = "highpass";
      highPass.frequency.value = 3000;
      crackleGain.gain.setValueAtTime(0.35, ctx.currentTime);
      
      crackleSource.connect(highPass);
      highPass.connect(crackleGain);
      crackleGain.connect(ctx.destination);
      crackleSource.start();
    }, 50);

    // Layer 3: Satisfying pop/snap at end
    setTimeout(() => {
      playTone(350, 0.1, "triangle", 0.25);
      playTone(500, 0.08, "sine", 0.15);
    }, 180);
  }, [ensureContext, isMuted, playTone]);

  const playPackOpen = useCallback(() => {
    playPackTear();
    setTimeout(() => {
      playTone(523, 0.3, "sine", 0.2);
      setTimeout(() => playTone(659, 0.3, "sine", 0.18), 50);
      setTimeout(() => playTone(784, 0.4, "sine", 0.15), 100);
      setTimeout(() => playTone(1047, 0.5, "sine", 0.12), 150);
    }, 300);
  }, [playTone, playPackTear]);

  const playCardFlip = useCallback(() => {
    playNoise(0.08, 0.1);
    playTone(300, 0.05, "triangle", 0.15);
    setTimeout(() => playTone(500, 0.08, "triangle", 0.1), 30);
  }, [playTone, playNoise]);

  // Different reveal sounds based on rarity
  const playRarityReveal = useCallback((rarity: RarityLevel) => {
    switch (rarity) {
      case "common":
        playTone(400, 0.1, "triangle", 0.12);
        setTimeout(() => playTone(500, 0.12, "triangle", 0.08), 40);
        break;

      case "uncommon":
        playTone(440, 0.12, "sine", 0.15);
        setTimeout(() => playTone(554, 0.12, "sine", 0.12), 50);
        setTimeout(() => playTone(659, 0.15, "sine", 0.1), 100);
        break;

      case "rare":
        // Ding sound - ascending notes
        playTone(523, 0.15, "sine", 0.22);
        setTimeout(() => playTone(659, 0.15, "sine", 0.2), 70);
        setTimeout(() => playTone(784, 0.2, "sine", 0.18), 140);
        setTimeout(() => playTone(1047, 0.25, "sine", 0.15), 210);
        break;

      case "super-rare":
        // Rainbow sparkle effect
        playTone(523, 0.2, "sine", 0.25);
        setTimeout(() => playTone(659, 0.18, "sine", 0.23), 60);
        setTimeout(() => playTone(784, 0.18, "sine", 0.22), 120);
        setTimeout(() => playTone(880, 0.18, "sine", 0.2), 180);
        setTimeout(() => playTone(1047, 0.25, "sine", 0.2), 240);
        setTimeout(() => playTone(1319, 0.3, "sine", 0.18), 300);
        // Echo sparkles
        setTimeout(() => playTone(1568, 0.15, "sine", 0.1), 400);
        setTimeout(() => playTone(2093, 0.15, "sine", 0.08), 480);
        break;

      case "ultra-rare":
        // Magical fanfare
        playNoise(0.15, 0.1);
        setTimeout(() => {
          playTone(392, 0.2, "sine", 0.28);
          playTone(523, 0.2, "sine", 0.25);
        }, 50);
        setTimeout(() => {
          playTone(523, 0.2, "sine", 0.26);
          playTone(659, 0.2, "sine", 0.24);
        }, 150);
        setTimeout(() => {
          playTone(659, 0.25, "sine", 0.25);
          playTone(784, 0.25, "sine", 0.23);
        }, 250);
        setTimeout(() => {
          playTone(784, 0.25, "sine", 0.24);
          playTone(1047, 0.3, "sine", 0.22);
        }, 350);
        setTimeout(() => playTone(1319, 0.4, "sine", 0.18), 500);
        setTimeout(() => playTone(1568, 0.35, "sine", 0.12), 600);
        setTimeout(() => playTone(2093, 0.4, "sine", 0.1), 700);
        break;

      case "crown":
      case "immersive":
        // Epic legendary reveal
        playNoise(0.2, 0.12);
        // Deep bass rumble
        setTimeout(() => playTone(110, 0.5, "sine", 0.3), 0);
        setTimeout(() => playTone(165, 0.4, "sine", 0.25), 100);
        // Rising chord
        setTimeout(() => {
          playTone(262, 0.3, "sine", 0.28);
          playTone(330, 0.3, "sine", 0.26);
          playTone(392, 0.3, "sine", 0.24);
        }, 200);
        setTimeout(() => {
          playTone(392, 0.3, "sine", 0.28);
          playTone(494, 0.3, "sine", 0.26);
          playTone(587, 0.3, "sine", 0.24);
        }, 350);
        setTimeout(() => {
          playTone(523, 0.35, "sine", 0.3);
          playTone(659, 0.35, "sine", 0.28);
          playTone(784, 0.35, "sine", 0.26);
        }, 500);
        // High sparkle cascade
        setTimeout(() => playTone(1047, 0.3, "sine", 0.2), 700);
        setTimeout(() => playTone(1319, 0.25, "sine", 0.18), 780);
        setTimeout(() => playTone(1568, 0.25, "sine", 0.16), 860);
        setTimeout(() => playTone(2093, 0.3, "sine", 0.14), 940);
        setTimeout(() => playTone(2637, 0.4, "sine", 0.1), 1020);
        break;
    }
  }, [playTone, playNoise]);

  const playCardReveal = useCallback((isRare = false) => {
    if (isRare) {
      playRarityReveal("rare");
    } else {
      playRarityReveal("common");
    }
  }, [playRarityReveal]);

  const playSparkle = useCallback(() => {
    const notes = [1047, 1319, 1568, 2093];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, "sine", 0.08), i * 40);
    });
  }, [playTone]);

  // Multi-pack special sounds
  const playMultiPackStart = useCallback(() => {
    // Exciting buildup
    playNoise(0.2, 0.15);
    const baseNotes = [262, 330, 392, 523];
    baseNotes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.2 + i * 0.02), i * 80);
    });
    setTimeout(() => {
      playTone(784, 0.4, "sine", 0.25);
      playTone(1047, 0.4, "sine", 0.22);
    }, 400);
  }, [playTone, playNoise]);

  const playPackTransition = useCallback(() => {
    // Quick whoosh between packs
    playNoise(0.1, 0.1);
    playTone(600, 0.1, "triangle", 0.15);
    setTimeout(() => playTone(800, 0.1, "triangle", 0.1), 50);
  }, [playTone, playNoise]);

  const playMultiPackComplete = useCallback(() => {
    // Triumphant finish
    playTone(523, 0.2, "sine", 0.25);
    playTone(659, 0.2, "sine", 0.23);
    playTone(784, 0.2, "sine", 0.21);
    setTimeout(() => {
      playTone(784, 0.25, "sine", 0.26);
      playTone(988, 0.25, "sine", 0.24);
      playTone(1175, 0.25, "sine", 0.22);
    }, 200);
    setTimeout(() => {
      playTone(1047, 0.4, "sine", 0.28);
      playTone(1319, 0.4, "sine", 0.26);
      playTone(1568, 0.4, "sine", 0.24);
    }, 400);
    // Final sparkle
    setTimeout(() => playTone(2093, 0.5, "sine", 0.15), 650);
  }, [playTone]);

  // Wonder Pick sounds
  const playWonderPickIntro = useCallback(() => {
    // Mystical intro sound
    playTone(330, 0.3, "sine", 0.2);
    setTimeout(() => playTone(392, 0.3, "sine", 0.18), 100);
    setTimeout(() => playTone(440, 0.35, "sine", 0.2), 200);
    setTimeout(() => {
      playTone(523, 0.4, "sine", 0.22);
      playTone(659, 0.4, "sine", 0.18);
    }, 350);
  }, [playTone]);

  const playWonderPickShuffle = useCallback(() => {
    // Card shuffle whoosh
    playNoise(0.15, 0.12);
    playTone(200, 0.1, "triangle", 0.15);
    setTimeout(() => playTone(350, 0.1, "triangle", 0.12), 50);
  }, [playTone, playNoise]);

  const playWonderPickSuspense = useCallback(() => {
    // Suspenseful heartbeat-like sound
    const beatInterval = 400;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        playTone(80 + i * 10, 0.15, "sine", 0.25 - i * 0.03);
        setTimeout(() => playTone(60 + i * 10, 0.1, "sine", 0.15), 100);
      }, i * beatInterval);
    }
    // Rising tension
    setTimeout(() => {
      playTone(200, 0.2, "sine", 0.15);
      playTone(250, 0.2, "sine", 0.12);
    }, 1600);
    setTimeout(() => {
      playTone(280, 0.2, "sine", 0.18);
      playTone(350, 0.2, "sine", 0.15);
    }, 1900);
  }, [playTone]);

  const playWonderPickRevealOther = useCallback(() => {
    // Quick reveal for non-selected cards
    playNoise(0.05, 0.08);
    playTone(300, 0.08, "triangle", 0.12);
  }, [playTone, playNoise]);

  const playWonderPickWin = useCallback(() => {
    // Exciting win sound for NEW card
    playNoise(0.1, 0.1);
    playTone(523, 0.15, "sine", 0.25);
    setTimeout(() => playTone(659, 0.15, "sine", 0.24), 80);
    setTimeout(() => playTone(784, 0.15, "sine", 0.23), 160);
    setTimeout(() => {
      playTone(1047, 0.3, "sine", 0.28);
      playTone(784, 0.3, "sine", 0.22);
    }, 240);
    setTimeout(() => playTone(1319, 0.4, "sine", 0.2), 400);
    setTimeout(() => playTone(1568, 0.35, "sine", 0.15), 500);
  }, [playTone, playNoise]);

  const playWonderPickMiss = useCallback(() => {
    // Disappointed sound for owned card
    playTone(400, 0.15, "sine", 0.2);
    setTimeout(() => playTone(350, 0.15, "sine", 0.18), 100);
    setTimeout(() => playTone(300, 0.2, "sine", 0.15), 200);
    setTimeout(() => playTone(250, 0.25, "triangle", 0.12), 300);
  }, [playTone]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playPackOpen,
    playCardFlip,
    playCardReveal,
    playRarityReveal,
    playSparkle,
    playMultiPackStart,
    playPackTransition,
    playMultiPackComplete,
    playWonderPickIntro,
    playWonderPickShuffle,
    playWonderPickSuspense,
    playWonderPickRevealOther,
    playWonderPickWin,
    playWonderPickMiss,
    isMuted,
    toggleMute,
  };
}
