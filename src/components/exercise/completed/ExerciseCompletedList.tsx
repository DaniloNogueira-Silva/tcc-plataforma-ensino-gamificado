"use client";

import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import React  from "react";

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
  userProgress: IUserProgressWithUser[];
  onSelect: (progress: IUserProgressWithUser) => void;
}

export default function ExerciseCompletedList({ isOpen, onToggle, userProgress, onSelect }: ChatListProps) {

  return (
    <div className={`flex-col overflow-auto no-scrollbar transition-all duration-300 ${isOpen
        ? "fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs bg-white dark:bg-gray-900 sm:relative sm:h-auto sm:w-full"
        : "hidden xl:flex"
      }`}
    >
      <div className="flex flex-col max-h-full px-4 overflow-auto sm:px-5">
        <div className="max-h-full space-y-1 overflow-auto custom-scrollbar">
          {userProgress.map((progress) => (
            <div
              key={progress._id}
              className="w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
              onClick={() => onSelect(progress)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">{progress.user?.name}</h5>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">{progress.user?.email}</p>
                  <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">{new Date(progress.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
