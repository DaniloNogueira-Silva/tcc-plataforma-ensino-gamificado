"use client";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HttpRequest } from "@/utils/http-request";
import { CheckLineIcon, CloseLineIcon, TimeIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";

interface ExerciseListCardProps {
  list: IExerciseList;
  lessonPlanId: string;
}

const ExerciseListCard: React.FC<ExerciseListCardProps> = ({
  list,
  lessonPlanId,
}) => {
  const formattedDueDate = list.due_date
    ? new Date(list.due_date)
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
      const result = await httpRequest.isExerciseListCompleted(list._id);
      setCompleted(!!result.completed);
      setDeadlinePassed(!!result.deadlinePassed);
    };

    if (userType === "STUDENT") {
      checkCompleted();
    }
  }, [list._id, userType]);

  useEffect(() => {
    const fetchCounts = async () => {
      const httpRequest = new HttpRequest();

      if (lessonPlanId) {
        const students: { _id: string; name: string }[] =
          await httpRequest.findAllStudentsByLessonPlanId(lessonPlanId);
        setTotalStudents(students.length);

        const submissions: { _id: string; name: string }[] =
          await httpRequest.findAllStudentsByExerciseListId(list._id, lessonPlanId);
        const deliveredNames = submissions.map((sub) => sub.name);
        const deliveredIds = submissions.map((sub) => sub._id);
        setStudentsDeliveredList(deliveredNames);

        const notDelivered = students
          .filter((s) => !deliveredIds.includes(s._id))
          .map((s) => s.name);

        setStudentsNotDeliveredList(notDelivered);
        setDeliveredStudents(deliveredNames.length);
      }
    };

    if (userType === "TEACHER") {
      fetchCounts();
    }
  }, [lessonPlanId, list._id, userType]);

  const href =
    userType === "STUDENT"
      ? `/exercise_list/realize/${list._id}`
      : `/exercise_list/correction/${list._id}`;

  return (
    <>
      <Link href={href} passHref className="block">
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              Lista de Exercícios
            </p>
            <p className="text-[#121416] text-base font-bold leading-tight line-clamp-1">
              {list.name}
            </p>
            {formattedDueDate && (
              <p className="text-[#6a7581] text-sm font-normal leading-normal">
                Data de entrega: {formattedDueDate}
              </p>
            )}
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
                  ? "Entregado"
                  : deadlinePassed
                  ? "Não respondeu"
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

export default ExerciseListCard;
