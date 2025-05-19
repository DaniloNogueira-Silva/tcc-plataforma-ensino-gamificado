"use client";

import { IUserStats } from "@/utils/interfaces/user.interface";
import React from "react";

interface UserInfoCardProps {
  user: IUserStats | null;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {

  if(!user) return null
  const totalActivities = Number(user?.lessons_length + user?.exercises_length)
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-16">
        {/* Coluna 1 - Dados do usuário */}
        <div>
          <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Informações do Usuário
          </h4>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Nome</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.user.name || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.user.email || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Tipo de perfil</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.user.role || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Coluna 2 - Estatísticas */}
        <div>
          <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Estatísticas</h4>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Planos de aulas ativos</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.lesson_plans_length || 0}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Atividades feitas</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {totalActivities || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
