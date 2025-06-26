"use client";

import { HttpRequest } from "@/utils/http-request";
import Link from "next/link";
import { useEffect, useState } from "react";

type ExerciseCardProps = {
  exerciseId: string;
  statement: string;
  dueDate: string;
  lessonPlanId: string;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseId,
  statement,
  dueDate,
  lessonPlanId,
}) => {
  const formattedDueDate = dueDate
    ? new Date(dueDate).toISOString().split("T")[0]
    : "";

  const [userType, setUserType] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [deliveredStudents, setDeliveredStudents] = useState<number>(0);

  useEffect(() => {
    const fetchUserRole = async () => {
      const httpRequest = new HttpRequest();
      const result = await httpRequest.getUserByRole();
      setUserType(result.role);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const httpRequest = new HttpRequest();

      if (lessonPlanId) {
        const students = await httpRequest.findAllStudentsByLessonPlanId(
          lessonPlanId
        );
        setTotalStudents(students);
      }

      const submissions = await httpRequest.findAllStudentsByExerciseId(
        exerciseId
      );
      const delivered = Array.isArray(submissions)
        ? submissions.length
        : submissions?.length ?? 0;
      setDeliveredStudents(delivered);
      console.log(delivered);
    };

    fetchCounts();
  }, [lessonPlanId, exerciseId]);

  const href =
    userType === "STUDENT"
      ? `/exercise/realize/${exerciseId}`
      : `/exercise/correction/${exerciseId}`;

  return (
    <Link href={href} passHref className="block">
      <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4">
        <div className="flex flex-[2_2_0px] flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              Exercise
            </p>
            <p className="text-[#121416] text-base font-bold leading-tight">
              {statement}
            </p>
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              Data de entrega: {formattedDueDate}
            </p>
          </div>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit">
            <div
              className="text-[#121416]"
              data-icon="Check"
              data-size="18px"
              data-weight="regular"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18px"
                height="18px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
            </div>
            <span className="truncate">Complete</span>
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#f1f2f4] text-[#121416] pr-2 gap-1 text-sm font-medium leading-normal w-fit">
            <span className="truncate">
              {deliveredStudents}/{totalStudents}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ExerciseCard;
