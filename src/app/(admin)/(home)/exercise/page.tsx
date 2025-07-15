"use client";

import { useRouter } from "next/navigation";
import ExerciseTable from "@/components/exercise/ExerciseTable";

const Exercises = () => {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercícios</h1>
        <div className="flex gap-2">
          <button
            className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
            onClick={() => router.push("/exercise/form")}
          >
            Criar exercício
          </button>
          <button
            className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
            onClick={() => router.push("/exercise_list/form")}
          >
            Criar Lista de Exercício
          </button>
        </div>
      </div>

      <div className="space-y-6 mt-5">
        <ExerciseTable />
      </div>
    </div>
  );
};

export default Exercises;
