"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ExerciseTable from "@/components/exercise/ExerciseTable";
import { HttpRequest } from "@/utils/http-request";
import { IExercise } from "@/utils/interfaces/exercise.interface";

const Exercises = () => {
  const [exercises, setExercises] = useState<IExercise[]>([]);
  const httpRequest = new HttpRequest();
  const router = useRouter();

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
          onClick={() => router.push("/exercise/form")}
        >
          Criar exercício
        </button>
      </div>

      <div className="space-y-6 mt-5">
        <ExerciseTable />
      </div>
    </div>
  );
};

export default Exercises;
