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
      <div className="relative group rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 overflow-hidden transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 z-10 relative">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {name}
          </h3>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Conteúdo: {content}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Pontos: {points}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Data de Entrega: {new Date(dueDate).toLocaleDateString()}
          </span>
          <span className="block text-sm text-indigo-600 font-medium mt-1">
            Tipo: {typeLabels[type] || type}
          </span>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Nota: {grade}
          </span>
        </div>

        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 z-20">
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
