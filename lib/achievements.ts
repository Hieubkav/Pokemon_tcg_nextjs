export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconType: "cards" | "star" | "crown" | "package" | "gift";
  condition: (stats: AchievementStats) => { current: number; target: number };
}

export interface AchievementStats {
  totalOpened: number;
  uniqueCount: number;
  collectedCards: Record<string, number>;
  setCards: Record<string, string[]>; // setId -> cardIds in that set
  boosterCards: Record<string, Record<string, string[]>>; // setId -> boosterName -> cardIds
  totalCardsInGame: number;
}

// Collection milestones
const collectionMilestones = [100, 500, 1000, 2000, 5000, 10000];

export function generateAchievements(
  sets: { id: string; name: string; cards: { id: string }[]; boosters?: { name: string }[] }[]
): Achievement[] {
  const achievements: Achievement[] = [];

  // Total cards opened achievements
  collectionMilestones.forEach((milestone) => {
    achievements.push({
      id: `total-${milestone}`,
      name: `Thu thập ${milestone} thẻ`,
      description: `Mở được tổng cộng ${milestone} thẻ`,
      iconType: "cards",
      condition: (stats) => ({
        current: stats.totalOpened,
        target: milestone,
      }),
    });
  });

  // Unique cards achievements
  [50, 100, 200, 500, 1000, 2000].forEach((milestone) => {
    achievements.push({
      id: `unique-${milestone}`,
      name: `Sưu tầm ${milestone} loại thẻ`,
      description: `Thu thập ${milestone} loại thẻ khác nhau`,
      iconType: "star",
      condition: (stats) => ({
        current: stats.uniqueCount,
        target: milestone,
      }),
    });
  });

  // Complete all cards achievement
  achievements.push({
    id: "complete-all",
    name: "Hoàn thành bộ sưu tập",
    description: "Thu thập tất cả các thẻ trong game",
    iconType: "crown",
    condition: (stats) => ({
      current: stats.uniqueCount,
      target: stats.totalCardsInGame,
    }),
  });

  // Per-set completion achievements
  sets.forEach((set) => {
    achievements.push({
      id: `set-${set.id}`,
      name: `Hoàn thành ${set.name}`,
      description: `Thu thập tất cả thẻ trong set ${set.name}`,
      iconType: "package",
      condition: (stats) => {
        const setCardIds = stats.setCards[set.id] || [];
        const collected = setCardIds.filter((id) => stats.collectedCards[id] > 0).length;
        return {
          current: collected,
          target: setCardIds.length,
        };
      },
    });

    // Per-booster completion achievements (if set has multiple boosters)
    if (set.boosters && set.boosters.length > 1) {
      set.boosters.forEach((booster) => {
        achievements.push({
          id: `booster-${set.id}-${booster.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: `Hoàn thành ${booster.name}`,
          description: `Thu thập tất cả thẻ trong pack ${booster.name} (${set.name})`,
          iconType: "gift",
          condition: (stats) => {
            const boosterCardIds = stats.boosterCards[set.id]?.[booster.name] || [];
            const target = boosterCardIds.length;
            if (target === 0) {
              return { current: 0, target: 1 }; // Avoid 0/0 completion
            }
            const collected = boosterCardIds.filter((id) => stats.collectedCards[id] > 0).length;
            return { current: collected, target };
          },
        });
      });
    }
  });

  return achievements;
}

export function calculateAchievementStats(
  collectedCards: Record<string, number>,
  totalOpened: number,
  sets: { id: string; cards: { id: string; boosters?: string[] }[]; boosters?: { name: string }[] }[]
): AchievementStats {
  const setCards: Record<string, string[]> = {};
  const boosterCards: Record<string, Record<string, string[]>> = {};
  let totalCardsInGame = 0;

  sets.forEach((set) => {
    setCards[set.id] = set.cards.map((c) => c.id);
    totalCardsInGame += set.cards.length;

    if (set.boosters && set.boosters.length > 1) {
      boosterCards[set.id] = {};
      set.boosters.forEach((booster) => {
        const boosterNameLower = booster.name.toLowerCase();
        boosterCards[set.id][booster.name] = set.cards
          .filter((c) => c.boosters?.some((b) => b.toLowerCase() === boosterNameLower))
          .map((c) => c.id);
      });
    }
  });

  return {
    totalOpened,
    uniqueCount: Object.keys(collectedCards).filter((k) => collectedCards[k] > 0).length,
    collectedCards,
    setCards,
    boosterCards,
    totalCardsInGame,
  };
}
