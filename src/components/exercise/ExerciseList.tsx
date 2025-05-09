"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import ExerciseCard from "./ExerciseCard";

export default function ExerciseList() {
  const [exercises, setExercises] = useState<IExercise[]>([]);

  const fetchData = async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllExercises();
    setExercises(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {exercises.map((exercise, i) => (
        <ExerciseCard
          key={i}
          exerciseId={exercise._id}
          statement={exercise.statement}
          answer={exercise.answer}
          showAnswer={exercise.showAnswer}
          type={exercise.type as any}
          options={exercise.options}
          onUpdateSuccess={fetchData}
        />
      ))}
    </div>
  );
}
