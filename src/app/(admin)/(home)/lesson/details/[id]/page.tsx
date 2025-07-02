"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HttpRequest } from "@/utils/http-request";
import { ILesson } from "@/utils/interfaces/lesson.interface";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";
import LessonPlanBreadcrumb from "@/components/ui/breadcrumb/LessonPlanBreadcrumb";

const LessonDetailsPage = () => {
  const params = useParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [lessonPlanId, setLessonPlanId] = useState<string | null>(null);
  const [lessonPlanName, setLessonPlanName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId) return;
      const httpRequest = new HttpRequest();
      const data = await httpRequest.getLessonById(lessonId);
      setLesson(data);

      try {
        const associations = await httpRequest.getAssociationsByContent(
          lessonId,
          "lesson"
        );
        if (associations && associations.length > 0) {
          const planId = associations[0].lesson_plan_id;
          setLessonPlanId(planId);
          const plans: ILessonPlanByRole[] =
            await httpRequest.getLessonPlansByRole();
          const found = plans.find((p) => p.lessonplan._id === planId);
          if (found) {
            setLessonPlanName(found.lessonplan.name);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar plano de aula:", error);
      }
    }

    fetchLesson();
  }, [lessonId]);

  if (!lesson) return <div>Carregando...</div>;

  const formattedDate = lesson.due_date
    ? new Date(lesson.due_date).toLocaleDateString()
    : null;

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <LessonPlanBreadcrumb
          lessonPlanId={lessonPlanId}
          lessonPlanName={lessonPlanName}
          currentName={lesson.name}
        />
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight text-justify">
              {lesson.name}
            </p>
            {formattedDate && lesson.type !== "reading" && (
              <p className="text-[#4e7097] text-sm font-normal leading-normal">
                Data de entrega: {formattedDate}
              </p>
            )}
          </div>
        </div>
        <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Descrição
        </h2>
        <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4 whitespace-pre-wrap break-words text-justify">
          {lesson.content}
        </p>
        {lesson.links && (
          <>
            <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Recursos
            </h2>
            <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                  </svg>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                    {lesson.name}
                  </p>
                  <p className="text-[#4e7097] text-sm font-normal leading-normal line-clamp-2">
                    Link
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <a
                  href={lesson.links}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-medium leading-normal w-fit"
                >
                  <span className="truncate">Abrir</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonDetailsPage;
