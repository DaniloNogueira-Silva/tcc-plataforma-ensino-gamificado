"use client";

import { HttpRequest } from "@/utils/http-request";
import { IRanking } from "@/utils/interfaces/ranking.interface";
import { useCallback, useEffect, useState } from "react";

const MedalIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${color}`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.963 2.286a.75.75 0 00-1.927 0l-7.5 4.25A.75.75 0 003 7.354v9.292a.75.75 0 00.537.714l7.5 4.25a.75.75 0 00.927 0l7.5-4.25a.75.75 0 00.537-.714V7.354a.75.75 0 00-.537-.714l-7.5-4.25zM12 6a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6zM11.25 16a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z"
      clipRule="evenodd"
    />
  </svg>
);

interface RankingListProps {
  lessonPlanId: string;
}

export default function RankingList({ lessonPlanId }: RankingListProps) {
  const [ranking, setRanking] = useState<IRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const httpRequest = new HttpRequest();
      const result = (await httpRequest.getRanking(lessonPlanId)).sort(
        (a, b) => b.totalPoints - a.totalPoints
      );
      setRanking(result);
    } catch (error) {
      console.error("Falha ao buscar o ranking:", error);
    } finally {
      setLoading(false);
    }
  }, [lessonPlanId]);

  useEffect(() => {
    if (lessonPlanId) {
      fetchData();
    }
  }, [lessonPlanId, fetchData]);

  const getRankDetails = (index: number) => {
    switch (index) {
      case 0:
        return {
          position: "1°",
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/10",
          icon: <MedalIcon color="text-yellow-400" />,
        };
      case 1:
        return {
          position: "2°",
          color: "text-gray-400",
          bgColor: "bg-gray-400/10",
          icon: <MedalIcon color="text-gray-400" />,
        };
      case 2:
        return {
          position: "3°",
          color: "text-orange-400",
          bgColor: "bg-orange-400/10",
          icon: <MedalIcon color="text-orange-400" />,
        };
      default:
        return {
          position: `${index + 1}°`,
          color: "text-gray-500 dark:text-gray-300",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          icon: null,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <p className="text-gray-500 dark:text-gray-400">
          Carregando ranking...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Quadro de Líderes 🏆
        </h3>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Ainda não há pontuações para exibir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((student, index) => {
            const { position, color, bgColor, icon } = getRankDetails(index);
            return (
              <div
                key={student.userId || index}
                className={`flex items-center justify-between rounded-xl p-4 transition-transform duration-200 hover:scale-105 ${bgColor}`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg ${color}`}
                  >
                    {icon || <span>{position}</span>}
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-base ${
                        index < 3 ? color : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Posição: {position}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-extrabold tracking-tight ${color}`}>
                  {student.totalPoints} pts
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
