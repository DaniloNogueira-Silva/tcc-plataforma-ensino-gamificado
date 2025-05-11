"use client";

import ExerciseCompletedList from "./ExerciseCompletedList";
import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import { useState } from "react";

interface ExerciseSidebarProps {
  userProgress: IUserProgressWithUser[];
  onSelect: (progress: IUserProgressWithUser) => void;
}

export default function ExerciseSidebar({ userProgress, onSelect }: ExerciseSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 transition-all duration-300 bg-gray-900/50 z-999999"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:flex xl:w-1/4">
        <ExerciseCompletedList isOpen={isOpen} onToggle={toggleSidebar} userProgress={userProgress} onSelect={onSelect} />
      </div>
    </>
  );
}
