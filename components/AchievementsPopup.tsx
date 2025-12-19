"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/lib/collection";
import { Achievement, generateAchievements, calculateAchievementStats } from "@/lib/achievements";
import { Layers, Star, Crown, Package, Gift, Trophy, X, Sparkles, FolderOpen, CheckCircle } from "lucide-react";

interface AchievementsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  sets: { id: string; name: string; cards: { id: string; boosters?: string[] }[]; boosters?: { name: string }[] }[];
}

const IconMap = {
  cards: Layers,
  star: Star,
  crown: Crown,
  package: Package,
  gift: Gift,
};

export function AchievementsPopup({ isOpen, onClose, sets }: AchievementsPopupProps) {
  const { collection } = useCollection();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");

  useEffect(() => {
    setAchievements(generateAchievements(sets));
  }, [sets]);

  if (!isOpen) return null;

  const stats = calculateAchievementStats(collection.cards, collection.totalOpened, sets);

  const achievementsWithProgress = achievements.map((achievement) => {
    const { current, target } = achievement.condition(stats);
    const progress = Math.min((current / target) * 100, 100);
    const isCompleted = current >= target;
    return { ...achievement, current, target, progress, isCompleted };
  });

  const filteredAchievements = achievementsWithProgress.filter((a) => {
    if (filter === "completed") return a.isCompleted;
    if (filter === "in-progress") return !a.isCompleted;
    return true;
  });

  const completedCount = achievementsWithProgress.filter((a) => a.isCompleted).length;
  const totalProgress = (completedCount / achievements.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-xl w-full max-h-[85vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gray-400" />
              Achievements
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">Tiến độ</span>
              <span className="text-gray-400">{completedCount}/{achievements.length}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-gray-800/50 rounded-md py-2">
              <div className="text-xl font-semibold text-white">{stats.uniqueCount}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Loại</div>
            </div>
            <div className="bg-gray-800/50 rounded-md py-2">
              <div className="text-xl font-semibold text-white">{stats.totalOpened}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Đã mở</div>
            </div>
            <div className="bg-gray-800/50 rounded-md py-2">
              <div className="text-xl font-semibold text-white">{completedCount}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Xong</div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-1 mt-4">
            {(["all", "completed", "in-progress"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  filter === f
                    ? "bg-white text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {f === "all" ? "Tất cả" : f === "completed" ? "Xong" : "Chưa xong"}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement List */}
        <div className="overflow-y-auto max-h-[55vh] p-4">
          <div className="space-y-2">
            {filteredAchievements.map((achievement) => {
              const Icon = IconMap[achievement.iconType];
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-md border transition-colors ${
                    achievement.isCompleted
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-transparent border-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${achievement.isCompleted ? "text-white" : "text-gray-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-medium ${achievement.isCompleted ? "text-white" : "text-gray-300"}`}>
                          {achievement.name}
                        </h3>
                        {achievement.isCompleted && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{achievement.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              achievement.isCompleted ? "bg-white" : "bg-gray-600"
                            }`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 tabular-nums">
                          {achievement.current}/{achievement.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
