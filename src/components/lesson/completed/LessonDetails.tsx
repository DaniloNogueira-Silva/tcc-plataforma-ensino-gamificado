"use client";

import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import Input from "@/components/form/input/InputField";
import React from "react";

interface LessonDetailsProps {
  userProgress: IUserProgressWithUser[];
}

export default function LessonDetails({ userProgress }: LessonDetailsProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      {/* Exibindo dados do progresso do usuário */}
      <div className="p-5 space-y-6 xl:space-y-8 xl:p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Progresso do Usuário
        </h3>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Nome
              </label>
              <Input
                type="text"
                defaultValue={"Danilo"}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Email
              </label>
              <Input
                type="email"
                defaultValue={"Danilo@email.com"}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Data de Criação
              </label>
              <Input
                type="text"
                defaultValue={"10-05-2025"}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                Pontos
              </label>
              <Input
                type="number"
                defaultValue={100}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
