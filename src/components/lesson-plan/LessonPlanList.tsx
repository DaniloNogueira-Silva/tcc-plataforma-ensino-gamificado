'use client';

import { useEffect, useState } from "react";

import { HttpRequest } from "@/utils/http-request";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import LessonPlanCard from "./LessonPlanCard";

export default function LessonPlanList(lessonPlans: any) {
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
      {lessonPlan.map((plan, i) => {
        const iconPath = plan?.lessonplan?.icon;

        const imgUrl = iconPath
          ? `/images/brand/${iconPath}.svg`
          : "/images/brand/brand-01.svg";

        return (
          <LessonPlanCard
            key={i + 1}
            imgUrl={imgUrl}
            lessonPlanId={plan?.lessonplan?._id}
            lessonPlanName={plan?.lessonplan?.name}
            progress={plan.progress}
            teacherName={plan?.teacher?.name}
            onUpdateSuccess={fetchData}
          />
        );
      })}
    </div>
  );
}
