"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import LessonCard from "./LessonCard";

interface LessonListProps {
  lessonPlanId: string;
}

export default function LessonList({ lessonPlanId }: LessonListProps) {
  const [lessons, setLessons] = useState<ILesson[]>([]);

  const fetchData = async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllLessonsByLessonPlanId(lessonPlanId);
    setLessons(result);
  };

  useEffect(() => {
    if (lessonPlanId) {
      fetchData();
    }
  }, [lessonPlanId]);

  return (
    <div className="space-y-4 px-4">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson._id}
          lessonId={lesson._id}
          name={lesson.name}
          content={lesson.content}
          type={lesson.type}
          lessonPlanId={lessonPlanId}
        />
      ))}
    </div>
  );
}
