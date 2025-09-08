"use client";

import { FaEdit, FaTrashAlt } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Button from "../ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { useRouter } from "next/navigation";

export default function ExerciseListTable() {
  const [exerciseLists, setExerciseLists] = useState<IExerciseList[]>([]);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [lessonPlanContents, setLessonPlanContents] = useState<
    { content_id: string; lesson_plan_id: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const httpRequest = new HttpRequest();
      const [foundExerciseLists, foundLessonPlans, foundLessonPlanContents] =
        await Promise.all([
          httpRequest.getAllExerciseLists(),
          httpRequest.getLessonPlansByRole(),
          httpRequest.getAllLessonPlanContent(),
        ]);
      setExerciseLists(foundExerciseLists);
      setLessonPlans(foundLessonPlans);
      setLessonPlanContents(foundLessonPlanContents);
    };

    fetchData();
  }, []);

  function getLessonPlanNamesByExerciseList(exerciseListId: string): string {
    const associatedPlans = lessonPlanContents.filter(
      (assoc) => assoc.content_id === exerciseListId
    );

    if (associatedPlans.length === 0) return "Sem plano atribuído";

    const names = associatedPlans
      .map((assoc) => {
        const plan = lessonPlans.find(
          (p) => p.lessonplan._id === assoc.lesson_plan_id
        );
        return plan?.lessonplan.name;
      })
      .filter(Boolean);

    return names.join(", ");
  }

  const difficultyLabels: Record<string, string> = {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
  };

  const handleDelete = async (listId: string) => {
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.removeExerciseList(listId);
      setExerciseLists(exerciseLists.filter((list) => list._id !== listId));
    } catch (error) {
      console.error("Erro ao deletar lista de exercícios:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Nome da Lista
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Exercícios
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Dificuldade
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Plano de Aula
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Ações
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {exerciseLists.map((list) => (
              <TableRow key={list._id}>
                <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90 line-clamp-3 break-words max-w-xl">
                  {list.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {list.exercises_ids.length}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                   {list.difficulty ? difficultyLabels[list.difficulty] : "N/A"}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {getLessonPlanNamesByExerciseList(list._id)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={() =>
                      router.push(`/exercise_list/form?id=${list._id}`)
                    }
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(list._id)}
                  >
                    <FaTrashAlt />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
