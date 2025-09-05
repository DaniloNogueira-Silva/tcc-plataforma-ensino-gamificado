"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ExerciseTable from "@/components/exercise/ExerciseTable";
import ExerciseListTable from "@/components/exercise-list/ExerciseListTable";

const Exercises = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("exercises");

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mt-3 flex items-center justify-between">
        <div className="flex-grow flex gap-2">
          <button
            className={`px-4 py-2 font-bold ${
              activeTab === "exercises"
                ? "border-b-2 border-brand-500 text-brand-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("exercises")}
          >
            Exercícios
          </button>
          <button
            className={`px-4 py-2 font-bold ${
              activeTab === "exercise_lists"
                ? "border-b-2 border-brand-500 text-brand-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("exercise_lists")}
          >
            Listas de Exercício
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === "exercises" ? (
            <button
              className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
              onClick={() => router.push("/exercise/form")}
            >
              Criar exercício
            </button>
          ) : (
            <button
              className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
              onClick={() => router.push("/exercise_list/form")}
            >
              Criar Lista de Exercício
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 mt-5">
        {activeTab === "exercises" ? <ExerciseTable /> : <ExerciseListTable />}
      </div>
    </div>
  );
};

export default Exercises;
