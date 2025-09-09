import React from "react";

interface UserLevelCardProps {
  currentXp: number;
}

export default function UserLevelCard({ currentXp }: UserLevelCardProps) {
  const progression = [
    { level: 1, points: 0 },
    { level: 2, points: 100 },
    { level: 3, points: 250 },
    { level: 4, points: 500 },
    { level: 5, points: 1000 },
    { level: 6, points: 1500 },
    { level: 7, points: 2000 },
  ];

  const safeCurrentXp = currentXp || 0;

  const userLevel =
    progression.findLast((item) => safeCurrentXp >= item.points) ||
    progression[0];
  const nextLevelIndex = progression.findIndex(
    (item) => item.level === userLevel.level + 1
  );
  const nextLevelData =
    nextLevelIndex !== -1 ? progression[nextLevelIndex] : null;

  let progressPercentage = 0;
  let nextLevelXp = 0;

  if (nextLevelData) {
    const xpDifference = nextLevelData.points - userLevel.points;
    const currentProgressXp = safeCurrentXp - userLevel.points;
    if (xpDifference > 0) {
      progressPercentage = (currentProgressXp / xpDifference) * 100;
    }
    nextLevelXp = nextLevelData.points;
  } else {
    progressPercentage = 100;
    nextLevelXp = userLevel.points;
  }

  if (progressPercentage > 100) {
    progressPercentage = 100;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Nível {userLevel.level}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>
            {safeCurrentXp} / {nextLevelXp} XP
          </p>
          <p>{progressPercentage.toFixed(0)}% para o próximo nível</p>
        </div>
        <div className="w-full h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 rounded-full dark:bg-blue-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <p>Nível {userLevel.level}</p>
          <p>Nível {userLevel.level + 1}</p>
        </div>
      </div>
    </div>
  );
}
