"use client";

import { useEffect, useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import LessonPlanCard from "./LessonPlanCard";
import Link from "next/link";

export default function LessonPlanList() {
  const [lessonPlan, setLessonPlan] = useState<ILessonPlanByRole[]>([]);

  const fetchData = async () => {
    const httpRequest = new HttpRequest();
    const lessonPlans = await httpRequest.getLessonPlansByRole();
    setLessonPlan(lessonPlans);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {lessonPlan.map((plan) => {
        const iconPath = plan?.lessonplan?.icon;
        const imgUrl = iconPath
          ? `/images/brand/${iconPath}.svg`
          : "/images/brand/brand-01.svg";

        return (
          <Link key={plan?.lessonplan?._id} href={`/lesson-plan/details/${plan.lessonplan._id}`}>
            <LessonPlanCard
              imgUrl={imgUrl}
              lessonPlanId={plan?.lessonplan?._id}
              lessonPlanName={plan?.lessonplan?.name}
              progress={plan.progress}
              teacherName={plan?.teacher?.name}
              onUpdateSuccess={fetchData}
            />
          </Link>
        );
      })}
    </div>
  );
}
