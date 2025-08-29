"use client";

import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { HttpRequest } from "@/utils/http-request";
import { CheckLineIcon, CloseLineIcon, TimeIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { IUser } from "@/utils/interfaces/user.interface";

interface ExerciseListCardProps {
  list: IExerciseList;
  lessonPlanId: string;
}

const ExerciseListCard: React.FC<ExerciseListCardProps> = ({
  list,
  lessonPlanId,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);

  const [deliveryStatus, setDeliveryStatus] = useState<{
    totalStudents: number;
    deliveredStudents: number;
    studentsDeliveredList: string[];
    studentsNotDeliveredList: string[];
  } | null>(null);

  const [studentStatus, setStudentStatus] = useState<{
    completed: boolean;
    deadlinePassed: boolean;
  } | null>(null);

  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const httpRequest = useMemo(() => new HttpRequest(), []);

  const formattedDueDate = useMemo(() => {
    if (!dueDate) return "Não definida";
    return new Date(dueDate)
      .toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
  }, [dueDate]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const [associations, userData] = await Promise.all([
          httpRequest.getAssociationsByContent(list._id, "exercise_list"),
          httpRequest.getUserByRole(),
        ]);

        const relevantAssociation = associations.find(
          (assoc: any) => assoc.lesson_plan_id === lessonPlanId
        );
        if (relevantAssociation && relevantAssociation.due_date) {
          setDueDate(relevantAssociation.due_date);
        }

        const role = userData.role;
        setUserType(role);

        if (role === "TEACHER") {
          const [students, submissions] = await Promise.all([
            httpRequest.findAllStudentsByLessonPlanId(lessonPlanId),
            httpRequest.findAllStudentsByExerciseListId(list._id, lessonPlanId),
          ]);

          // **INÍCIO DA CORREÇÃO**
          // 1. Filtra as submissões para garantir que 'user_id' existe.
          const validSubmissions = submissions.filter(
            (sub: any) => sub && sub.user_id
          );

          // 2. Mapeia os dados a partir da lista filtrada e segura.
          const deliveredIds = new Set(
            validSubmissions.map((sub: any) => sub.user_id._id)
          );
          const deliveredNames = validSubmissions.map(
            (sub: any) => sub.user_id.name
          );
          // **FIM DA CORREÇÃO**

          const notDeliveredNames = students
            .filter((s: IUser) => !deliveredIds.has(s._id))
            .map((s: IUser) => s.name);

          setDeliveryStatus({
            totalStudents: students.length,
            deliveredStudents: deliveredNames.length,
            studentsDeliveredList: deliveredNames,
            studentsNotDeliveredList: notDeliveredNames,
          });
        } else if (role === "STUDENT") {
          const result = await httpRequest.isExerciseListCompleted(list._id);
          setStudentStatus({
            completed: !!result.completed,
            deadlinePassed: !!result.deadlinePassed,
          });
        }
      } catch (err) {
        console.error("Falha ao buscar dados da lista de exercícios:", err);
        setError("Não foi possível carregar as informações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [list._id, lessonPlanId, httpRequest]);

  const href =
    userType === "STUDENT"
      ? `/exercise_list/realize/${list._id}?lessonPlanId=${lessonPlanId}`
      : `/exercise_list/correction/${list._id}?lessonPlanId=${lessonPlanId}`;

  if (isLoading) {
    return (
      <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4 h-[116px] animate-pulse">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mt-1"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-4 rounded-xl bg-red-50 text-red-700 p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <Link href={href} passHref className="block">
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4">
          <div className="flex flex-[2_2_0px] flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[#6a7581] text-sm font-normal leading-normal">
                Lista de Exercícios
              </p>
              <p className="text-[#121416] text-base font-bold leading-tight line-clamp-1">
                {list.name}
              </p>
              <p className="text-[#6a7581] text-sm font-normal leading-normal">
                Data de entrega: {formattedDueDate}
              </p>
            </div>

            {userType === "STUDENT" && studentStatus && (
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit">
                {studentStatus.completed ? (
                  <CheckLineIcon className="text-success-500" />
                ) : studentStatus.deadlinePassed ? (
                  <CloseLineIcon className="text-red-500" />
                ) : (
                  <TimeIcon className="text-[#121416]" />
                )}
                <span className="truncate">
                  {studentStatus.completed
                    ? "Entregue"
                    : studentStatus.deadlinePassed
                    ? "Prazo esgotado"
                    : "Pendente"}
                </span>
              </button>
            )}

            {userType === "TEACHER" && deliveryStatus && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowStudentsModal(true);
                }}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit"
              >
                <span className="truncate">
                  {deliveryStatus.deliveredStudents}/
                  {deliveryStatus.totalStudents} entregas
                </span>
              </button>
            )}
          </div>
        </div>
      </Link>
      <Modal
        isOpen={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Status de Entrega</h3>
        {deliveryStatus && (
          <>
            <div className="mb-4">
              <h4 className="font-semibold">
                Entregaram ({deliveryStatus.studentsDeliveredList.length})
              </h4>
              <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                {deliveryStatus.studentsDeliveredList.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">
                Não Entregaram ({deliveryStatus.studentsNotDeliveredList.length}
                )
              </h4>
              <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                {deliveryStatus.studentsNotDeliveredList.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ExerciseListCard;
