"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface"; // Adapte o caminho da interface
import LessonCard from "./LessonCard"; // Adapte o caminho do card de aula

export default function LessonList() {
  const [lessons, setLessons] = useState<ILesson[]>([]);

  const fetchData = async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllLessons(); // Supondo que essa função existe
    setLessons(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {lessons.map((lesson, i) => (
        <LessonCard
          key={i}
          lessonId={lesson._id}
          name={lesson.name}
          content={lesson.content}
          points={lesson.points}
          dueDate={lesson.due_date}
          links={lesson.links}
          type={lesson.type}
          grade={lesson.grade}
          lessonPlanId={lesson.lesson_plan_id}
          onUpdateSuccess={fetchData}
        />
      ))}
    </div>
  );
}
