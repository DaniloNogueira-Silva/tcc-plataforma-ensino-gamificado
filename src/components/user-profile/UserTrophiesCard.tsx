"use client";

import { IUserStats } from "@/utils/interfaces/user.interface";
import Image from "next/image";
import React from "react";

interface UserTrophiesCardProps {
  user: IUserStats | null;
}

// Mapeamento de nomes para imagens
const trophyImageMap: Record<string, string> = {
  "Alcance o nível 2": "/images/trophies/trophie_1.png",
  "Faça 10 lições!": "/images/trophies/trophie_2.png",
  // Adicione outros troféus aqui conforme forem criados
};

export default function UserTrophiesCard({ user }: UserTrophiesCardProps) {
  if (!user) return null;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Troféus
      </h3>

      <div className="flex flex-wrap gap-6">
        {user?.trophies?.map((trophy, index) => {
          const imageSrc = trophyImageMap[trophy.name] || "/images/trophies/default.png";

          return (
            <div key={index} className="flex flex-col items-center w-32">
              <div className="w-32 h-32">
                <Image
                  width={128}
                  height={128}
                  src={imageSrc}
                  alt={`Troféu: ${trophy.name}`}
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {trophy.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
