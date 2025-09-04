"use client";

import { HttpRequest } from "@/utils/http-request";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { CheckLineIcon, CloseLineIcon, TimeIcon } from "@/icons";
import { IUser } from "@/utils/interfaces/user.interface";
import { ISubmission } from "@/utils/interfaces/ISubmission";
import { ILessonPlanContent } from "@/utils/interfaces/lesson_plan_content";

type UserRole = "STUDENT" | "TEACHER";
type DeliveryStatus = {
  totalStudents: number;
  deliveredStudents: number;
  studentsDeliveredList: string[];
  studentsNotDeliveredList: string[];
};

type StudentStatus = {
  completed: boolean;
  deadlinePassed: boolean;
};

type ExerciseCardProps = {
  exerciseId: string;
  statement: string;
  lessonPlanId: string;
  type: string;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseId,
  statement,
  lessonPlanId,
  type,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(
    null
  );
  const [studentStatus, setStudentStatus] = useState<StudentStatus | null>(
    null
  );
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);

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
          httpRequest.getAssociationsByContent(exerciseId, "exercise"),
          httpRequest.getUserByRole(),
        ]);

        const relevantAssociation = associations.find(
          (assoc: ILessonPlanContent) => assoc.lesson_plan_id === lessonPlanId
        );

        if (relevantAssociation && relevantAssociation.due_date) {
          setDueDate(relevantAssociation.due_date);
        }
        const { role } = userData;
        if (role === "STUDENT" || role === "TEACHER") {
          setUserType(role);

          if (role === "TEACHER") {
            const [students, submissions] = await Promise.all([
              httpRequest.findAllStudentsByLessonPlanId(lessonPlanId),
              httpRequest.findAllStudentsByExerciseId(exerciseId, lessonPlanId),
            ]);
            const deliveredIds = new Set(
              submissions.map((sub: ISubmission) => sub.user_id._id)
            );
            const deliveredNames = submissions.map(
              (sub: ISubmission) => sub.user_id.name
            );

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
            const result = await httpRequest.isExerciseCompleted(exerciseId);
            setStudentStatus({
              completed: !!result.completed,
              deadlinePassed: !!result.deadlinePassed,
            });
          }
        } else {
          throw new Error(`Papel de usuário inesperado: ${role}`);
        }
      } catch (err) {
        console.error("Falha ao buscar dados do exercício:", err);
        setError("Não foi possível carregar as informações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [exerciseId, lessonPlanId, httpRequest]);

  const href =
    userType === "STUDENT"
      ? `/exercise/realize/${exerciseId}?lessonPlanId=${lessonPlanId}`
      : `/exercise/correction/${exerciseId}?lessonPlanId=${lessonPlanId}`;

  const typeLabels: Record<string, string> = {
    open: "Aberta",
    multiple_choice: "Múltipla Escolha",
    true_false: "Verdadeiro ou Falso",
  };

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
                {typeLabels[type] || "Tipo Desconhecido"}
              </p>
              <p className="text-[#121416] text-base font-bold leading-tight line-clamp-1">
                {statement}
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

export default ExerciseCard;
