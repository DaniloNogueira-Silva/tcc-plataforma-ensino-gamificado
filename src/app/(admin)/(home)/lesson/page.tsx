"use client";

import LessonTable from "@/components/lesson/LessonTable";
import { useRouter } from "next/navigation";

const Lessons = () => {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aulas</h1>
        <button
          className="rounded-lg bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-600"
          onClick={() => router.push("/lesson/form")}
        >
          Criar aula
        </button>
      </div>

      <div className="space-y-6 mt-5">
        <LessonTable />
      </div>
    </div>
  );
};

export default Lessons;
