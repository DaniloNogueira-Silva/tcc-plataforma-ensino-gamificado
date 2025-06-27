"use client";

import { useRouter } from "next/navigation";

type LessonCardProps = {
  lessonId: string;
  name: string;
  content: string;
  points: number;
  dueDate: string;
  links: string;
  type: string;
  grade: number;
  lessonPlanId: string;
  onUpdateSuccess: () => void;
};

const LessonCard: React.FC<LessonCardProps> = ({
  lessonId,
  name,
  content,
  type,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/lesson/details/${lessonId}`);
  };

  const typeLabels: Record<string, string> = {
    reading: "Leitura",
    school_work: "Trabalho",
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              {typeLabels[type] || type}
            </p>
            <p className="text-[#121416] text-base font-bold leading-tight">
              {name}
            </p>
            <p className="text-[#6a7581] text-sm font-normal leading-normal">
              {content}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonCard;
