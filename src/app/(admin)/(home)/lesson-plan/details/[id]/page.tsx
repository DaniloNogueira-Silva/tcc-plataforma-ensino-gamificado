"use client";

import { useParams } from "next/navigation";
import LessonList from "@/components/lesson/LessonList";
import ExerciseList from "@/components/exercise/ExerciseList";

export default function DetailsPage() {
  const params = useParams();
  const lessonPlanId = params.id as string;

  if (!lessonPlanId) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Detalhes do Plano de Aula</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Aulas</h2>
        <LessonList lessonPlanId={lessonPlanId} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Exercícios</h2>
        <ExerciseList lessonPlanId={lessonPlanId} />
      </section>
    </div>
  );
}
