"use client";

import React, { useEffect, useState } from "react";

import { HttpRequest } from "@/utils/http-request";
import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import { MoreDotIcon } from "@/icons";

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
  userProgress: IUserProgressWithUser[];
}

export default function LessonCompletedList({ isOpen, onToggle, userProgress }: ChatListProps) {
  const [isOpenTwo, setIsOpenTwo] = useState(false);

  function toggleDropdownTwo() {
    setIsOpenTwo(!isOpenTwo);
  }

  return (
    <div
      className={`flex-col overflow-auto no-scrollbar transition-all duration-300 ${isOpen
        ? "fixed top-0 left-0 z-999999 h-screen bg-white dark:bg-gray-900"
        : "hidden xl:flex"
        }`}
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 xl:hidden">
        <div>
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Entregas
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <div>
            <button className="dropdown-toggle" onClick={toggleDropdownTwo}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
          </div>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-300 rounded-full dark:border-gray-700 dark:text-gray-400 dark:hover:text-white/90"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col max-h-full px-4 overflow-auto sm:px-5">
        <div className="max-h-full space-y-1 overflow-auto custom-scrollbar">
          {/* Mapeando os dados de `userProgress` */}
          {userProgress.map((progress) => (
            <div key={progress._id} className="w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {progress.user?.name} {/* Exibe o nome do usuário */}
                  </h5>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
                    {progress.user?.email} {/* Exibe o email do usuário */}
                  </p>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
                    {new Date(progress.createdAt).toLocaleDateString("pt-BR")} {/* Exibe a data de criação */}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
