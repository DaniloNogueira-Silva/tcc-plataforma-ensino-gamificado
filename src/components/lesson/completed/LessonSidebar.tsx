"use client";

import { ILesson } from "@/utils/interfaces/lesson.interface"; // Importe o tipo ILesson
import { IUserProgressWithUser } from "@/utils/interfaces/user-progress.interface";
import LessonCompletedList from "./LessonCompletedList";
import { useState } from "react";

// Defina as props corretamente para o componente
interface LessonSidebarProps {
  userProgress: IUserProgressWithUser[]
}

export default function LessonSidebar({ userProgress }: LessonSidebarProps) {  // Desestruture a prop 'lesson' de 'props'
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 transition-all duration-300 bg-gray-900/50 z-999999"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:flex xl:w-1/4">
        <LessonCompletedList isOpen={isOpen} onToggle={toggleSidebar} userProgress={userProgress} />
      </div>
    </>
  );
}
