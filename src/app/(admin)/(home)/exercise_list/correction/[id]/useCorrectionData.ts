import { useState, useEffect } from "react";
import { HttpRequest } from "@/utils/http-request";
import { IExerciseList } from "@/utils/interfaces/exercise_list.interface";
import { StudentAnswer } from "@/utils/interfaces/correction.types";
import { ILessonPlanByRole } from "@/utils/interfaces/lesson-plan.interface";

export const useCorrectionData = (listId: string | null) => {
  const [studentsAnswers, setStudentsAnswers] = useState<StudentAnswer[]>([]);
  const [exerciseList, setExerciseList] = useState<IExerciseList | null>(null);
  const [lessonPlanInfo, setLessonPlanInfo] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const httpRequest = new HttpRequest();

      try {
        const associations = await httpRequest.getAssociationsByContent(
          listId,
          "exercise_list"
        );

        if (!associations || associations.length === 0) {
          throw new Error(
            "Não foi possível encontrar um plano de aula associado a esta lista de exercícios."
          );
        }

        const planId = associations[0].lesson_plan_id;

        const [progresses, listData, allPlans] = await Promise.all([
          httpRequest.findStudentsAnswersByExerciseListId(listId, planId), 
          httpRequest.getExerciseListById(listId),
          httpRequest.getLessonPlansByRole(),
        ]);

        const [studentsWithAttempts, exercises] = await Promise.all([
          Promise.all(
            progresses.map(async (prog: StudentAnswer) => {
              const attempts =
                await httpRequest.getExerciseListAttemptsByUserProgress(
                  prog._id
                );
              return { ...prog, attempts } as StudentAnswer;
            })
          ),
          Promise.all(
            listData.exercises_ids.map((id: string) =>
              httpRequest.getExerciseById(id)
            )
          ),
        ]);

        setStudentsAnswers(studentsWithAttempts);
        setExerciseList({ ...listData, exercises });

        const foundPlan = allPlans.find(
          (p: ILessonPlanByRole) => p.lessonplan._id === planId
        );
        if (foundPlan) {
          setLessonPlanInfo({ id: planId, name: foundPlan.lessonplan.name });
        } else {
          setLessonPlanInfo({ id: planId, name: "Plano de Aula desconhecido" });
        }
      } catch (err: any) {
        console.error("Erro ao buscar dados da correção:", err);
        setError(
          err.message ||
            "Não foi possível carregar os dados. Tente recarregar a página."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [listId]);

  return {
    studentsAnswers,
    setStudentsAnswers,
    exerciseList,
    lessonPlanInfo,
    isLoading,
    error,
  };
};
