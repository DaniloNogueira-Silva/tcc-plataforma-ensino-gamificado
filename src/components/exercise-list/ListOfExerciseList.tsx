"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import ExerciseListCard from "./ExerciseListCard";

interface ListOfExerciseListProps {
  lessonPlanId: string;
}

export default function ListOfExerciseList({
  lessonPlanId,
}: ListOfExerciseListProps) {
  const [lists, setLists] = useState<IExerciseList[]>([]);

  const fetchData = async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllExerciseListByLessonPlanId(
      lessonPlanId
    );
    setLists(result);
  };

  useEffect(() => {
    if (lessonPlanId) {
      fetchData();
    }
  }, [lessonPlanId]);

  return (
    <div className="space-y-4 px-4">
      {lists.map((list) => (
        <ExerciseListCard
          key={list._id}
          list={list}
          lessonPlanId={lessonPlanId}
        />
      ))}
    </div>
  );
}
