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
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { useRouter } from "next/navigation";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

export default function LessonTable() {
  const [lessons, setLessons] = useState<ILesson[]>([]);
  const [lessonPlans, setLessonPlans] = useState<ILessonPlanByRole[]>([]);
  const [lessonPlanContents, setLessonPlanContents] = useState<
    { content_id: string; lesson_plan_id: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLessonsAndPlans = async () => {
      const httpRequest = new HttpRequest();
      const [foundLessons, foundLessonPlans, foundLessonPlanContents] =
        await Promise.all([
          httpRequest.getAllLessons(),
          httpRequest.getLessonPlansByRole(),
          httpRequest.getAllLessonPlanContent(),
        ]);
      setLessons(foundLessons);
      setLessonPlans(foundLessonPlans);
      setLessonPlanContents(foundLessonPlanContents);
    };

    fetchLessonsAndPlans();
  }, []);

  function formatDate(dateString?: string | null): string {
    if (!dateString) return "Sem data de entrega";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Sem data de entrega";
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
    lesson: "Aula",
    school_work: "Trabalho",
  };

  const formatGrade = (grade?: number | null) => {
    if (!grade || grade === 0) return "Sem nota atribuída";
    return grade;
  };

  const formatPoints = (points?: number | null) => {
    if (!points || points === 0) return "Sem pontos atribuídos";
    return points;
  };

  const handleEdit = (lesson: ILesson) => {
    router.push(`/lesson/form?id=${lesson._id}`);
  };

  const handleDelete = async (lessonId: string) => {
    try {
      const httpRequest = new HttpRequest();
      await httpRequest.removeLesson(lessonId);
      setLessons(lessons.filter((lesson) => lesson._id !== lessonId));
    } catch (error) {
      console.error("Erro ao deletar aula:", error);
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
                Nome
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
                Links
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Pontos
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Tipo
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Plano de aula
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
            {lessons.map((lesson) => (
              <TableRow key={lesson._id}>
                <TableCell className="px-5 py-4 text-start text-gray-800 text-theme-sm dark:text-white/90">
                  {lesson.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatDate(lesson.due_date)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatGrade(lesson.grade)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {lesson.links}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {formatPoints(lesson.points)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {typeLabels[lesson.type] || lesson.type}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {getLessonPlanNamesByExercise(lesson._id)}
                </TableCell>
                <TableCell className="px-4 py-3 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Button
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEdit(lesson)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleDelete(lesson._id)}
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
