"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import LessonForm from "@/components/lesson/LessonForm";

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
  points,
  dueDate,
  links,
  type,
  grade,
  lessonPlanId,
  onUpdateSuccess,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async () => {
    const httpRequest = new HttpRequest();
    await httpRequest.removeLesson(lessonId);
    onUpdateSuccess();
  };

  const typeLabels: Record<string, string> = {
    reading: "Leitura",
    school_work: "Trabalho",
  };

  return (
    <>
      <div className="relative group">
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
          <div
            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
            style={{ backgroundImage: `url("${links}")` }}
          ></div>
        </div>

        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 rounded-xl">
          <button
            onClick={() => setEditModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
            title="Editar"
          >
            <PencilIcon size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-100 transition"
            title="Deletar"
          >
            <Trash2Icon size={18} />
          </button>
        </div>
      </div>

      {editModalOpen && (
        <LessonForm
          initialData={{
            _id: lessonId,
            name,
            content,
            points,
            due_date: dueDate,
            links,
            type,
            grade,
            lesson_plan_id: lessonPlanId,
          }}
          reloadOnSubmit={false}
          onCreated={() => onUpdateSuccess()}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default LessonCard;
