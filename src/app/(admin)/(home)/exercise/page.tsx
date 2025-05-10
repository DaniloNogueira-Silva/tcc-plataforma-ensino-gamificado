"use client";

import { useEffect, useState } from "react";

import ExerciseForm from "@/components/exercise/ExerciseForm";
import ExerciseTable from "@/components/exercise/ExerciseTable";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";
import { Modal } from "@/components/ui/modal";

const Exercises = () => {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const httpRequest = new HttpRequest();

  useEffect(() => {
    const fetchAllExercises = async () => {
      try {
        const allExercises = await httpRequest.getAllExercises();
        setExercises(allExercises);
      } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
      }
    };

    fetchAllExercises();
  }, []);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercícios</h1>
        <button
          className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
          onClick={() => setIsFormOpen(true)}
        >
          Criar exercício
        </button>
      </div>

      <div className="space-y-6 mt-5">
        <ExerciseTable />
      </div>

      {isFormOpen && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <div className="max-w-[584px] p-5 lg:p-10 mx-auto">
            <h3 className="mb-4 text-xl font-bold">Criar Exercício</h3>
            <ExerciseForm
              reloadOnSubmit={true}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Exercises;
