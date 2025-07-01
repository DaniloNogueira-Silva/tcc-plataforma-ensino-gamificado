"use client";

import { HttpRequest } from "@/utils/http-request";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CheckLineIcon, CloseLineIcon, TimeIcon } from "@/icons";

type ExerciseCardProps = {
  exerciseId: string;
  statement: string;
  dueDate: string;
  lessonPlanId: string;
  type: string;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseId,
  statement,
  dueDate,
  lessonPlanId,
  type,
}) => {
  const formattedDueDate = dueDate
    ? new Date(dueDate)
        .toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(",", "")
    : "";

  const [userType, setUserType] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [deliveredStudents, setDeliveredStudents] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [deadlinePassed, setDeadlinePassed] = useState<boolean>(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsDeliveredList, setStudentsDeliveredList] = useState<string[]>(
    []
  );
  const [studentsNotDeliveredList, setStudentsNotDeliveredList] = useState<
    string[]
  >([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const httpRequest = new HttpRequest();
      const result = await httpRequest.getUserByRole();
      setUserType(result.role);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const checkCompleted = async () => {
      const httpRequest = new HttpRequest();
      const result = await httpRequest.isExerciseCompleted(exerciseId);
      setCompleted(!!result.completed);
      setDeadlinePassed(!!result.deadlinePassed);
    };

    if (userType === "STUDENT") {
      checkCompleted();
    }
  }, [exerciseId, userType]);

  useEffect(() => {
    const fetchCounts = async () => {
      const httpRequest = new HttpRequest();

      if (lessonPlanId) {
        const students = await httpRequest.findAllStudentsByLessonPlanId(
          lessonPlanId
        );

        setTotalStudents(students.length);

        const submissions = await httpRequest.findAllStudentsByExerciseId(
          exerciseId
        );

        const deliveredNames = submissions.map((sub: any) => sub.user_id.name);
        const deliveredIds = submissions.map((sub: any) => sub.user_id._id);

        setStudentsDeliveredList(deliveredNames);

        const notDelivered = students
          .filter((s: any) => !deliveredIds.includes(s._id))
          .map((s: any) => s.name);

        setStudentsNotDeliveredList(notDelivered);
        setDeliveredStudents(deliveredNames.length);
      }
    };

    fetchCounts();
  }, [lessonPlanId, exerciseId]);

  const href =
    userType === "STUDENT"
      ? `/exercise/realize/${exerciseId}`
      : `/exercise/correction/${exerciseId}`;

  const typeLabels: Record<string, string> = {
    open: "Aberta",
    multiple_choice: "Múltipla Escolha",
    true_false: "Verdadeiro ou Falso",
  };
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
            {userType === "STUDENT" && (
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit">
                {completed ? (
                  <CheckLineIcon className="text-success-500" />
                ) : deadlinePassed ? (
                  <CloseLineIcon className="text-red-500" />
                ) : (
                  <TimeIcon className="text-[#121416]" />
                )}
                <span className="truncate">
                  {completed
                    ? "Completado"
                    : deadlinePassed
                    ? "Não feito"
                    : "Não entregue"}
                </span>
              </button>
            )}
            {userType === "TEACHER" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowStudentsModal(true);
                }}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit"
              >
                <span className="truncate">
                  {deliveredStudents}/{totalStudents}
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
        <h3 className="text-lg font-semibold mb-4">Entregas</h3>
        <div className="mb-4">
          <h4 className="font-semibold">Entregaram</h4>
          <ul className="list-disc pl-5">
            {studentsDeliveredList.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Não Entregaram</h4>
          <ul className="list-disc pl-5">
            {studentsNotDeliveredList.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default ExerciseCard;
