"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchData = useCallback(async () => {
    const httpRequest = new HttpRequest();
    const result = await httpRequest.getAllExerciseListByLessonPlanId(
      lessonPlanId
    );
    const sorted = result.sort((a: IExerciseList, b: IExerciseList) =>
      b._id.localeCompare(a._id)
    );
    setLists(sorted);
  }, [lessonPlanId]);

  useEffect(() => {
    if (lessonPlanId) {
      fetchData();
    }
  }, [lessonPlanId, fetchData]);

  return (
    <div className="space-y-4 px-4 mb-4">
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
