"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CollectionState {
  cards: Record<string, number>; // cardId -> count
  totalOpened: number;
}

interface CollectionContextType {
  collection: CollectionState;
  addCard: (cardId: string) => void;
  addCards: (cardIds: string[]) => void;
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
  getUniqueCount: () => number;
  getTotalOpened: () => number;
  reset: () => void;
}

const STORAGE_KEY = "pokemon-tcg-pocket-collection";

const defaultCollection: CollectionState = {
  cards: {},
  totalOpened: 0,
};

const CollectionContext = createContext<CollectionContextType | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collection, setCollection] = useState<CollectionState>(defaultCollection);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCollection(JSON.parse(stored));
      } catch {
        setCollection(defaultCollection);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    }
  }, [collection, isLoaded]);

  const addCard = (cardId: string) => {
    setCollection((prev) => ({
      cards: {
        ...prev.cards,
        [cardId]: (prev.cards[cardId] || 0) + 1,
      },
      totalOpened: prev.totalOpened + 1,
    }));
  };

  const addCards = (cardIds: string[]) => {
    setCollection((prev) => {
      const newCards = { ...prev.cards };
      cardIds.forEach((id) => {
        newCards[id] = (newCards[id] || 0) + 1;
      });
      return {
        cards: newCards,
        totalOpened: prev.totalOpened + cardIds.length,
      };
    });
  };

  const hasCard = (cardId: string) => {
    return (collection.cards[cardId] || 0) > 0;
  };

  const getCardCount = (cardId: string) => {
    return collection.cards[cardId] || 0;
  };

  const getUniqueCount = () => {
    return Object.values(collection.cards).filter(count => count > 0).length;
  };

  const getTotalOpened = () => {
    return collection.totalOpened;
  };

  const reset = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ tiến trình? Hành động này không thể hoàn tác!")) {
      setCollection(defaultCollection);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <CollectionContext.Provider
      value={{
        collection,
        addCard,
        addCards,
        hasCard,
        getCardCount,
        getUniqueCount,
        getTotalOpened,
        reset,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("useCollection must be used within CollectionProvider");
  }
  return context;
}
