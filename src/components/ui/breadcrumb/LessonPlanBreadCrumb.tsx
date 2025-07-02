import React from "react";

interface LessonPlanBreadcrumbProps {
  lessonPlanId?: string | null;
  lessonPlanName?: string | null;
  currentName: string;
}

export default function LessonPlanBreadcrumb({
  lessonPlanId,
  lessonPlanName,
  currentName,
}: LessonPlanBreadcrumbProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {lessonPlanId && lessonPlanName ? (
        <a
          className="text-[#4e7097] text-base font-medium leading-normal"
          href={`/lesson-plan/details/${lessonPlanId}`}
        >
          {lessonPlanName}
        </a>
      ) : (
        <span className="text-[#4e7097] text-base font-medium leading-normal">
          Plano de aula
        </span>
      )}
      <span className="text-[#4e7097] text-base font-medium leading-normal">
        /
      </span>
      <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis text-[#0e141b] text-base font-medium leading-normal max-w-[600px]">
        {currentName}
      </span>
    </div>
  );
}
