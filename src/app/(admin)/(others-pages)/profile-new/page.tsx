"use client";
import React, { useEffect, useState } from "react";

import { HttpRequest } from "@/utils/http-request";
import { IUserStats } from "@/utils/interfaces/user.interface";
import UserAvatarCard from "@/components/user-profile/UserAvatarCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserTrophiesCard from "@/components/user-profile/UserTrophiesCard";
import UserLevelCard from "@/components/user-profile/UserLevelCard";

export default function Profile() {
  const [user, setUser] = useState<IUserStats | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const httpRequest = new HttpRequest();
      const userStats = await httpRequest.getUserStats();
      setUser(userStats);
    }
    fetchUser();
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil do usuário
        </h3>
       
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="w-full lg:w-72 flex-shrink-0">
            <UserAvatarCard />
          </div>

          <div className="flex-1 w-full space-y-6">
            {user && <UserLevelCard currentXp={user.points} />}

            <UserInfoCard user={user} />
          </div>
        </div>

        <div className="mt-2 lg:mt-5">
          {user && <UserTrophiesCard user={user} />}
        </div>
      </div>
    </div>
  );
}
