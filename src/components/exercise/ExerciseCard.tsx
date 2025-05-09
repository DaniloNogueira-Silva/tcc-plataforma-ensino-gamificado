"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { HttpRequest } from "@/utils/http-request";
import ExerciseForm from "@/components/exercise/ExerciseForm"; // ajuste o caminho se necessário

type ExerciseCardProps = {
  exerciseId: string;
  statement: string;
  answer: string;
  showAnswer: boolean;
  type: "open" | "multiple_choice" | "true_false";
  options?: any[];
  onUpdateSuccess: () => void;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseId,
  statement,
  answer,
  showAnswer,
  type,
  options = [],
  onUpdateSuccess,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async () => {
    const httpRequest = new HttpRequest();
    await httpRequest.removeExercise(exerciseId);
    onUpdateSuccess();
  };

  return (
    <>
      <div className="relative group rounded-2xl border border-gray-200 bg-white px-6 pb-5 pt-6 overflow-hidden transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 z-10 relative">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {statement}
          </h3>
          <span className="block text-sm text-gray-600 dark:text-gray-400">
            Resposta: {answer}
          </span>
          <span className="block text-sm text-indigo-600 font-medium mt-1">
            Mostrar resposta: {showAnswer ? "Sim" : "Não"}
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
        
        <ExerciseForm
          initialData={{
            _id: exerciseId,
            statement,
            answer,
            type,
            showAnswer,
            options,
          }}
          reloadOnSubmit={false}
          onCreated={() => onUpdateSuccess()}s
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default ExerciseCard;
