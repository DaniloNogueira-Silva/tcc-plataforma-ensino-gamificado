"use client";

import { useCallback, useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import ExerciseCard from "./ExerciseCard";

interface ExerciseListProps {
  lessonPlanId: string;
}

export default function ExerciseList({ lessonPlanId }: ExerciseListProps) {
  const [exercises, setExercises] = useState<IExercise[]>([]);

  const fetchData = useCallback(async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllExerciseByLessonPlanId(lessonPlanId);
    const sorted = result.sort((a: IExercise, b: IExercise) => b._id.localeCompare(a._id));
    setExercises(sorted);
  }, [lessonPlanId]);

  useEffect(() => {
    if (lessonPlanId) {
      fetchData();
    }
  }, [lessonPlanId, fetchData]);

  return (
    <div className="space-y-4 px-4">
      {exercises.map((exercise, i) => (
        <ExerciseCard
          key={i}
          exerciseId={exercise._id}
          statement={exercise.statement}
          lessonPlanId={lessonPlanId}
          type={exercise.type}
        />
      ))}
    </div>
  );
}
