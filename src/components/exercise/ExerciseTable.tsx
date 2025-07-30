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
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import { useRouter } from "next/navigation";

export default function ExerciseTable() {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [lessonPlanContents, setLessonPlanContents] = useState<
    { content_id: string; lesson_plan_id: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const httpRequest = new HttpRequest();
      const [foundExercises, foundLessonPlans, foundLessonPlanContents] =
        await Promise.all([
          httpRequest.getAllExercises(),
          httpRequest.getLessonPlansByRole(),
          httpRequest.getAllLessonPlanContent(),
        ]);

      setExercises(foundExercises);
      setLessonPlans(foundLessonPlans);
      setLessonPlanContents(foundLessonPlanContents);
    };

    fetchData();
  }, []);

  function formatDate(dateString?: string): string {
    if (!dateString) return "Sem data de entrega";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  function getLessonPlanNamesByExercise(exerciseId: string): string {
    const associatedPlans = lessonPlanContents.filter(
      (assoc) => assoc.content_id === exerciseId
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

  const typeLabels: Record<string, string> = {
    open: "Aberta",
    multiple_choice: "Múltipla Escolha",
    true_false: "Verdadeiro ou Falso",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
  };

  const handleEdit = (exercise: IExercise) => {
    router.push(`/exercise/form?id=${exercise._id}`);
  };

  const handleDelete = async (exerciseId: string) => {
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.removeExercise(exerciseId);
      setExercises(exercises.filter((ex) => ex._id !== exerciseId));
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
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
                Enunciado
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Exibir Resposta
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Data de Entrega
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Nota
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
                Tipo de Questão
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
            {exercises.map((exercise) => (
              <TableRow key={exercise._id}>
                <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                  {exercise.statement}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {exercise.showAnswer ? "Sim" : "Não"}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(exercise.due_date)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {exercise.grade}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {difficultyLabels[exercise.difficulty] || exercise.difficulty}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {typeLabels[exercise.type] || "Tipo Desconhecido"}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {getLessonPlanNamesByExercise(exercise._id)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEdit(exercise)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(exercise._id)}
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
